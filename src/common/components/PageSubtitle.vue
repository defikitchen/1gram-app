<template>
  <span class="page__subtitle">
    <slot />
  </span>
</template>

<style>
.page__subtitle {
  position: absolute;
  text-align: center;
  font-size: 15px;
  color: black;
  opacity: 0.65;
  font-weight: 500;
  top: -0.65rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 19;
}
</style>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({});
</script>
