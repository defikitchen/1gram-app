<template>
  <v-dialog
    v-model="model"
    :width="width"
    :class="{ 'is--open': model }"
    overlay-opacity=".8"
    :name="name"
    :overlay-color="$vuetify.theme.dark ? 'black' : 'white'"
  >
    <v-card>
      <v-toolbar
        class="base-dialog__header"
        color="$vuetify.theme.dark ? rgba(255,255,255,.05) : rgba(0,0,0,.05)"
        elevation="0"
      >
        <v-btn
          rounded
          icon
          v-if="back"
          @click="$emit('back')"
          class="dialog__header__back half-transparent"
        >
          <v-icon>keyboard_backspace</v-icon>
        </v-btn>
        <v-btn icon v-else class="unclickable d-transparent"></v-btn>
        <v-spacer />

        <v-subheader class="px-0 list-header text-center">{{
          title
        }}</v-subheader>
        <v-spacer />
        <v-btn
          rounded
          icon
          @click="$emit('input', false)"
          class="dialog__header__close half-transparent"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-divider />

      <slot />
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
.v-dialog__container {
  display: block;
  z-index: 5000;
  position: fixed;

  .v-overlay.v-overlay--active {
    display: none;
  }
}
html.overflow-y-hidden {
  overflow-y: hidden;
}
.base-dialog__header {
  position: relative;
  z-index: 3;
}
</style>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    color: {
      default: "primary"
    },
    title: String,
    width: {
      default: 500
    },
    value: {
      default: false
    },
    name: {
      default: ""
    },
    back: {
      default: false
    }
  },
  setup(props, ctx) {
    const model = computed({
      get: () => props.value,
      set: () => ctx.emit("input", false)
    });

    return {
      model
    };
  }
});
</script>

<style scoped></style>
