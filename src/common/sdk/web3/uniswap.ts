import { Ethers, getAlchemyWeb3, getProvider } from "./client";
import { Token, ChainId, Fetcher } from "@uniswap/sdk";
import { ERC20AccountInfo, ERC20TokenInfo } from "@/common/models/erc20";
import { defaultTokenList } from "@/common/lib/constants";
import { add } from "lodash";

const getToken = (
  { address, decimals, symbol, name }: ERC20TokenInfo | ERC20AccountInfo,
  chainId = ChainId.MAINNET
): Token => {
  return new Token(
    chainId,
    Ethers.utils.getAddress(address),
    decimals,
    symbol,
    name
  );
};

const getEthRate = (
  token: ERC20AccountInfo | ERC20TokenInfo,
  network: string | Ethers.providers.Network = "mainnet"
) => {
  return getExchangeRate(defaultTokenList.WETH, token, network);
};

const getEthUsdRate = (
  network: string | Ethers.providers.Network = "mainnet"
) => {
  return getProvider(network)
    .getEtherPrice()
    .then(r => {
      return r.toString();
    });
};

const getTokenInfo = async (
  address: string,
  network: string | Ethers.providers.Network = "mainnet",
  useFetcher = false
) => {
  if (!useFetcher) {
    const networkName =
      typeof network === "string" ? network : network?.name || "mainnet";
    const metaData = await getAlchemyWeb3(networkName)
      .alchemy.getTokenMetadata(address)
      .catch(console.warn);
    if (!metaData) return;
    const mapped: ERC20TokenInfo = {
      address,
      decimals: metaData.decimals || 0,
      logo: metaData.logo || undefined,
      symbol: metaData.symbol || "",
      name: metaData.name || "",
      lastFetched: new Date().getTime()
    };
    return mapped;
  } else {
    const provider = getProvider(network);
    const info = await Fetcher.fetchTokenData(
      provider.network.chainId,
      address,
      provider
    ).catch(console.warn);
    if (!info) return null;
    const mapped: ERC20TokenInfo = {
      address,
      decimals: info.decimals,
      lastFetched: new Date().getTime(),
      name: info.name || info.symbol || "",
      symbol: info.symbol || "",
      totalSupply: ""
    };
    return mapped;
  }
};

const getExchangeRate = async (
  token0: ERC20AccountInfo | ERC20TokenInfo,
  token1: ERC20AccountInfo | ERC20TokenInfo,
  network: string | Ethers.providers.Network = "mainnet"
) => {
  try {
    const pair = await Fetcher.fetchPairData(
      getToken(token0),
      getToken(token1),
      getProvider(network)
    );
    const price = pair.priceOf(getToken(token1)).toSignificant(6);
    console.log(`[xeRate] ${token0.symbol}-${token1.symbol} ${price}`);
    return price;
  } catch {
    // no uniswap pair
    return "0";
  }
};

export { getExchangeRate, getEthRate, getEthUsdRate, getTokenInfo };
