<template>
  <div :class="`notification-wrapper ${className}`" v-if="notification">
    <v-alert
      transition="notification-transition"
      :value="show"
      :elevation="elevation"
      :class="
        `notification type--${notification.type} theme--${
          isLight ? 'light' : 'black'
        }`
      "
      :type="notification.type"
    >
      <v-row :class="isLight ? 'black--text' : ''">
        <v-col v-text="notification.text" class="pa-0 pl-2 pr-2 grow break" />
        <v-col class="pa-0 text-right shrink" v-if="expert">
          <v-btn
            @click.stop="open"
            :color="isLight ? 'black' : 'white'"
            x-small
            text
            >open</v-btn
          >
        </v-col>
      </v-row>
    </v-alert>
  </div>
</template>

<script lang="ts">
import { Notification as NotificationModel } from "@/models/notification";
import { pause } from "@/lib/helpers";
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref
} from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { useRouter } from "@/hooks/use-router";

export default defineComponent({
  props: {
    notification: {
      type: Object as PropType<NotificationModel>,
      required: true
    },
    elevation: {
      type: [Number, String],
      default: 0
    },
    show: {
      default: true
    }
  },
  setup(props) {
    const { store } = useVuex();
    const router = useRouter();
    const expert = computed(
      () => store.state.Common.Settings.mode === "expert"
    );
    const className = ref("");
    let timer: any;

    const isLight = computed(() => props.notification?.type === "info");

    onMounted(() => {
      timer = setTimeout(() => {
        className.value = "animate--in";
      }, 25);
    });

    onBeforeUnmount(() => {
      clearTimeout(timer);
      className.value = "";
    });

    const open = async () => {
      if (!props.notification) return;
      store.dispatch.Common.Loading.startLoading({
        command: "startLoadingOverlay",
        value: "Loading…"
      });
      await pause(50);
      await router.push("/force-rerender");
      router
        .push({ path: "/notification/" + props.notification.id })
        .then(() => {
          store.commit.Common.Loading.stopLoading();
          store.commit.Common.Notifications.dismiss(
            (props.notification as NotificationModel).id
          );
        });
    };

    return {
      expert,
      isLight,
      className,
      open
    };
  }
});
</script>

<style scoped>
.break {
  word-break: break-word;
}
</style>

<style lang="scss">
.notification {
  width: 100%;
  font-size: 1rem;

  &.theme--light {
    .v-alert__icon {
      color: #272727;
    }
  }
}

.notification-wrapper.animate--in {
  transform: translateX(0);
  opacity: 1;
  filter: blur(0);
  max-height: 400px;
}

.notification-wrapper {
  opacity: 0;
  transition: 0.3s ease-in;
  transform: translateX(100px);
  filter: blur(2rem);
  max-height: 0;
}
</style>
