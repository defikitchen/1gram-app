import { getPrices } from "@/sdk/ton-node-api";
import { defaultTokens, PriceResponse, tokenList } from "@/sdk/ccc";
import { computed, Ref, ref } from "@vue/composition-api";
import BigNumber from "bignumber.js";
import { ERC20AccountInfo, ERC20TokenInfo } from "@/models/erc20";
import { Wallet } from "@/models/wallet";
import { useERC20 } from "./use-erc20";
import { uniq, uniqBy } from "lodash";
import { useVuex } from "./use-vuex";
import { fromCache, getCache, setCache } from "@/lib/cache";
import { FiatSymbol } from "@/sdk/fiat/fiat-response";
import { getFiatRates } from "@/sdk/fiat";
import { fiatMap, Currency } from "@/sdk/fiat/fiat-map";
import { Price } from "@/sdk/ccc/price";
import { getEthRate } from "@/sdk/web3/uniswap";

let prices: Ref<PriceResponse | null>;
let tokenPrices: Ref<ERC20TokenInfo[] | null>;
let fiatPricesList: Ref<Currency[] | null>;
let baseCurrencyCode: Ref<FiatSymbol | string | null>;
let lastFetched: Ref<number | null>;

export const usePrices = (tokens: number[] = defaultTokens) => {
  const updatePrices = async (force?: boolean) => {
    console.log("[polling] price data");
    const { store } = useVuex();
    if (!force && fromCache(lastFetched.value)) return true;

    lastFetched.value = new Date().getTime();
    setCache("lastFetched", lastFetched.value);
    await Promise.all([
      listFiatPrices(),
      listTokens(
        store.state.Common.Wallet.wallets,
        store.getters.Common.Wallet.wallet as Wallet
      )
    ]);
    return true;
  };
  lastFetched = lastFetched = ref<number | null>(getCache("lastFetched", null));
  prices = prices || ref<PriceResponse | null>(getCache("prices", null));
  fiatPricesList =
    fiatPricesList || ref<Currency[] | null>(getCache("fiatPrices", []));
  tokenPrices =
    tokenPrices || ref<ERC20AccountInfo[] | null>(getCache("tokenPrices", []));
  baseCurrencyCode =
    baseCurrencyCode || ref<FiatSymbol>(getCache("baseCurrencyCode", "USD"));

  const ethPrice = computed(
    () => prices?.value?.data[tokenList.ETH]?.quote.USD.price || 0
  );

  const initBasePrices = async () => {
    console.log("[initBasePrices]");
    const cacheTime = new Date(
      (prices && prices.value?.status.timestamp) || 0
    ).getTime();
    if (fromCache(cacheTime)) return prices.value;
    return getPrices(tokens).then(res => {
      prices.value = res;
      setCache("prices", prices.value);
      return res;
    });
  };

  const fiatPrices = computed(() => {
    const pricesAsFiat: Currency[] = (prices.value?.data
      ? Object.entries(prices.value?.data)
      : []
    ).map(([key, value]) => {
      const val = value as Price;
      const price: Currency = {
        code: val.symbol,
        name: val.name,
        usdRate: 1 / val.quote.USD.price,
        decimalDigits: 2,
        namePlural: val.name + "s",
        rounding: 0,
        symbol: val.symbol,
        symbolNative: val.symbol
      };
      return price;
    });
    const tokenPricesAsFiat: Currency[] = (
      (tokenPrices && tokenPrices.value) ||
      []
    ).map(price => {
      const val: Currency = {
        code: price.symbol,
        name: price.name,
        usdRate: price.usdtRate
          ? +price.usdtRate === 0
            ? 1
            : 1 / +price.usdtRate
          : 0,
        decimalDigits: 2,
        namePlural: price.name + "s",
        rounding: 0,
        symbol: price.symbol,
        symbolNative: price.symbol
      };
      return val;
    });
    const _prices = (fiatPricesList && fiatPricesList.value) || [];
    const list = [...pricesAsFiat, ...tokenPricesAsFiat, ..._prices];
    const filtered = list
      .filter(
        c =>
          !isNaN(c.usdRate) &&
          c.code !== baseCurrencyCode.value &&
          c.code !== "USD"
      )
      .sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 0));
    return uniqBy(
      [
        ...list.filter(c => c.code === baseCurrencyCode.value),
        ...list.filter(c => c.code === "USD"),
        ...filtered
      ],
      "code"
    );
  });

  const setBaseCurrency = (code: FiatSymbol | string) => {
    baseCurrencyCode.value = code;
    setCache("baseCurrencyCode", code);
    return baseCurrency.value;
  };

  const baseCurrency = computed(
    () =>
      (fiatPrices.value || []).find(
        price => price.code === baseCurrencyCode.value
      ) || {
        ...fiatMap.USD,
        usdRate: 1
      }
  );

  const asBaseCurrency = (value: number | string | BigNumber) => {
    return new BigNumber(value).times(baseCurrency.value.usdRate).toString();
  };

  const tokenByAddress = (address: string) => {
    return ((tokenPrices && tokenPrices.value) || []).find(
      t => t.address === address
    );
  };

  const listFiatPrices = () => {
    return getFiatRates().then(({ data }) => {
      fiatPricesList.value = data;
      setCache("fiatPrices", data);
      return data;
    });
  };

  const listTokens = async (wallets: Wallet[], wallet: Wallet) => {
    const { getSuspectedERC20Adresses, getERC20TokenInfo } = useERC20();
    const addresses = wallets.map(getSuspectedERC20Adresses);
    const addressedFlat = uniq(
      addresses.reduce((acc, curr) => [...acc, ...curr], [])
    ).filter(a => a !== wallet.address);
    addressedFlat.forEach(a => {
      const exists = (tokenPrices.value || []).find(price => price.address);
      if (fromCache(exists?.lastFetched)) return;
      getERC20TokenInfo(wallet, a).then(async token => {
        if (!token) return;
        const priceInEth = await getEthRate(token, wallet.network.name);
        token.usdtRate = new BigNumber(priceInEth)
          .times(ethPrice.value)
          .toString();
        tokenPrices.value = uniqBy(
          [token, ...(tokenPrices.value || [])],
          "address"
        );
        setCache("tokenPrices", tokenPrices.value || []);
      });
    });
  };
  return {
    prices,
    tokenPrices,
    fiatPrices,
    listFiatPrices,
    baseCurrency,
    setBaseCurrency,
    baseCurrencyCode,
    asBaseCurrency,
    updatePrices,
    initBasePrices,
    tokenByAddress,
    lastFetched
  };
};

export const useUsdPrice = (
  networkId: number,
  value?: string | number | BigNumber,
  decimals?: number,
  prices?: Ref<PriceResponse | null>
) => {
  const val = new BigNumber(value || 0);
  const price = new BigNumber(
    prices?.value?.data[networkId]?.quote.USD.price || 0
  );
  const total = val
    .times(price)
    .div(10 ** (decimals || 0))
    .decimalPlaces(2)
    .toString();
  return total;
};

export const useUsdTokenPrice = (
  tokenAddress: string,
  value?: string | number | BigNumber,
  decimals?: number,
  tokenPrices?: Ref<ERC20TokenInfo[] | null>
) => {
  const val = new BigNumber(value || 0);
  const price = new BigNumber(
    tokenPrices?.value?.find(t => t.address === tokenAddress)?.usdtRate || 0
  );
  const total = val
    .times(price)
    .div(10 ** (decimals || 0))
    .decimalPlaces(2)
    .toString();
  return total;
};
