import { NotificationOptions } from "@/models/notification";
import { createDirectStore } from "direct-vuex";
import Vue from "vue";
import Vuex from "vuex";
import Common, { CommonState } from "./Common";
import { NotifyResult } from "./Notifications";

Vue.use(Vuex);

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  modules: {
    Common
  }
});

// Export the direct-store instead of the classic Vuex store.
export default store;

// The following exports will be used to enable types in the
// implementation of actions and getters.
export {
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
};

// The following lines enable types in the injected store '$store'.
export type RootStore = typeof store;

declare module "vuex" {
  interface Store<S> {
    direct: RootStore;
  }
}

export interface RootState {
  Common: CommonState;
}

export const notify = (options: NotificationOptions): NotifyResult => {
  return store.dispatch.Common.Notifications.notify(options);
};
