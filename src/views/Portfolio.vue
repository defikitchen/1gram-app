<template>
  <Page>
    <portal to="nav-actions">
      <v-btn icon small @click="update(true)">
        <v-icon :class="{ 'unclickable spin': updating }">refresh</v-icon>
      </v-btn>
    </portal>
    <portal to="page-title"
      ><span
        class="clickable-bg"
        @click="$router.push('?modal=walletMenu&redirect=/wallet')"
        >Portfolio <v-icon small class="mx-n1">expand_more</v-icon></span
      ></portal
    >
    <PageSubtitle v-if="wallets.length > 0">Total balance</PageSubtitle>
    <PageHeader :width="500" v-if="wallets.length > 0 && wallet">
      <v-list two-line subheader class="list--clean pa-0 text-center">
        <v-list-item>
          <v-list-item-content class="total-amount">
            <v-list-item-title
              class="mt-6 mb-0 total-amount__amount overflow-initial"
            >
              <span
                @click="$router.push('?modal=currency')"
                class="clickable-bg"
              >
                {{ token(balance, "", 0, 2)
                }}<small class="total-amount__amount__symbol">{{
                  (baseCurrency && baseCurrency.code) || "USD"
                }}</small>
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </PageHeader>
    <PageContent :width="500" :flex="wallets.length < 1">
      <div class="box ma-auto" v-if="wallets.length < 1">
        <div class="box__content">
          <div class="display-2 mb-4">
            <img
              src="@/assets/1gram-type.svg"
              style="width: 40; vertical-align: top; margin-right: .2em"
              alt="1GRAM"
            />
          </div>

          <div class="body-1 mt-2 slightly-transparent">
            {{ settings.description }}
          </div>
        </div>
      </div>

      <template v-for="(_wallets, name, index) in groupedWallets" v-else>
        <v-subheader class="px-0" :key="'h-' + index"
          >{{ networkByName(name).name }}<v-spacer /><span
            class="text-m"
            v-if="networkByName(name).etherscanId"
            >1 {{ networkByName(name).symbol }}
            ≈
            {{
              token(asBaseCurrency(networkRate(name)), baseCurrency.code, 0, 2)
            }}</span
          ></v-subheader
        >

        <v-card class="mb-4" :key="index">
          <WalletItem
            v-for="(wallet, i) of orderBy(_wallets, 'name')"
            :wallet="wallet"
            :key="'wal-' + i"
            :inset="false"
            :divider="i !== 0"
            @open="open"
          />
        </v-card>
      </template>

      <v-subheader class="px-0 mt-4" v-if="wallets.length > 0">
        <v-spacer />
        <span class="half-transparent text-m" v-if="lastFetched"
          >Updated {{ fromNow(lastFetched) }}</span
        >
      </v-subheader>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn block large color="accent" to="?modal=walletMenu&createOnly=true">
        <v-icon left>add</v-icon> Add Wallet
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Wallet } from "@/models/wallet";
import { usePrices, useUsdPrice, useUsdTokenPrice } from "@/hooks/use-prices";
import { useVuex } from "@/hooks/use-vuex";
import { useRouter } from "@/hooks/use-router";
import {
  computed,
  watch,
  onMounted,
  defineComponent
} from "@vue/composition-api";
import Vue2Filters from "vue2-filters";
import { useFilters } from "@/lib/format";
import { Network } from "@/models/network";

export default defineComponent({
  mixins: [Vue2Filters.mixin],
  setup(_, ctx) {
    const {
      prices,
      tokenPrices,
      baseCurrency,
      updatePrices,
      lastFetched,
      asBaseCurrency
    } = usePrices();
    const { store } = useVuex();
    const router = useRouter();

    const open = (wallet: Wallet) => {
      const { commit } = store;
      store.commit.Wallet.setWallet(wallet);
      router.push("/wallet");
    };

    const updating = computed(() => store.state.Wallet.updatingAll);
    const wallets = computed(() => store.state.Wallet?.wallets || []);
    const wallet = computed(() => store.getters.Wallet.wallet);
    const network = computed(() => store.state.Wallet.network);
    const networks = computed(() => store.state.Wallet.networks);
    const settings = computed(() => store.state.Settings);

    interface GroupedWallet {
      [name: string]: Wallet[];
    }

    const networkByName = (name: string) =>
      networks.value.find(n => n.name === name) as Network;

    const groupedWallets = computed(() =>
      wallets.value.reduce((grouped, wallet) => {
        const networkName = wallet.network.name || "";
        if (!networkName) return grouped;
        grouped[networkName] = grouped[networkName] || [];
        grouped[networkName].push(wallet);
        return grouped;
      }, {} as GroupedWallet)
    );

    const update = (force?: boolean) => {
      updatePrices(force).then(() =>
        store.dispatch.Wallet.updateWallets(force)
      );
    };

    watch(
      () => wallets.value,
      () => {
        ctx.root.$route.meta.flat = wallets.value.length > 0;
      },
      { deep: true, immediate: true }
    );

    onMounted(() => {
      update(true);
    });

    const networkRate = (name: string) => {
      const usdRate = baseCurrency.value?.usdRate || 1;
      const network = networkByName(name);
      const tokenPrice =
        +useUsdPrice(network.etherscanId || -1, 1, 0, prices) * usdRate;
      return tokenPrice;
    };

    const balance = computed(() => {
      const usdRate = baseCurrency.value?.usdRate || 1;
      const walletBalances = wallets.value.map(wallet => {
        const tokenPrice =
          +useUsdPrice(
            wallet.network.etherscanId || -1,
            wallet.balance,
            wallet.network.decimals,
            prices
          ) * usdRate;

        const erc20TokenPrices = (wallet?.erc20Tokens || []).map(t => {
          const token =
            tokenPrices &&
            (tokenPrices?.value || []).find(p => p.address === t.address);
          if (!token) return 0;
          const rate = +useUsdTokenPrice(
            t.address,
            t.balance,
            token.decimals,
            tokenPrices
          );
          return rate * usdRate;
        });

        return [...erc20TokenPrices, tokenPrice].reduce((a, b) => a + b, 0);
      });
      return walletBalances.reduce((a, b) => a + b, 0);
    });

    return {
      open,
      updating,
      wallets,
      network,
      wallet,
      update,
      balance,
      baseCurrency,
      lastFetched,
      settings,
      groupedWallets,
      networkByName,
      asBaseCurrency,
      networkRate,
      ...useFilters()
    };
  }
});
</script>

<style scoped lang="scss">
.box {
  max-width: 350px;
  margin: auto;
  text-align: center;
}
.symbol {
  font-size: 18vw;

  @media screen and (min-width: 800px) {
    font-size: 8rem;
  }
}

.total-amount__amount__symbol {
  position: relative;
  top: -0.25em;
  margin-left: -0.125em;
}
</style>
