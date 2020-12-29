import { Module, ActionTree, MutationTree, GetterTree } from "vuex";
import { moduleActionContext, RootState } from "@/common/store";
import { defineModule, defineMutations } from "direct-vuex";

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
  namespaced: false
});

const moduleCtx = (context: any) => moduleActionContext(context, mod);

export default mod;
