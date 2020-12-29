<template>
  <div
    class="main-content"
    :data-show-toolbar="meta.showToolbar ? 'true' : 'false'"
    :data-loading="loading ? 'true' : 'false'"
    :data-help-mode="help.open ? 'true' : 'false'"
    :data-help-step="activeHelpStep.id"
    :data-help-overlay="activeHelpStep.overlay ? 'true' : 'false'"
  >
    <v-app>
      <loading-overlay />
      <nav-bar />
      <notification-overlay />

      <div class="main-content__wrap">
        <div class="main-content__wrap__help">
          <Help />
        </div>

        <transition name="page" mode="out-in">
          <router-view class="main-content__wrap__view" />
        </transition>

        <div class="main-content__wrap__loader">
          <v-progress-circular :size="55" indeterminate color="yellow" />
        </div>
      </div>

      <modals />
    </v-app>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  computed,
  ref,
  onBeforeUnmount,
  onBeforeMount
} from "@vue/composition-api";
import NavBar from "@/common/components/NavBar.vue";
import LoadingOverlay from "@/common/components/LoadingOverlay.vue";
import Help from "@/common/components/Help.vue";
import NotificationOverlay from "@/common/components/NotificationOverlay.vue";
import Modals from "@/common/components/Modals.vue";
import { useVuex } from "@/common/hooks/use-vuex";
import { useMeta, useRouter } from "@/common/hooks/use-router";
import { handleError } from "@/common/lib/error-handling";
import { notify } from "@/common/store";
import { Notification } from "@/common/models/notification";
import { NotifyResult } from "@/common/store/Common/Notifications.ts";
import { usePrices } from "@/common/hooks/use-prices";

export default defineComponent({
  components: {
    NavBar,
    LoadingOverlay,
    Help,
    NotificationOverlay,
    Modals
  },
  setup(_, ctx) {
    const {
      store: { state, getters, commit, original, dispatch }
    } = useVuex();
    const router = useRouter();
    const loading = computed(() => state.Common.Loading.loading);
    const help = computed(() => state.Common.Help);
    const activeHelpStep = computed(() => getters.Common.Help.activeHelpStep);
    const meta = useMeta(ctx);
    const notification = ref<Notification | null>(null);
    const { initBasePrices, updatePrices } = usePrices();
    let appTimer: any;

    const timer = async () => {
      const oldVal = state.Common.Loading.online;
      const { onLine } = navigator;

      if (oldVal !== onLine) {
        notification.value?.dismiss();
        commit.Common.setOnline(onLine);
        const result: NotifyResult = !onLine
          ? await handleError(
              { onLine },
              "You're offline. Make sure you're connected to the internet and try again.",
              2500,
              true
            )
          : await notify({
              text: "You're back online",
              type: "success",
              duration: 2500,
              payload: { onLine }
            });
        if (onLine) router.back();
        notification.value = (await result).notification;
      }
    };

    onBeforeMount(async () => {
      await initBasePrices();
      dispatch.Wallet.updateWallets(false);
      appTimer = setInterval(timer, 1000);
      timer();
      dispatch.Common.Notifications.dismissAll();
      dispatch.Common.Settings.initTheme();
      updatePrices().then(() => dispatch.Wallet.updateWallets(false));
      if (state.Console.logging) original.commit("Console/enableLogging");
    });

    onBeforeUnmount(() => clearInterval(appTimer));

    return {
      loading,
      help,
      activeHelpStep,
      meta
    };
  }
});
</script>

<style lang="scss">
.page {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.25s, transform 0.25s;
    overflow: hidden;
  }

  &-enter,
  &-leave-active {
    opacity: 0;
    transform: translateX(-30%);
    overflow: hidden;
  }
}
</style>

<style lang="scss" scoped>
.main-content {
  &__wrap {
    height: 100vh;
    display: flex;
    flex-direction: column;
    transition: padding 0.3s ease;
    padding-bottom: 56px;

    [data-show-toolbar="true"] & {
      padding-top: 56px;

      @media screen and (min-width: 960px) {
        padding-top: 64px;
      }
    }

    &__loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: -1;
    }
  }
}
</style>
