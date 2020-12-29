import router from "@/router";
import { computed, SetupContext } from "@vue/composition-api";
import { Route } from "vue-router";
import { MetaProps } from "../routes";

export const useRouter = () => {
  return router;
};

export const useMeta = (ctx: SetupContext) => {
  const meta = computed<MetaProps>(() => ctx.root.$route.meta as MetaProps);
  return meta;
};

export const useRoute = (ctx: SetupContext) => {
  interface TypedRoute extends Route {
    meta: MetaProps;
  }
  const route = computed(() => ctx.root.$route as TypedRoute);
  return route;
};
