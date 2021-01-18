import { themeColors } from "@/vuetify";
import { makeid } from "@/lib/makeid";
import { moduleActionContext } from "@/store";
import { Notification, NotificationType } from "@/models/notification";
import { NotificationOptions } from "@/models/notification";
import {
  defineActions,
  defineGetters,
  defineModule,
  defineMutations
} from "direct-vuex";
import { getCache, setCache } from "@/lib/cache";

export const DISMISS = "dismiss";
export const DISMISS_ALL = "dismissAll";
export const NOTIFY = "notify";
export const NOTIFICATION_COUNT = "notificationCount";
export const NOTIFICATIONS_ACTIVE = "notificationsActive";
export const NOTIFICATIONS_HISTORY = "notificationsHistory";
export const REMOVE = "remove";
export const REMOVE_ALL = "removeAll";

export interface NotificationsState {
  notifications: Notification[];
}

export type NotifyResult = Promise<{
  notification: Notification;
  dismissed: Promise<Notification>;
}>;

const state: NotificationsState = {
  notifications: getCache("notifications", [])
};

const syncCache = (state: NotificationsState) => {
  setCache("notifications", state.notifications);
};

const getters = defineGetters<NotificationsState>()({
  notificationsActive(state) {
    return state.notifications.filter(n => !n.timeDismissed);
  },
  notificationsHistory(state) {
    return state.notifications.filter(n => n.timeDismissed);
  },
  notificationCount(state) {
    return state.notifications.filter(n => !n.timeDismissed).length;
  }
});

const mutations = defineMutations<NotificationsState>()({
  dismiss(state, id: string) {
    const notification = state.notifications.find(n => n.id === id);
    if (notification) {
      notification.timeDismissed = new Date().toISOString();
      clearTimeout(notification.timer);
      syncCache(state);
    }
  },
  remove(state, id: string) {
    state.notifications = state.notifications.filter(n => n.id !== id);
    syncCache(state);
  },
  add(state, notification: Notification) {
    state.notifications = [...state.notifications, notification];
    console.log(state);
    syncCache(state);
  }
});

const actions = defineActions({
  dismissAll(ctx) {
    const { state, commit } = moduleCtx(ctx);
    state.notifications.forEach(n => commit.dismiss(n.id));
  },
  removeAll(ctx) {
    const { state, commit } = moduleCtx(ctx);
    state.notifications.forEach(n => commit.dismiss(n.id));
    state.notifications.forEach(n => commit.remove(n.id));
  },
  async notify(ctx, options: NotificationOptions): NotifyResult {
    const { state, commit } = moduleCtx(ctx);
    const id = makeid();
    const defaults = {
      duration: Infinity,
      timeCreated: new Date().toISOString(),
      type: "info" as NotificationType,
      id,
      timeDismissed: "",
      timer: null,
      dismiss: () => commit.dismiss(id)
    };
    const notification: Notification = {
      ...defaults,
      ...options
    };

    commit.add(notification);

    let sound: string, color: string;

    switch (notification.type) {
      case "success":
        sound = "playSuccess";
        color = themeColors.success;
        break;
      case "error":
        sound = "playError";
        color = themeColors.error;
        break;
      case "info":
        sound = "playInfo";
        color = themeColors.info;
        break;
      case "warning":
        sound = "playWarning";
        color = themeColors.yellow;
        break;
      default:
        sound = "playInfo";
        color = themeColors.info;
    }

    console.log(
      `%c[notify] ${notification.text}`,
      `color: ${color}; font-weight: bold;`,
      notification.payload
    );

    // dispatch(`Common/${sound}`, null, { root: true });

    return {
      notification,
      dismissed: new Promise(res => {
        if (isFinite(notification.duration)) {
          setTimeout(() => {
            commit.dismiss(id);
            res(notification);
          }, notification.duration);
        } else {
          res(notification);
        }
      })
    };
  }
});

const mod = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
});

const moduleCtx = (context: any) => moduleActionContext(context, mod);

export default mod;
