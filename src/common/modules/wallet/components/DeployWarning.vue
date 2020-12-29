<template>
  <v-card
    :color="theme.color"
    :light="theme.light"
    :dark="theme.dark"
    :disabled="deploying"
  >
    <v-card-title
      class="title d-flex align-center py-3"
      :class="{ 'slightly-transparent': deploying }"
    >
      <span> <v-icon class="mr-2">warning</v-icon>Deployment required </span>
      <v-spacer />
      <v-btn :loading="deploying" text small class="mr-n3">Deploy</v-btn>
    </v-card-title>
    <v-card-text>
      <span :class="{ 'slightly-transparent': deploying }">
        This wallet is not yet deployed. Make sure you have a small amount of
        {{ coin }} crystals in your wallet. You could ask someone to send it to
        you and you can start sending and receiving right away.
      </span>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";

export default defineComponent({
  props: {
    deploying: Boolean,
    coin: String
  },
  setup(props, ctx) {
    const theme = computed(() => {
      const dark = ctx.root.$vuetify.theme.dark;
      return dark
        ? {
            color: "rgba(255, 255, 255, .05)",
            light: false,
            dark: true
          }
        : {
            color: "rgba(0, 0, 0, .05)",
            light: true,
            dark: false
          };
    });

    return {
      theme
    };
  }
});
</script>
