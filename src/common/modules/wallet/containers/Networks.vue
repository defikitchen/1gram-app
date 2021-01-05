<template>
  <Page>
    <PageContent>
      <v-list class="list--clean">
        <template v-for="(network, i) of networks || []">
          <v-list-item :key="i">
            <v-list-item-content>
              <v-list-item-title class="mb-2">
                {{ network.name }}
                <v-chip class="ml-1" v-if="!network.removable" x-small
                  >Build-in</v-chip
                >
              </v-list-item-title>
              <v-list-item-subtitle>
                ID: {{ network.id }}
                <br />
                Symbol: {{ network.symbol }}
                <br />
                Block Explorer URL: {{ network.blockExplorerURL }}
                <br />
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action v-if="network.removable">
              <v-btn
                icon
                @click="removeNetwork(network)"
                class="half-transparent"
              >
                <v-icon v-text="'delete'" />
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider
            :key="'d-' + i"
            class="mt-1 mb-2"
            v-if="i < networks.length - 1"
          />
        </template>
        <v-list-item v-if="networks.length < 1"
          >No Networks Available</v-list-item
        >
      </v-list>
    </PageContent>

    <PageFooter :padding="true">
      <div class="text-center">
        <v-btn @click="submit" block large color="accent">
          <v-icon left>add</v-icon>Network
        </v-btn>
      </div>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Network } from "@/common/models/network";
import { computed, defineComponent } from "@vue/composition-api";
import { useVuex } from "@/common/hooks/use-vuex";
import { useRouter } from "@/common/hooks/use-router";

export default defineComponent({
  setup(_, ctx) {
    const { store } = useVuex();
    const networks = computed(() => store.state.Wallet.networks);
    const router = useRouter();

    const submit = () => router.push("?modal=network");

    const removeNetwork = async (network: Network) => {
      const confirmed = await ctx.root.$dialog.confirm({
        title: "Are you sure?",
        text: "Are you sure you want to remove this Network?"
      });
      if (confirmed) {
        store.commit.Wallet.removeNetwork(network);
        store.dispatch.Common.Notifications.notify({
          text: "Removed " + network.name,
          duration: 4000,
          type: "info"
        });
      }
    };

    return {
      networks,
      submit,
      removeNetwork
    };
  }
});
</script>
