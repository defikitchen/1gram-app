<template>
  <aside class="notifications">
    <div
      v-for="notification of notifications"
      :key="notification.id"
      class="clickable"
      style="opacity: .9"
      @click="dismiss(notification.id)"
    >
      <Notification
        :notification="notification"
        :show="!notification.timeDismissed"
        :elevation="5"
      />
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";

export default defineComponent({
  setup() {
    const {
      store: { state, commit }
    } = useVuex();

    const drawerOpen = computed({
      get: () => state.Common.NavBar.drawerOpen,
      set: (value: boolean) => commit.Common.NavBar.setDrawer({ value })
    });

    const notifications = computed(() => {
      const items = state.Common.Notifications.notifications;
      return !drawerOpen.value ? [...items].reverse().slice(0, 30) : [];
    });
    const dismiss = commit.Common.Notifications.dismiss;

    return {
      drawerOpen,
      notifications,
      dismiss
    };
  }
});
</script>

<style>
.notifications {
  position: fixed;
  width: 100%;
  max-width: 300px;
  top: 1rem;
  right: 1rem;
  z-index: 9200;
}
</style>
