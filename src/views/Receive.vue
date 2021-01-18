<template>
  <Page v-if="wallet">
    <portal to="page-title"
      ><span class="clickable-bg" @click="$router.push('?modal=walletMenu')"
        >Receive to {{ shortify(wallet.address, 4) }}
        <v-icon small class="mx-n1">expand_more</v-icon></span
      ></portal
    >
    <PageContent>
      <v-card>
        <v-card-title>
          <v-spacer />Scan QR or copy address<v-spacer />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-card
            @click="copy(wallet.address)"
            class="mx-auto mt-2"
            max-width="250"
            ><v-img :src="qr" :alt="wallet.address"
          /></v-card>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-text-field
            readonly
            append-icon="file_copy"
            solo
            flat
            hide-details
            class="has--copy"
            label="Address"
            @click.stop="() => {}"
            @click:append="copy(wallet.address)"
            :value="wallet.address"
          />
        </v-card-actions>
      </v-card>

      <p class="mt-8 text-sm half-transparent text-center">
        Be careful to only send to a {{ wallet.network.protocol }} -
        {{ wallet.network.name }} address
      </p></PageContent
    >
  </Page>
</template>
<style lang="scss" scoped></style>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  ref,
  watch
} from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { useCopy } from "@/hooks/use-copy";
import { useRouter } from "@/hooks/use-router";
import { useFilters } from "@/lib/format";

export default defineComponent({
  setup() {
    const { store } = useVuex();
    const loading = computed(() => store.state.Loading.loading);
    const wallet = computed(() => store.getters.Wallet.wallet);
    const copy = useCopy;
    const qr = ref("");
    const router = useRouter();

    onBeforeMount(() => {
      if (!wallet.value) router.push("/portfolio");
    });

    const getQR = async (value: string) => {
      if (!value) return "";
      try {
        return await store.dispatch.getQR(value);
      } catch (error) {
        console.warn(error);
        return "";
      }
    };

    const syncQR = () => {
      getQR(wallet.value?.address || "").then(_qr => (qr.value = _qr));
    };

    watch(() => wallet.value, syncQR, {
      immediate: true,
      deep: true
    });

    const downloadAddressQR = (
      _qr = qr.value,
      name = `${wallet.value?.name}-address.png`
    ) => {
      store.dispatch.downloadURL({ url: _qr, name });
    };

    return {
      ...useFilters(),
      loading,
      copy,
      qr,
      wallet,
      getQR,
      syncQR,
      downloadAddressQR
    };
  }
});
</script>

<style scoped lang="scss">
.v-tabs-items {
  background: none !important;
}
.v-window-item {
  padding: 0;
}

.qr-well {
  margin-top: -8px;
}

.type--large .v-text-field__details {
  display: none !important;
}
</style>
