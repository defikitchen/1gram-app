<template>
  <v-dialog
    v-model="model"
    :width="width"
    :class="{ 'is--open': model }"
    overlay-opacity=".5"
    :name="name"
  >
    <v-card>
      <v-toolbar :color="color" class="base-dialog__header" light>
        <v-btn
          rounded
          icon
          v-if="back"
          @click="$emit('back')"
          class="dialog__header__back"
        >
          <v-icon>keyboard_backspace</v-icon>
        </v-btn>

        <v-toolbar-title>
          <span class="font-weight-medium">{{ title }}</span>
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          rounded
          icon
          @click="$emit('input', false)"
          class="dialog__header__close"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>

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
