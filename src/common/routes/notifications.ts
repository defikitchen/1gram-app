import { RouteWithProps } from ".";
import store from "../store";
import SomethingWrong from "@/common/components/SomethingWrong.vue";
import { NotificationsState } from "../store/Common/Notifications";

export const notificationRoutes: RouteWithProps[] = [
  {
    path: "/notification/:id",
    name: "Notification",
    component: SomethingWrong,
    meta: {
      title: "Notification",
      transition: "fade",
      showToolbar: true
    },
    beforeEnter(to, from, next) {
      const notification = ((store.state as any).Common
        .Notifications as NotificationsState).notifications.find(
        n => n.id === to.params.id
      );
      if (notification) {
        const time = new Date(notification.timeCreated);
        to.meta.props = {
          title: notification.text,
          error: notification.payload,
          message: time.toLocaleDateString() + " " + time.toLocaleTimeString()
        };
        to.meta.toolbarType = notification.type;
        next();
      }
    }
  }
];
