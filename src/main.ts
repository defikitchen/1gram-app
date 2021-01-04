import "reflect-metadata";

import "./common/styles/app.scss";
import VuetifyDialog from "vuetify-dialog";
import "vuetify-dialog/dist/vuetify-dialog.css";
import Vuetify from "vuetify";
import { vuetifyOptions } from "./vuetify";
import Vue2Filters from "vue2-filters";
import { Component, Vue } from "vue-property-decorator";
import VueCompositionAPI, { provide } from "@vue/composition-api";
import TransactionItem from "@/common/modules/wallet/components/TransactionItem.vue";
import BackupWarning from "@/common/modules/wallet/components/BackupWarning.vue";
import Page from "@/common/components/Page.vue";
import PageFooter from "@/common/components/PageFooter.vue";
import PageSubtitle from "@/common/components/PageSubtitle.vue";
import PageContent from "@/common/components/PageContent.vue";
import PageHeader from "@/common/components/PageHeader.vue";
import Notification from "@/common/components/Notification.vue";
import Identicon from "@/common/modules/wallet/components/Identicon.vue";
import WalletItem from "@/common/modules/wallet/components/WalletItem.vue";
import TokenItem from "@/common/modules/wallet/components/TokenItem.vue";
import ImageUpload from "@/common/components/ImageUpload.vue";
import BaseDialog from "@/common/components/BaseDialog.vue";
import NetworkList from "@/common/modules/wallet/components/NetworkList.vue";
import App from "./App.vue";
import store from "./common/store";
import router from "./router";
import PortalVue from "portal-vue";
import { Help } from "./common/directives/help";
import {
  time,
  shortify,
  token,
  fromNow,
  fromSatoshi,
  toSatoshi
} from "@/common/lib/format";
import VueQrcodeReader from "vue-qrcode-reader";
import { usePrices } from "./common/hooks/use-prices";

window.Vue = Vue as any;

export const vuetify = new Vuetify(vuetifyOptions);

Vue.use(VueCompositionAPI);
Vue.use(VuetifyDialog, {
  context: {
    vuetify
  }
});

Vue.use(Vue2Filters);
Vue.use(PortalVue);
Vue.use(Vuetify);
Vue.use(VueQrcodeReader);

Vue.directive("help", Help);

Vue.filter("token", token);
Vue.filter("time", time);
Vue.filter("fromNow", fromNow);
Vue.filter("shortify", shortify);
Vue.filter("fromSatoshi", fromSatoshi);
Vue.filter("toSatoshi", toSatoshi);

Vue.component("TransactionItem", TransactionItem);
Vue.component("Page", Page);
Vue.component("PageFooter", PageFooter);
Vue.component("PageHeader", PageHeader);
Vue.component("PageContent", PageContent);
Vue.component("PageSubtitle", PageSubtitle);
Vue.component("BackupWarning", BackupWarning);
Vue.component("Identicon", Identicon);
Vue.component("WalletItem", WalletItem);
Vue.component("Notification", Notification);
Vue.component("ImageUpload", ImageUpload);
Vue.component("TokenItem", TokenItem);
Vue.component("BaseDialog", BaseDialog);
Vue.component("NetworkList", NetworkList);

@Component({
  store: store.original,
  router,
  vuetify,
  setup() {
    provide("vuex-store", store);
    const { prices } = usePrices();
    return {
      prices
    };
  },
  render: h => h(App)
})
export default class RootComponent extends Vue {}

const el = new RootComponent().$mount().$el;

export const dialog = Vue.prototype.$dialog as Vue["$dialog"];
(document.getElementById("app") as HTMLElement).appendChild(el);
