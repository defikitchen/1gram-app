<template>
  <div class="nav-bar" :class="{ 'no--shadow': $route.meta.flat }">
    <bottom-bar />
    <notification-bar />
    <app-bar />
  </div>
</template>

<script lang="ts">
import BottomBar from "./BottomBar.vue";
import NotificationBar from "./NotificationBar.vue";
import AppBar from "./AppBar.vue";
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  components: {
    BottomBar,
    NotificationBar,
    AppBar
  }
});
</script>
