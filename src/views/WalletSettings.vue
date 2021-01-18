<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { usePrices } from "@/hooks/use-prices";
import { useVuex } from "@/hooks/use-vuex";
import pkg from "../../package.json";

export default defineComponent({
  setup(_, ctx) {
    const { baseCurrency } = usePrices();
    const { store } = useVuex();
    const network = computed(() => store.state.Wallet.network);
    const settings = computed(() => store.state.Settings);

    const darkMode = computed({
      get: () => store.state.Settings.theme === "dark",
      set: () => store.dispatch.Settings.toggleTheme()
    });

    const expertMode = computed({
      get: () => store.state.Settings.mode === "expert",
      set: () => store.dispatch.Settings.toggleMode()
    });

    const toggleDarkMode = () => {
      store.dispatch.Settings.toggleTheme();
    };

    const toggleExpertMode = () => {
      store.dispatch.Settings.toggleMode();
    };

    const clear = async () => {
      const yes = await ctx.root.$dialog.confirm({
        title: "Are you sure?",
        text:
          "Do you really want to clear all app data including wallets and keys?"
      });
      if (yes) {
        localStorage.clear();
        location.reload();
      }
    };

    return {
      network,
      baseCurrency,
      darkMode,
      expertMode,
      toggleDarkMode,
      toggleExpertMode,
      pkg,
      clear,
      settings
    };
  }
});
</script>

<template>
  <Page>
    <PageContent>
      <v-card class="mb-4">
        <v-list class="list--clean">
          <v-list-item class="px-4" to="/portfolio">
            <v-list-item-icon>
              <v-icon>account_balance_wallet</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ settings.name }} Wallet</v-list-item-title>
              <v-list-item-subtitle
                >version {{ pkg.version }}</v-list-item-subtitle
              >
            </v-list-item-content></v-list-item
          >
        </v-list>
      </v-card>

      <v-card class="mb-4">
        <v-list class="list--clean">
          <v-list-item :to="{ query: { modal: 'currency' } }" class="px-4">
            <v-list-item-icon>
              <v-icon>attach_money</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Currency</v-list-item-title>
              <v-list-item-subtitle>{{
                baseCurrency.name
              }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text>
                <v-icon>chevron_right</v-icon>
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>

          <v-list-item :to="{ query: { modal: 'networkList' } }" class="px-4">
            <v-list-item-icon>
              <v-icon>network_check</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Prefered Network</v-list-item-title>
              <v-list-item-subtitle v-if="network"
                >{{ network.protocol }} -
                {{ network.name }}
              </v-list-item-subtitle>
              <v-list-item-subtitle v-else
                >No network selected
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text>
                <v-icon>chevron_right</v-icon>
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>

          <v-list-item to="/wallet/contacts" class="px-4">
            <v-list-item-icon>
              <v-icon>perm_contact_calendar</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Contact Book</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text>
                <v-icon>chevron_right</v-icon>
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>

          <v-list-item class="px-4" @click="toggleDarkMode">
            <v-list-item-icon>
              <v-icon>brightness_medium</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Dark Mode</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="darkMode" class="no-pointer-events" />
            </v-list-item-action>
          </v-list-item>

          <v-list-item class="px-4" @click="toggleExpertMode">
            <v-list-item-icon>
              <v-icon>face</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Developer</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="expertMode" class="no-pointer-events" />
            </v-list-item-action>
          </v-list-item>

          <v-list-item class="px-4" @click="clear">
            <v-list-item-icon>
              <v-icon>block</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Reset</v-list-item-title>
              <v-list-item-subtitle>Clear all app data</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text>
                <v-icon right class="mr-1" small color="error">warning</v-icon>
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>

      <v-card v-if="expertMode" class="mb-4">
        <v-subheader>Developer</v-subheader>
        <v-divider />
        <v-list class="list--clean">
          <v-list-item class="px-4" to="/bip44">
            <v-list-item-icon>
              <v-icon>enhanced_encryption</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Bip44</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-list-item-action-text>
                <v-icon>chevron_right</v-icon>
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>

          <v-list-item class="px-4" to="/console">
            <v-list-item-icon>
              <v-icon>dvr</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Console</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-list-item-action-text>
                <v-icon>chevron_right</v-icon>
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>

          <v-list-item class="px-4" to="/localstorage">
            <v-list-item-icon>
              <v-icon>storage</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Storage</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-list-item-action-text>
                <v-icon>chevron_right</v-icon>
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>

      <v-spacer />
    </PageContent>

    <page-footer :padding="true">
      <p
        class="ma-0 text-sm text-center half-transparent"
        style="margin-top: auto"
      >
        {{ settings.disclaimer }}
      </p>
    </page-footer>
  </Page>
</template>

<style lang="scss" scoped>
.no-pointer-events {
  pointer-events: none;
}
</style>
