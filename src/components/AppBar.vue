<template>
  <v-app-bar
    v-if="meta.showToolbar"
    app
    :data-color="themeColor"
    :color="$route.meta.toolbarType || 'primary'"
    light
    class="main-app-bar"
  >
    <div class="aligner">
      <div class="actions-left">
        <v-btn
          v-if="!meta.hideBack"
          icon
          small
          name="back-button"
          :loading="loading"
          @click="back"
        >
          <v-icon>{{ meta.backIcon || "keyboard_arrow_left" }}</v-icon>
        </v-btn>

        <portal-target class="d-inline" name="nav-actions" />
      </div>

      <div class="bar-title">
        <v-toolbar-title class="title justify-center">
          <span v-if="!hasTitlePassengers">{{ meta.title || "" }}</span>
          <portal-target
            ref="titlePortal"
            name="page-title"
            class="inline-block"
          />
        </v-toolbar-title>
      </div>
      <div class="actions-right">
        <v-btn small icon @click="toggleHelp" :input-value="helpOpen">
          <v-icon>help</v-icon>
        </v-btn>
        <v-btn
          class="unclickable"
          :hidden="meta.hideFab"
          name="nav-drawer"
          icon
          small
          v-if="notificationCount > 0"
        >
          <v-badge color="red" overlap :value="notificationCount">
            <template v-slot:badge>
              <span v-if="notificationCount > 0">{{ notificationCount }}</span>
            </template>
            <v-icon v-if="notificationCount > 0">notifications_active</v-icon>
          </v-badge>
        </v-btn>
      </div>
    </div>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { useRouter, useMeta } from "@/hooks/use-router";

export default defineComponent({
  setup(_, ctx) {
    const titlePortal = ref(null);
    const {
      store: { state, commit, getters, dispatch }
    } = useVuex();
    const router = useRouter();
    const meta = useMeta(ctx);
    const route = computed(() => ctx.root.$route);
    const themeColor = computed(() => getters.Common.Wallet.wallet?.color);
    const openDrawer = () => commit.Common.NavBar.setDrawer({ value: true });
    const toggleHelp = dispatch.Common.Help.toggle;
    const helpOpen = computed(() => state.Common.Help.open);
    const notificationCount = computed(
      () => getters.Common.Notifications.notificationCount
    );
    const loading = computed(() => state.Common.Loading.loading);

    const hasTitlePassengers = computed(
      () => (titlePortal?.value as any)?.transports["page-title"]?.length > 0
    );

    const back = () =>
      meta?.value?.backRoute
        ? router.push(meta?.value?.backRoute || "")
        : router.go(-1);

    return {
      meta,
      openDrawer,
      notificationCount,
      toggleHelp,
      back,
      helpOpen,
      route,
      loading,
      titlePortal,
      hasTitlePassengers,
      themeColor
    };
  }
});
</script>

<style lang="scss" scoped>
.main-app-bar {
  // there's a bug in the default z-index options
  z-index: 18 !important;

  .nav-bar.no--shadow & {
    box-shadow: none !important;
  }
}
.main-nav-drawer {
  // there's a bug in the default z-index options
  z-index: 21 !important;
}
.title {
  display: flex;

  svg {
    transform: scale(0.85);
  }
}

.aligner {
  position: absolute;
  top: 0;
  left: 6px;
  right: 6px;
  height: 64px;

  @media screen and (max-width: 960px) {
    height: 55px;
  }

  .actions-left > .v-btn:not(:last-child) {
    margin-right: 6px;
  }

  .actions-right > .v-btn:not(:first-child) {
    margin-left: 6px;
  }

  .actions-right {
    text-align: right;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .actions-left {
    position: absolute;
    left: 0;
    top: 1.5px;
    top: 50%;
    transform: translateY(-50%);
  }

  .bar-title {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .clickable-bg {
      line-height: 1;
    }

    .v-toolbar__title {
      overflow: initial;
    }
  }

  .action-portal {
    display: inline;
  }
}
</style>

<style>
.main-app-bar .v-toolbar__content {
  padding: 4px 9px !important;
}
</style>
