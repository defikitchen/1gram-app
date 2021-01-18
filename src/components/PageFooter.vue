<template>
  <div class="page__footer" :class="{ 'type--padding': padding }">
    <div class="page__footer__container">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  props: {
    padding: {
      type: Boolean,
      default: true
    }
  }
});
</script>
