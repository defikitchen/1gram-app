<template>
  <div>
    <portal-target name="modals" />

    <BaseDialog
      v-model="modals.qr.value"
      title="Scan QR"
      :width="600"
      name="modal-qr"
    >
      <qrcode-stream v-if="modals.qr.value" @decode="onDecode"></qrcode-stream>
      <v-text-field
        class="ma-0 py-0"
        readonly
        rounded
        :value="qr"
        hide-details
        placeholder="Waiting for input..."
        :loading="!qr"
      />
    </BaseDialog>

    <BaseDialog
      v-model="modals.currency.value"
      title="Currency"
      :width="600"
      name="modal-currency"
    >
      <currency-list @select="closeModals" :open="modals.currency.value" />
    </BaseDialog>

    <v-bottom-sheet
      max-width="600"
      v-model="modals.networkList.value"
      inset
      overlay-opacity=".8"
      :overlay-color="$vuetify.theme.dark ? 'black' : 'white'"
    >
      <network-list @select="closeModals" color="accent" />
    </v-bottom-sheet>

    <v-bottom-sheet
      max-width="600"
      v-model="modals.walletNetwork.value"
      inset
      v-if="wallet"
      overlay-opacity=".8"
      :overlay-color="$vuetify.theme.dark ? 'black' : 'white'"
    >
      <network-list
        :active="wallet.network"
        :dumb="true"
        @select="selectNetwork"
        color="accent"
        title="Wallet Network"
      />
    </v-bottom-sheet>

    <v-bottom-sheet
      max-width="600"
      v-model="modals.walletMenu.value"
      inset
      overlay-opacity=".8"
      :overlay-color="$vuetify.theme.dark ? 'black' : 'white'"
    >
      <wallet-menu />
    </v-bottom-sheet>

    <BaseDialog
      v-model="modals.network.value"
      title="Add Network"
      :width="600"
      @back="openModal('network')"
      name="modal-network"
    >
      <AddNetwork @submit="addNetwork" />
    </BaseDialog>

    <BaseDialog
      v-model="modals.addContact.value"
      :title="route.query.id ? 'Edit Contact' : 'Add Contact'"
      :width="480"
      name="modal-add-contact"
    >
      <AddContact @submit="closeModals" />
    </BaseDialog>
    <v-dialog v-model="pinDialog" fullscreen persistent>
      <PinFlow />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ComputedRef,
  ref
} from "@vue/composition-api";
import PinFlow from "@/views/PinFlow.vue";
import AddContact from "@/views/AddContact.vue";
import AddNetwork from "@/views/AddNetwork.vue";
import NetworkList from "@/components/NetworkList.vue";
import WalletMenu from "@/components/WalletMenu.vue";
import CurrencyList from "@/components/CurrencyList.vue";
import { useRouter, useRoute } from "@/hooks/use-router";
import { useVuex } from "@/hooks/use-vuex";
import { Network } from "@/models/network";
import { makeid } from "@/lib/makeid";
import { useQr } from "@/hooks/use-qr";

export default defineComponent({
  components: {
    PinFlow,
    AddContact,
    AddNetwork,
    WalletMenu,
    CurrencyList,
    NetworkList
  },
  setup(_, ctx) {
    const router = useRouter();
    const closeModals = () => router.push("?");
    const {
      store: { state, commit, getters, dispatch }
    } = useVuex();
    const route = useRoute();
    const wallet = computed(() => getters.Wallet.wallet);
    const { qr } = useQr();

    const pinDialog = computed({
      get: () => state.Login.pinDialog,
      set: val => commit.Login.setPinDialog(val)
    });

    const openModal = (name: string) => router.push("?modal=" + name);

    const addNetwork = (network: Network) => {
      commit.Wallet.addNetwork({ ...network, id: makeid(20) });
      closeModals();
    };

    const modalNames = [
      "addContact",
      "addNetwork",
      "network",
      "networkList",
      "walletMenu",
      "currency",
      "contacts",
      "walletNetwork",
      "qr"
    ];

    const modals: ComputedRef<{ [key: string]: { value: boolean } }> = computed(
      () =>
        modalNames.reduce(
          (obj, name) => ({
            ...obj,
            ...{
              [name]: computed({
                get: () => ctx.root.$route.query?.modal === name,
                set: value => (value ? openModal(name) : closeModals())
              })
            }
          }),
          {}
        )
    );

    const selectNetwork = async (network: Network) => {
      const address = wallet.value?.address;
      if (!address) return router.push("/portfolio");
      router.push("?");
      commit.Wallet.patchWallet({
        address: wallet.value?.address || "",
        update: {
          network
        }
      });
      await dispatch.Wallet.updateWallet({ address, force: true });
    };

    const onDecode = (value: string) => {
      qr.value = value;
    };

    return {
      pinDialog,
      closeModals,
      route,
      modals,
      openModal,
      addNetwork,
      wallet,
      selectNetwork,
      onDecode,
      qr
    };
  }
});
</script>
