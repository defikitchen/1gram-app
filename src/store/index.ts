import { NotificationOptions } from "@/models/notification";
import { createDirectStore } from "direct-vuex";
import Vue from "vue";
import Vuex from "vuex";
import { NotifyResult } from "./Notifications";

Vue.use(Vuex);

import Login, { LoginState } from "./Login";
import Help, { HelpState } from "./Help";
import Loading, { LoadingState } from "./Loading";
import NavBar, { NavBarState } from "./NavBar";
import Notifications, { NotificationsState } from "./Notifications";
import AudioPlayer, { AudioPlayerState } from "./AudioPlayer";
import Utils, { UtilsState } from "./Utils";
import Settings, { SettingsState } from "./Settings";
import Console, { ConsoleState } from "./Console";
import Contacts, { ContactsState } from "./Contacts";
import Wallet, { WalletState } from "./Wallet";
import { defineModule } from "direct-vuex";

export interface RootState {
  Loading: LoadingState;
  NavBar: NavBarState;
  Notifications: NotificationsState;
  AudioPlayer: AudioPlayerState;
  Utils: UtilsState;
  Settings: SettingsState;
  Help: HelpState;
  Login: LoginState;
  Console: ConsoleState;
  Wallet: WalletState;
  Contacts: ContactsState;
}

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  modules: {
    Loading,
    NavBar,
    Notifications,
    AudioPlayer,
    Utils,
    Settings,
    Help,
    Login,
    Console,
    Contacts,
    Wallet
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

export const notify = (options: NotificationOptions): NotifyResult => {
  return store.dispatch.Notifications.notify(options);
};
