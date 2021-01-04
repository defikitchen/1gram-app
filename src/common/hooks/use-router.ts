import router from "@/router";
import { computed, SetupContext } from "@vue/composition-api";
import VueRouter, { Route } from "vue-router";
import { MetaProps } from "../routes";

export const useRouter = () => {
  return router as VueRouter;
};

export const useMeta = (ctx: SetupContext) => {
  const meta = computed<MetaProps>(() => ctx.root.$route.meta as MetaProps);
  return meta;
};

export const useRoute = () => {
  interface TypedRoute extends Route {
    meta: MetaProps;
  }
  const route = computed(() => useRouter().app.$route);
  return route;
};
