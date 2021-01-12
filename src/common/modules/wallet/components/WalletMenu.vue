<template>
  <v-list class="py-0">
    <v-subheader class="list-header">Wallets</v-subheader>
    <v-divider />

    <template
      v-if="wallets.length > 0 && !createOnly && !$route.query.createOnly"
    >
      <div
        @click="
          setWallet(w);
          close();
        "
        v-for="(w, i) of wallets"
        :key="i"
      >
        <wallet-item
          :selected="w.address === (wallet && wallet.address)"
          :wallet="w"
        />
      </div>
      <v-divider />
    </template>

    <v-list>
      <v-list-item to="/wallet/create">
        <v-list-item-icon>
          <v-icon>add</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Create new wallet</v-list-item-title>
      </v-list-item>

      <v-list-item to="/wallet/import">
        <v-list-item-icon>
          <v-icon>arrow_downward</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Import existing wallet</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-divider />
    <v-list>
      <v-list-item to="/settings">
        <v-list-item-icon>
          <v-icon>settings</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Settings</v-list-item-title>
      </v-list-item>

      <v-list-item @click="openHelp">
        <v-list-item-icon>
          <v-icon>help</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Help</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { useVuex } from "@/common/hooks/use-vuex";
import { useRouter } from "@/common/hooks/use-router";
import WalletItem from "./WalletItem.vue";

export default defineComponent({
  components: { WalletItem },
  props: {
    createOnly: Boolean
  },
  setup() {
    const { store } = useVuex();
    const router = useRouter();

    const wallet = computed(() => store.getters.Wallet.wallet);
    const wallets = computed(() =>
      (store.state.Wallet.wallets || []).sort((a, b) => {
        if (a.address === wallet.value?.address) return -100;
        return a.name > b.name ? 0 : -1;
      })
    );

    const close = () => {
      const redirect = router.currentRoute.query.redirect;
      if (redirect) {
        router.push(redirect as string);
      } else router.push("?");
    };

    const setWallet = store.commit.Wallet.setWallet;

    const openHelp = () => {
      store.commit.Common.Help.setHelpOpen(true);
      close();
    };

    return {
      wallet,
      wallets,
      openHelp,
      setWallet,
      close
    };
  }
});
</script>
