<template>
  <div>
    <portal-target name="modals" />

    <BaseDialog
      v-model="modals.currency.value"
      title="Currency"
      :width="600"
      name="modal-currency"
    >
      <currency-list @select="closeModals" :open="modals.currency.value" />
    </BaseDialog>

    <BaseDialog
      v-model="modals.contacts.value"
      title="Contact Book"
      :width="600"
      name="modal-contacts"
    >
      <contact-book />
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
      <pin-flow />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ComputedRef } from "@vue/composition-api";
import PinFlow from "@/common/containers/PinFlow.vue";
import AddContact from "@/common/modules/wallet/components/AddContact.vue";
import AddNetwork from "@/common/modules/wallet/components/AddNetwork.vue";
import NetworkList from "@/common/modules/wallet/components/NetworkList.vue";
import WalletMenu from "@/common/modules/wallet/components/WalletMenu.vue";
import ContactBook from "@/common/modules/wallet/components/ContactBook.vue";
import CurrencyList from "@/common/modules/wallet/components/CurrencyList.vue";
import { useRouter, useRoute } from "@/common/hooks/use-router";
import { useVuex } from "@/common/hooks/use-vuex";
import { Network } from "@/common/models/network";
import { makeid } from "@/common/lib/makeid";

export default defineComponent({
  components: {
    PinFlow,
    AddContact,
    AddNetwork,
    WalletMenu,
    ContactBook,
    CurrencyList,
    NetworkList
  },
  setup(_, ctx) {
    const router = useRouter();
    const closeModals = () => router.push("?");
    const {
      store: { state, commit, getters, dispatch }
    } = useVuex();
    const route = useRoute(ctx);
    const wallet = computed(() => getters.Wallet.wallet);

    const pinDialog = computed({
      get: () => state.Common.Login.pinDialog,
      set: val => commit.Common.Login.setPinDialog(val)
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
      "walletNetwork"
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

    return {
      pinDialog,
      closeModals,
      route,
      modals,
      openModal,
      addNetwork,
      wallet,
      selectNetwork
    };
  }
});
</script>
