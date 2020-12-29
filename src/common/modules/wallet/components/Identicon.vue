<template>
  <v-img
    :src="src || identicon"
    :size="size"
    class="identicon"
    ref="img"
    :class="{ 'is--lg': size > 50 }"
  />
</template>

<script lang="ts">
import { identicon } from "@/common/lib/identicon";
import { Wallet } from "@/common/models/wallet";
import { defineComponent, computed } from "@vue/composition-api";

export default defineComponent({
  props: {
    seed: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "base64"
    },
    size: {
      type: Number,
      default: 45
    },
    src: String
  },
  setup(props) {
    return {
      identicon: computed(() => {
        const icon = identicon(props.seed, props.type);
        return icon ? icon.toDataURL() : "";
      })
    };
  }
});
</script>

<style lang="scss">
.identicon {
  $offset: -4px;
  $scale: 0.9;
  $dark: #1e1e1e;
  $light: #fff;
  $border: 2px;
  $border-lg: 3px;

  width: inherit;
  height: inherit;

  &:after {
    content: "";
    background: linear-gradient(to bottom, #d82b7e, #f57939);
    border-radius: 50%;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }

  .v-image__image {
    height: calc(100% - 2px * 2);
    width: calc(100% - 2px * 2);
    border: $border solid $dark;
    margin: $border;

    border-radius: inherit;
    transition: 0.2s ease;
    margin: $border;
    background-color: white;

    .theme--light & {
      border-color: $light !important;
    }
    z-index: 2;
  }

  &.is--lg .v-image__image {
    height: calc(100% - 3px * 2);
    width: calc(100% - 3px * 2);
    border: $border-lg solid $dark;
    margin: $border-lg;
  }
}
</style>
