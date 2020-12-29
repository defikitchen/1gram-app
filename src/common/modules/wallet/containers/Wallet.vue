<template>
  <Page v-if="wallet && wallet.address">
    <span class="clickable" @click="copy(wallet.address)">
      <portal to="page-title"
        ><span class="clickable-bg" @click="$router.push('?modal=walletMenu')"
          >{{ wallet.name }}
          <v-icon small class="mx-n1">expand_more</v-icon></span
        ></portal
      >

      <PageSubtitle>
        <span class="clickable-bg">
          {{ wallet.address | shortify }}
          <v-chip color="black" class="ml-2" light outlined x-small>
            <v-icon left x-small color="black" class="⬤">
              ⬤
            </v-icon>
            {{ wallet.network.name }}
          </v-chip>
        </span>
      </PageSubtitle>
    </span>

    <PageHeader :width="500" :background="$route.meta.toolbarType || ''">
      <v-list two-line subheader class="list--clean pa-0 text-center">
        <v-list-item>
          <v-list-item-content class="total-amount">
            <v-list-item-title class="mt-4 total-amount__amount">
              {{ balance
              }}<small class="ml-n2">{{ wallet.network.symbol }}</small>
            </v-list-item-title>
            <v-list-item-subtitle
              class="total-amount__usd clickable overflow-initial"
              @click="$router.push('?modal=currency')"
            >
              <span class="clickable-bg">{{
                price | token(baseCurrency.code, 0, 2)
              }}</span></v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-row class="actions px-3 mt-3" dense>
        <v-col>
          <v-btn
            large
            dark
            block
            outlined
            light
            color="black"
            class="d-flex type--outline"
            name="wallet-send"
            @click="send()"
            :loading="loading"
          >
            Send <v-icon right small>send</v-icon>
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            large
            dark
            block
            outlined
            light
            color="black"
            class="d-flex type--outline"
            name="wallet-receive"
            @click="receive()"
            :loading="loading"
          >
            Receive <v-icon right small>qr_code</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </PageHeader>

    <PageContent :width="500">
      <v-expand-transition>
        <div
          @click="backup"
          class="mb-6 clickable"
          v-show="!wallet.backedUp && !wallet.imported"
        >
          <backup-warning :coin="wallet.network.symbol" :deploying="forging" />
        </div>
      </v-expand-transition>

      <div @click="deploy" class="mb-6 clickable" v-if="wallet.needsDeployment">
        <deploy-warning :deploying="forging" />
      </div>

      <p
        class="half-transparent py-6 ma-0 text-center"
        v-if="transactions.length < 1 && !wallet.needsDeployment"
      >
        <v-btn block large color="accent" v-if="updating" disabled
          >Updating transactions...
          <v-progress-circular
            width="2"
            size="15"
            class="ml-2"
            color="rgba(255,255,255,.3)"
            indeterminate
          />
        </v-btn>
        <v-btn block large color="accent" v-else disabled
          >No transactions
        </v-btn>
      </p>

      <v-list two-line subheader color="transparent" v-else class="list--clean">
        <div
          @click="openTransaction(transaction)"
          v-for="(transaction, i) of transactions"
          :key="i"
        >
          <TransactionItem
            :transaction="transaction"
            :wallet="wallet"
            :divider="i !== 0"
          />
        </div>
      </v-list>
      <v-subheader class="px-0 mt-4">
        <v-spacer />

        <span class="half-transparent ml-3 text-m" v-if="wallet.lastSynced"
          >updated {{ wallet.lastSynced | fromNow }}</span
        >
      </v-subheader>
    </PageContent>
    <portal to="nav-actions">
      <v-btn small icon :disabled="loading" to="/wallet/settings">
        <v-icon>settings</v-icon>
      </v-btn>

      <v-btn icon small @click="receive()">
        <v-icon>qr_code</v-icon>
      </v-btn>
      <v-btn icon small @click="update(true)">
        <v-icon :class="{ 'unclickable spin': updating }">refresh</v-icon>
      </v-btn>
    </portal>
  </Page>
</template>
<style lang="scss" scoped></style>

<script lang="ts">
import { computed, watch, defineComponent } from "@vue/composition-api";
import { usePrices, useUsdPrice } from "@/common/hooks/use-prices";
import { useVuex } from "@/common/hooks/use-vuex";
import { useRouter } from "@/common/hooks/use-router";
import { Tx } from "@/common/models/tx";
import { token } from "@/common/lib/format";
import { BigNumber } from "bignumber.js";
import { useCopy } from "@/common/hooks/use-copy";
import PageSubtitle from "@/common/components/PageSubtitle.vue";
import { useERC20 } from "@/common/hooks/use-erc20";
import DeployWarning from "@/common/modules/wallet/components/DeployWarning.vue";

export default defineComponent({
  components: { PageSubtitle, DeployWarning },
  setup(_, ctx) {
    const { prices, baseCurrency } = usePrices();
    const { wallet, store } = useVuex();
    const router = useRouter();
    const update = (force = false) =>
      store.dispatch.Wallet.updateWallet({
        address: wallet.value.address,
        force
      });
    const stopLoading = () => store.commit.Common.stopLoading();
    const deploy = () => store.dispatch.Wallet.deployTONWallet(wallet.value);
    const copy = (val: string) => useCopy(val);
    const forging = computed(() => store.state.Wallet.forging);

    const price = computed(() => {
      const rate = useUsdPrice(
        wallet.value.network.etherscanId || -1,
        wallet.value.balance,
        wallet.value.network.decimals,
        prices
      );
      return new BigNumber(rate).times(baseCurrency.value.usdRate).toString();
    });

    watch(
      wallet.value,
      w => {
        if (!w || !w.address) router.push("/portfolio");
        // update();
        stopLoading();
      },
      {
        immediate: true,
        deep: true
      }
    );

    const transactions = computed(() => {
      if (!wallet || !wallet.value.transactions) return [];
      const txs = [
        ...(wallet.value.transactions || []),
        ...(wallet.value.receipts || []),
        ...(wallet.value.erc20Transactions || [])
      ].sort((a, b) => ((a?.timestamp || 0) > (b?.timestamp || 0) ? -1 : 0));

      return txs;
    });

    const expert = computed(() => {
      return store.state.Common.Settings.mode === "expert";
    });

    const openTransaction = (tx: Tx) => {
      store.commit.Wallet.setTransaction(tx);
      router.push("/wallet/transaction");
    };

    const backup = async () => {
      const result = await store.dispatch.Common.Login.promptPin({
        persistent: false
      });
      if (result)
        router.push(`/wallet/backup?redirect=${ctx.root.$route.path}`);
    };

    const balance = computed(() => {
      const { balance, network } = wallet.value;
      return token(balance || 0, "", network.decimals, 6);
    });

    return {
      prices,
      price,
      wallet,
      send: () => router.push("/wallet/send"),
      receive: () => router.push("/wallet/receive"),
      update,
      loading: computed(() => store.state.Common.Loading.loading),
      updating: computed(() => store.state.Wallet.updating as boolean),
      transactions,
      expert,
      openTransaction,
      backup,
      balance,
      baseCurrency,
      copy,
      deploy,
      forging
    };
  }
});
</script>

<style lang="scss" scoped>
.⬤ {
  font-size: 8px !important;
  margin: -3.5px 6px 0 -8px !important;
}

.actions {
  display: flex;
  flex-direction: row;

  .v-btn {
    border-color: rgba(white, 0.4) !important;
  }
  @media screen and (max-width: 960px) {
    .v-btn.v-size--large {
      padding: 0 16px;
    }
  }

  @media screen and (max-width: 600px) {
    .v-btn.v-size--large {
      padding: 0 12.5px;
    }
  }
}

.is--flipped {
  transform: scaleX(-1);
}
</style>
