import { defineModule, defineMutations } from "direct-vuex";
import { moduleActionContext } from ".";

export interface NavBarState {
  drawerOpen: boolean;
  tab: string;
}

const state: NavBarState = {
  drawerOpen: false,
  tab: "tab-list"
};

const mutations = defineMutations<NavBarState>()({
  setDrawer(state, options: { value: boolean; tab?: string }) {
    state.drawerOpen = options.value;
    if (options.tab) {
      state.tab = options.tab;
    }
  },
  setTab(state, tab: string) {
    state.tab = tab;
  }
});

const mod = defineModule({
  state,
  mutations,
  actions: {},
  namespaced: true
});

export default mod;

const moduleCtx = (context: any) => moduleActionContext(context, mod);
