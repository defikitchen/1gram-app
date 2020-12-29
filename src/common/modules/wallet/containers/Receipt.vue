<template>
  <Page>
    <PageContent :disabled="loading || sending" :width="500">
      <div>
        <v-list v-if="pendingTransaction" class="list--clean">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Amount'" />
              <v-list-item-title class="mt-1">{{
                pendingTransaction.amount
                  | token(wallet.network.symbol, wallet.network.decimals)
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider v-if="pendingTransaction" class="my-1" />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'From'" />
              <v-list-item-title class="mt-2">{{
                pendingTransaction.from
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider class="my-1" />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'To'" />
              <v-list-item-title class="mt-2">{{
                pendingTransaction.to
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider class="my-1" />

          <v-list-item v-if="pendingTransaction.comment">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Comment'" />
              <v-list-item-title class="mt-2">{{
                pendingTransaction.comment
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider v-if="pendingTransaction.comment" class="my-1" />

          <v-list-item class="pl-0 pr-0">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Fee (estimate)'" />
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text class="text-right">
                {{
                  pendingTransaction.estimatedFees
                    | token(wallet.network.symbol, wallet.network.decimals)
                }}
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>

          <v-divider />

          <v-list-item class="pl-0 pr-0">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Total (estimate)'" />
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text class="text-right">
                {{
                  ((pendingTransaction.estimatedFees || 0) +
                    (pendingTransaction.amount || 0))
                    | token(wallet.network.symbol, wallet.network.decimals)
                }}
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>
    </PageContent>

    <PageFooter :padding="true">
      <SwipeBtn
        @confirm="submit"
        :loadingText="sending ? 'Sending...' : 'Loading...'"
        :initialText="swipeText"
        :loading="loading || sending"
        initialColor="accent"
      />
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Page from "@/common/components/Page.vue";
import PageFooter from "@/common/components/PageFooter.vue";
import PageContent from "@/common/components/PageContent.vue";
import { mapState } from "vuex";
import { WalletState } from "@/common/store/Wallet/Wallet";
import SwipeBtn from "@/common/components/SwipeBtn.vue";
import { LoadingState } from "@/common/store/Common/Loading";
import { token } from "@/common/lib/format";
import {
  handleTimeout,
  handleError,
  addTimeoutToPromise
} from "@/common/lib/error-handling";
import { sendTimeout } from "@/common/lib/constants";
import store, { RootState, notify } from "@/common/store";
import { PendingTx } from "@/common/models/tx";
import { Wallet } from "@/common/models/wallet";

@Component({
  components: {
    SwipeBtn
  },
  computed: {
    ...mapState<RootState>({
      loading: ({ Common }) => Common.Loading.loading,
      pendingTransaction: ({ Wallet }) => Wallet.pendingTransaction,
      sending: ({ Wallet }) => Wallet.sending
    })
  }
})
export default class Receipt extends Vue {
  loading!: boolean;
  pendingTransaction!: PendingTx;
  sending!: boolean;

  beforeMount() {
    if (!this.pendingTransaction) this.$router.push("/wallet/send");
  }

  mounted() {
    const { commit } = store;
    commit.Common.stopLoading();
  }

  get wallet() {
    return store.getters.Wallet.wallet as Wallet;
  }

  get swipeText() {
    const amount = token(
      !this.pendingTransaction ? 0 : this.pendingTransaction.amount || 0,
      this.wallet.network.symbol || "",
      this.wallet.network.decimals || 0
    );
    return `Swipe to send ${amount}`;
  }

  async submit() {
    const { dispatch, commit, state } = store;
    const receiverIsMe = state.Wallet.wallets.find(
      w => w.address === this.pendingTransaction.to
    );

    if (!this.pendingTransaction) return;
    try {
      await dispatch.Wallet.send();
      commit.Wallet.setPendingTx(null);
      this.$router.push("/wallet");
      if (receiverIsMe) {
        setTimeout(
          () => dispatch.Wallet.updateWallet({ address: receiverIsMe.address }),
          3000
        );
      }
    } catch (error) {
      handleError(error, `Sending timed out`);
    }
  }
}
</script>

<style scoped>
.v-list {
  background: none;
}

.footer {
  background: rgba(0, 0, 0, 0.3);
}

.page__footer .swipe-btn {
  width: 100%;
  min-width: 200px;
  max-width: 350px;
  margin: auto;
}
</style>
