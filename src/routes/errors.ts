import { RouteWithProps } from ".";
import SomethingWrong from "@/views/SomethingWrong.vue";
import ForceRerender from "@/views/ForceRerender.vue";

export const errorsRoutes: RouteWithProps[] = [
  {
    path: "/force-rerender",
    name: "Force Rerender",
    component: ForceRerender
  },
  {
    path: "/offline",
    component: SomethingWrong,
    name: "Offline",
    meta: {
      transition: "fade",
      props: {
        title: "You're not connected to the internet. Get online and try again."
      },
      title: "Offline",
      showToolbar: true,
      hideBack: false,
      toolbarType: "error"
    }
  },
  {
    path: "/not-found",
    component: SomethingWrong,
    name: "Not Found",
    meta: {
      transition: "fade",
      props: {
        error: "Page not found.",
        title: "404"
      },
      title: "Not found",
      showToolbar: true,
      hideBack: false
    }
  }
];
