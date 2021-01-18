import {
  defineGetters,
  defineMutations,
  defineActions,
  defineModule
} from "direct-vuex";
import { moduleActionContext, notify } from ".";

export interface LoadingState {
  loading: boolean;
  loadingOverlay: boolean;
  status: string | null;
  timer: any;
  delay: number;
  /**
   * Set the redirect button with a button text  and url
   * @example tupal: `[text: string, url: string] | null`
   */
  redirectButton: [string, string] | null;
  online: boolean;
}

const defaultRedirectButton: LoadingState["redirectButton"] = ["Restart", "/"];

const state: LoadingState = {
  loading: true,
  loadingOverlay: true,
  status: "Loading…",
  timer: setTimeout(() => {}, 0),
  delay: 0,
  redirectButton: null,
  online: true
};

const getters = defineGetters<LoadingState>()({
  getStatus: state => state.status,
  loading: state => state.loading
});

const mutations = defineMutations<LoadingState>()({
  startLoadingOverlay(state, value) {
    state.loading = true;
    state.loadingOverlay = true;
    state.status = value || "Loading…";
  },
  setRedirectButton(state, value: LoadingState["redirectButton"]) {
    state.redirectButton = value || null;
  },
  startLoading(state, value?: string) {
    state.loading = true;
    state.status = value || "Loading…";
  },
  setOnline(state, value: boolean) {
    state.online = value;
  },
  stopLoading: state => {
    state.loading = true;
    state.loadingOverlay = true;
    state.status = "Success!";
    clearTimeout(state.timer);

    state.timer = setTimeout(() => {
      state.loading = false;
      state.loadingOverlay = false;
      state.status = null;
    }, state.delay);
  },
  clearTimer: state => {
    clearTimeout(state.timer);
  },
  setLoadingStatus: (state, value: string) => {
    state.status = value;
  },
  setTimer: (state, value: any) => {
    state.timer = value;
  }
});

const actions = defineActions({
  startLoading: (
    ctx,
    opts: {
      value: string | undefined;
      command: string;
    }
  ) => {
    const { commit } = moduleCtx(ctx);
    let { value, command } = opts || {
      value: undefined,
      command: "startLoading"
    };
    command = command || "startLoading";
    commit.clearTimer();
    ctx.commit(command, value);
    commit.setRedirectButton(null);
    commit.setTimer(
      setTimeout(() => {
        const text =
          "This is taking longer than usual. Please restart the app or contact us if this problem persists.";
        commit.setRedirectButton(defaultRedirectButton);
        ctx.commit(command, text);
        notify({ text, type: "error" });
      }, 10000)
    );
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
