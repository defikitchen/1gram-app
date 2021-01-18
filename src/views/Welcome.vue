<template>
  <Page>
    <PageContent :width="500" :flex="true">
      <div class="box ma-auto">
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
    </PageContent>

    <PageFooter :padding="true">
      <p class="mt-0 text-sm text-center half-transparent">
        {{ settings.disclaimer }}
      </p>
      <v-btn block large color="accent" @click="accept" v-if="!forging"
        >I understand, continue</v-btn
      >

      <v-btn block large color="accent" v-else disabled
        >{{ forging || "Forging wallet" }}...
        <v-progress-circular
          width="2"
          size="15"
          class="ml-2"
          color="rgba(255,255,255,.3)"
          indeterminate
        />
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { useRouter } from "@/hooks/use-router";
import { usePrices } from "@/hooks/use-prices";
import { Network } from "@/models/network";
import { usePin } from "@/hooks/use-pin";
export default defineComponent({
  setup(_, ctx) {
    const {
      prices,
      tokenPrices,
      baseCurrency,
      updatePrices,
      lastFetched
    } = usePrices();
    const { store } = useVuex();
    const router = useRouter();

    const settings = computed(() => store.state.Common.Settings);
    const login = computed(() => store.state.Common.Login.disclaimerConsent);
    const forging = computed(
      () =>
        store.state.Common.Wallet.forging &&
        store.state.Common.Wallet.forgingString
    );

    const accept = async () => {
      store.commit.Common.Login.acceptDisclaimer();

      if (store.state.Common.Wallet.wallets.length <= 0) {
        if (!store.state.Common.Login.pinCreated) {
          await usePin().getPin(true);
        }
        const network = store.state.Common.Wallet.networks.find(
          w => w.name === "main.ton.dev"
        ) as Network;
        store.commit.Common.Wallet.setNetwork(network);
        store.dispatch.Common.Wallet.forgeWallet({
          name: "My Wallet"
        });
      } else {
        router.push("/portfolio");
      }
    };

    const update = (force?: boolean) => {
      updatePrices(force).then(() =>
        store.dispatch.Common.Wallet.updateWallets(force)
      );
    };

    onMounted(() => {
      update();
    });

    return {
      open,
      update,
      baseCurrency,
      lastFetched,
      settings,
      accept,
      forging
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
</style>
