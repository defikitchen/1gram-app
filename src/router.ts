import { handleError } from "./lib/error-handling";
import Vue from "vue";
import VueRouter from "vue-router";
import store, { notify } from "@/store";
import { routes } from "./routes";

const Console = () =>
  import(/* webpackChunkName: "Console" */ "@/views/Console.vue");
const Bip44 = () => import(/* webpackChunkName: "Bip44" */ "@/views/Bip44.vue");
const Settings = () =>
  import(/* webpackChunkName: "Settings" */ "@/views/WalletSettings.vue");
const localStorage = () =>
  import(/* webpackChunkName: "LocalStorage" */ "@/views/LocalStorage.vue");

Vue.use(VueRouter);

export const router = new VueRouter({
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
  routes: [
    {
      path: "/",
      redirect: "/portfolio"
    },
    ...routes,
    {
      path: "/settings",
      name: "Settings",
      component: Settings,
      meta: {
        title: "Settings",
        hideBack: false,
        backRoute: "/",
        showToolbar: true,
        stopLoading: true
      }
    },
    {
      path: "/localstorage",
      name: "LocalStorage",
      component: localStorage,
      meta: {
        title: "LocalStorage",
        showToolbar: true
      }
    },
    {
      path: "/bip44",
      name: "Bip44",
      component: Bip44,
      meta: {
        title: "Bip44",
        hideBack: false,
        showToolbar: true,
        stopLoading: true
      }
    },
    {
      path: "/console",
      name: "Console Log",
      component: Console,
      meta: {
        title: "Console",
        hideBack: false,
        showToolbar: true
      }
    },
    { path: "*", redirect: "/not-found" }
  ]
});

router.beforeEach(async (to, from, next) => {
  console.log(`%c[routeTo] ${to.fullPath}`, "color: #89D2DC;");
  const { state } = store;

  const now = new Date().getTime();
  const expiresAt = state.Login.seshExpiresAt;
  const { pinCreated, disclaimerConsent } = state.Login;
  const validSesh = pinCreated && expiresAt && expiresAt >= now;
  const expertMode = state.Settings.mode === "expert";
  const isWelcome = to.name === "welcome";

  if (!disclaimerConsent && !isWelcome) {
    return next("/welcome");
  }
  if (disclaimerConsent && isWelcome) {
    return next("/portfolio");
  }

  if (!validSesh && !expertMode && !isWelcome) {
    await store.dispatch.Login.promptPin({
      persistent: true
    });
  }

  if (state.Wallet.forging || state.Wallet.sending || from.meta.cantGoBack) {
    // todo: maybe turn back on
    // if (to.name !== "Login" && !state.Login.auth) {
    //   next("/login-pin");
    // }

    notify({
      text: "Can't go back now",
      type: "info",
      duration: 2500
    });
    return next(false);
  }

  if (to.meta.stopLoading) {
    store.commit.Loading.stopLoading();
  }

  if (
    navigator.onLine ||
    to.fullPath === "/offline" ||
    to.fullPath === "/force-rerender" ||
    to.name === "Notification"
  ) {
    next();
  } else {
    next();
    handleError(
      null,
      "You're offline. Make sure you're connected to the internet and try again.",
      Infinity
      // true
    );
  }
});

export default router;
