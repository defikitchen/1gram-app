import { RouteConfig, RouteConfigSingleView } from "vue-router/types/router";
import { errorsRoutes } from "./errors";
import { notificationRoutes } from "./notifications";
import { walletRoutes } from "./wallet";

export interface MetaProps {
  title?: string;
  showToolbar?: boolean;
  hideBack?: boolean;
  flat?: boolean;
  backRoute?: string;
  stopLoading?: boolean;
  transition?: string;
  props?: any;
  toolbarType?: string;
  hideFab?: boolean;
  backIcon?: string;
  pin?: boolean;
}

export interface RouteWithProps extends RouteConfigSingleView {
  meta?: MetaProps;
}

export const routes: RouteWithProps[] = [
  ...walletRoutes,
  ...notificationRoutes,
  ...errorsRoutes
];
