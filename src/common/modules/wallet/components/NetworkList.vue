<template>
  <v-list class="py-0">
    <v-list-item>
      <v-subheader class="px-0 list-header">{{ title }}</v-subheader>
    </v-list-item>
    <v-divider />
    <v-list-item
      :input-value="isActive(net)"
      active-class="active"
      v-for="(net, i) of networks.filter(
        n => !active || n.protocol === active.protocol
      )"
      :key="i"
      @click="selectNetwork(net)"
    >
      <v-list-item-icon>
        <v-icon>network_check</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title
          >{{ net.protocol }} - {{ net.name }}</v-list-item-title
        >
      </v-list-item-content>
      <v-list-item-action v-if="isEmoji(net.symbol)">
        <v-list-item-action-text>
          {{ net.symbol }}
        </v-list-item-action-text>
      </v-list-item-action>
    </v-list-item>

    <v-divider />

    <v-list-item>
      <v-list-item-content>
        <v-btn :color="color" block large to="?modal=network"
          ><v-icon left>add</v-icon> Add Network</v-btn
        >
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "@vue/composition-api";
import { useVuex } from "@/common/hooks/use-vuex";
import { Network } from "@/common/models/network";

export default defineComponent({
  props: {
    title: {
      type: String,
      default: "Networks"
    },
    color: String,
    dumb: {
      default: false
    },
    active: [Object, undefined] as PropType<Network | undefined>
  },
  setup(props, { emit }) {
    const { store } = useVuex();
    const networks = computed(() => store.state.Wallet.networks);
    const network = computed(() => store.state.Wallet.network);

    const isEmoji = (str?: string) => {
      const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
      return regex.test(str || "");
    };

    const selectNetwork = (network: Network) => {
      emit("select", network);
      if (props.dumb) return;
      store.commit.Wallet.setNetwork(network);
    };

    const isActive = (net: Network) => {
      if (!props.dumb)
        return (
          network.value &&
          net.name === network.value?.name &&
          net.protocol === net.protocol
        );
      else return props.active?.name === net.name;
    };

    return {
      networks,
      network,
      selectNetwork,
      isEmoji,
      isActive
    };
  }
});
</script>
