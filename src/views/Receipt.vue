<template>
  <Page>
    <PageContent :disabled="loading || sending" :width="500">
      <div>
        <v-list v-if="pendingTransaction" class="list--clean">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Amount'" />
              <v-list-item-title class="mt-1">{{
                token(
                  pendingTransaction && pendingTransaction.amount
                    ? pendingTransaction.amount
                    : 0,
                  wallet.network.symbol,
                  wallet.network.decimals
                )
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
                  token(
                    (pendingTransaction && pendingTransaction.estimatedFees) ||
                      0,
                    wallet.network.symbol,
                    wallet.network.decimals
                  )
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
                  token(
                    (pendingTransaction.estimatedFees || 0) +
                      (pendingTransaction.amount || 0),
                    wallet.network.symbol,
                    wallet.network.decimals
                  )
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
import SwipeBtn from "@/components/SwipeBtn.vue";
import { token, useFilters } from "@/lib/format";
import { handleError } from "@/lib/error-handling";
import { Wallet } from "@/models/wallet";
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted
} from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { useRouter } from "@/hooks/use-router";

export default defineComponent({
  components: {
    SwipeBtn
  },
  setup() {
    const { store } = useVuex();
    const router = useRouter();
    const loading = computed(() => store.state.Loading.loading);
    const pendingTransaction = computed(
      () => store.state.Wallet.pendingTransaction
    );
    const sending = computed(() => store.state.Wallet.sending);
    const wallet = computed(() => store.getters.Wallet.wallet as Wallet);

    onBeforeMount(() => {
      if (!pendingTransaction.value || !wallet.value)
        router.push("/wallet/send");
    });

    onMounted(() => {
      store.commit.Loading.stopLoading();
    });

    const swipeText = computed(() => {
      const amount = token(
        !pendingTransaction.value ? 0 : pendingTransaction.value.amount || 0,
        wallet.value.network.symbol || "",
        wallet.value.network.decimals || 0
      );
      return `Swipe to send ${amount}`;
    });

    const submit = async () => {
      const receiverIsMe = store.state.Wallet.wallets.find(
        w => w.address === pendingTransaction?.value?.to
      );

      if (!pendingTransaction.value) return;
      try {
        await store.dispatch.Wallet.send();
        store.commit.Wallet.setPendingTx(null);
        router.push("/wallet");
        if (receiverIsMe) {
          setTimeout(
            () =>
              store.dispatch.Wallet.updateWallet({
                address: receiverIsMe.address
              }),
            3000
          );
        }
      } catch (error) {
        handleError(error, `Sending timed out`);
      }
    };

    return {
      ...useFilters(),
      loading,
      pendingTransaction,
      sending,
      wallet,
      swipeText,
      submit
    };
  }
});
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
