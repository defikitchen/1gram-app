<template><div>&nbsp;</div> </template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from "@vue/composition-api";

export default defineComponent({
  setup(_, ctx) {
    let timer: any;

    onMounted(() => {
      timer = setInterval(() => ctx.root.$router.go(-1), 200);
    });

    onUnmounted(() => {
      clearInterval(timer);
    });
  }
});
</script>
