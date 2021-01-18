<template>
  <v-bottom-navigation fixed :dark="$vuetify.theme.dark">
    <v-btn
      exact
      :value="$route.path === 'wallets'"
      to="/portfolio"
      :disabled="disabled"
    >
      <span>Portfolio</span>

      <v-icon>pie_chart</v-icon>
    </v-btn>

    <v-btn
      v-if="wallet"
      exact
      :value="$route.path === '/wallet'"
      to="/wallet"
      :disabled="disabled"
    >
      <span>Wallet</span>

      <v-icon>account_balance_wallet</v-icon>
    </v-btn>

    <v-btn
      v-if="!wallet"
      exact
      :disabled="disabled"
      :value="false"
      to="?modal=walletMenu&createOnly=true"
    >
      <span>Wallet</span>

      <v-icon>add</v-icon>
    </v-btn>

    <v-btn
      to="/wallet/contacts"
      exact
      :disabled="disabled"
      :value="$route.path === '/wallet/contacts'"
    >
      <span>Contacts</span>

      <v-icon>perm_contact_calendar</v-icon>
    </v-btn>

    <v-btn
      to="/settings"
      exact
      :value="$route.path === '/settings'"
      :disabled="disabled"
    >
      <span>Settings</span>

      <v-icon>settings</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { useRoute } from "@/hooks/use-router";

export default defineComponent({
  setup() {
    const {
      store: { getters }
    } = useVuex();
    const route = useRoute();

    const disabled = computed(() => route.value.path === "/welcome");

    return {
      wallet: computed(() => getters.Common.Wallet.wallet),
      disabled
    };
  }
});
</script>
