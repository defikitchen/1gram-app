<template>
  <v-theme-provider light>
    <div
      class="page__header"
      :style="style"
      :class="
        `${color} ${padding ? 'type--padding' : ''} ${
          disabled ? 'is--disabled' : ''
        }`
      "
    >
      <div class="page__header__scroll">
        <div
          class="page__header__scroll__container"
          :style="{ 'max-width': maxWidth }"
        >
          <slot />
        </div>
      </div>
    </div>
  </v-theme-provider>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";

export default defineComponent({
  props: {
    disabled: Boolean,
    color: {
      default: "primary",
      type: String
    },
    background: String,
    width: {
      type: Number,
      default: 500
    },
    dark: {
      default: true,
      type: Boolean
    },
    padding: {
      default: true,
      type: Boolean
    }
  },
  setup(props) {
    const maxWidth = computed(() => {
      return isNaN(props.width) ? props.width + "" : props.width + "px";
    });

    const style = computed(() => {
      if (props.background) return `background: ${props.background} !important`;
      else return "";
    });

    return {
      maxWidth,
      style
    };
  }
});
</script>

<style scoped lang="scss">
.page__header {
  transition: 0.3s ease-in;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);
  color: #272727;

  &.is--disabled {
    pointer-events: none;
  }

  &__scroll__container {
    margin: auto;
    padding: 0 1rem;
    transition: 0.3s ease-in;

    .page__header.is--disabled & {
      opacity: 0.4;
    }

    .page__header.type--padding & {
      padding: 0.5rem 1rem 1.25rem;

      // @media screen and (max-width: 960px) {
      //   padding: 0.25rem 1rem 0.55rem;
      // }

      // @media screen and (max-width: 600px) {
      //   padding: 0.25rem 1rem 0.5rem;
      // }
    }
  }
}
</style>
