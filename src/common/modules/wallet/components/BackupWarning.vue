<template>
  <v-card :color="theme.color" :light="theme.light" :dark="theme.dark">
    <v-card-title class="title d-flex align-center py-3">
      <span> <v-icon class="mr-2">warning</v-icon>Backup required </span>
      <v-spacer />
      <v-btn text small class="mr-n3">Back up</v-btn>
    </v-card-title>
    <v-card-text>
      <span>
        This wallet is not yet backed up. Back up this wallet now so you can
        retrieve your funds in case you lose access.
      </span>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";

export default defineComponent({
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
