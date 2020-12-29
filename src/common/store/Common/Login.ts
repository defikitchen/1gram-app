import { handleError } from "./../../lib/error-handling";
import { encrypt, decrypt } from "./../../lib/crypto";
import {
  defineModule,
  // defineActions,
  defineMutations,
  defineGetters,
  defineActions
} from "direct-vuex";
import { getCache, setCache, getSession, setSession } from "@/common/lib/cache";
import { moduleActionContext } from "..";
// import { moduleActionContext } from "@/common/store";

import Vue from "vue";
export const PinEventBus = new Vue();

export let _pinCache = "";

export interface LoginState {
  pinCreated: string;
  pin: string | null;
  auth: boolean;
  pinDialog: boolean;
  pinDialogForm: string;
  pinDialogPersistent: boolean;
  seshExpiresAt: number | null;
  disclaimerConsent: boolean;
}

const state: LoginState = {
  pinCreated: getCache("pinCreated", ""),
  pinDialogForm: "",
  pin: null,
  pinDialog: false,
  auth: getSession("auth", false),
  pinDialogPersistent: false,
  seshExpiresAt: getCache("seshExpiresAt", null),
  disclaimerConsent: getCache("disclaimerConsent", false)
};

const getters = defineGetters<LoginState>()({});

const mutations = defineMutations<LoginState>()({
  acceptDisclaimer: () => {
    state.disclaimerConsent = true;
    setCache("disclaimerConsent", true);
  },
  setPin: (state, pin: string) => {
    state.pin = pin;
    _pinCache = pin;
  },
  setSeshExpiry: (state, date: number | null) => {
    state.seshExpiresAt = date;
    setCache("seshExpiresAt", date);
  },
  setPinDialogForm: (state, pin: string) => {
    state.pinDialogForm = pin;
  },
  setPinDialogPersistent: (state, value: boolean) => {
    state.pinDialogPersistent = value;
  },
  setAuth: (state, auth: boolean) => {
    state.auth = auth;
    setSession("auth", auth);
  },
  setPinDialog: (state, val: boolean) => {
    state.pinDialog = val;
    if (!val) {
      state.pinDialogForm = "";
      PinEventBus.$emit("close");
    }
  },
  clearPinDialog: state => {
    state.pinDialog = false;
    state.pinDialogForm = "";
  },
  setCreated: (state, pin: string | null) => {
    state.pinCreated = !pin ? "" : encrypt("tigerbee", pin as string);
    setCache("pinCreated", state.pinCreated);
  }
});

const actions = defineActions({
  async create(ctx, pin: string): Promise<boolean | void> {
    const { state, commit, dispatch } = moduleCtx(ctx);
    const valid = pin.length === 6;
    if (!valid) throw new Error("PIN must be 6 numbers");
    commit.setCreated(pin);
    await dispatch.login(pin);
  },
  async login(ctx, pin: string): Promise<string> {
    const { state, commit } = moduleCtx(ctx);
    try {
      const loggedin = decrypt(state.pinCreated, pin) === "tigerbee";
      commit.setPin(pin);
      commit.setAuth(loggedin);
      const now = new Date().getTime();
      const day = 1000 * 60 * 60 * 24;
      const expiresAt = now + day * 3;
      commit.setSeshExpiry(expiresAt);
      return pin;
    } catch (error) {
      commit.setAuth(false);
      commit.setSeshExpiry(null);
      throw new Error("Not authorized. Try again");
    }
  },
  promptPin(
    ctx,
    options: { persistent?: boolean } = { persistent: true }
  ): Promise<string> {
    const { commit, dispatch } = moduleCtx(ctx);
    commit.setPinDialog(true);
    commit.setPinDialogPersistent(!!(options && options.persistent));
    return new Promise((res, rej) => {
      const submitHandler = async (pin: string) => {
        try {
          const validPin = await dispatch.login(pin);
          commit.clearPinDialog();
          res(validPin);
        } catch (error) {
          handleError(error, "Wrong PIN", 600);
          return dispatch.promptPin({
            persistent: !!options.persistent
          });
        } finally {
          commit.setPinDialogForm("");
          destroy();
        }
      };
      const closeHandler = () => {
        destroy();
        rej("cancelled");
      };

      const destroy = () => {
        PinEventBus.$off("submit", submitHandler);
        PinEventBus.$off("close", closeHandler);
        commit.setPinDialogForm("");
        commit.setPinDialogPersistent(false);
      };

      PinEventBus.$on("submit", submitHandler);
      PinEventBus.$on("close", closeHandler);
    });
  }
});

const loginModule = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
});

const moduleCtx = (context: any) => moduleActionContext(context, loginModule);

export default loginModule;
