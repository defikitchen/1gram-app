<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    fixed
    temporary
    right
    :width="300"
    class="main-nav-drawer"
  >
    <v-subheader
      >Notifications <v-spacer /><v-btn
        v-if="notifications.length > 0"
        small
        icon
        class="half-transparent"
        @click="removeAll"
      >
        <v-icon small>block</v-icon></v-btn
      ></v-subheader
    >
    <v-divider />

    <p
      class="half-transparent text-center pa-4 pt-6"
      v-if="notifications.length < 1"
    >
      No new notifications
    </p>

    <div
      v-for="notification of [...notificationsActive].reverse().slice(0, 20)"
      :key="'active-' + notification.id"
      class="clickable px-4"
      @click="dismiss(notification.id)"
    >
      <Notification :notification="notification" />
    </div>

    <v-divider
      class="mt-7 mb-5"
      v-if="notificationsActive.length > 0 && notificationsHistory.length > 0"
    />

    <v-subheader v-if="notificationsHistory.length > 0">
      History
    </v-subheader>

    <div
      class="px-4"
      v-for="notification of [...notificationsHistory].reverse().slice(0, 30)"
      :key="'history-' + notification.id"
    >
      <Notification :notification="notification" />
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";

export default defineComponent({
  setup() {
    const {
      store: { state, commit, getters, dispatch }
    } = useVuex();

    const drawerOpen = computed({
      get: () => state.Common.NavBar.drawerOpen,
      set: (value: boolean) => commit.Common.NavBar.setDrawer({ value })
    });

    const notificationsActive = computed(
      () => getters.Common.Notifications.notificationsActive
    );
    const notificationsHistory = computed(
      () => getters.Common.Notifications.notificationsHistory
    );

    const notifications = computed(
      () => state.Common.Notifications.notifications
    );
    const dismiss = commit.Common.Notifications.dismiss;
    const dismissAll = dispatch.Common.Notifications.dismissAll;
    const removeAll = dispatch.Common.Notifications.removeAll;

    return {
      drawerOpen,
      notificationsActive,
      notificationsHistory,
      notifications,
      removeAll,
      dismissAll,
      dismiss
    };
  }
});
</script>
