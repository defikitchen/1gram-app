import { RouteWithProps } from "@/routes";
import store from "@/store";
import SomethingWrong from "@/views/SomethingWrong.vue";
import { NotificationsState } from "@/store/Notifications";

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
    beforeEnter(to, _, next) {
      const notification = store.state.Notifications.notifications.find(
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
