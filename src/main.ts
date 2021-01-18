import "reflect-metadata";
import Vue from "vue";
import "@/styles/app.scss";
import VuetifyDialog from "vuetify-dialog";
import "vuetify-dialog/dist/vuetify-dialog.css";
import Vuetify from "vuetify";
import { vuetifyOptions } from "@/vuetify";
import Vue2Filters from "vue2-filters";
import PortalVue from "portal-vue";
import VueCompositionAPI, { provide, createApp } from "@vue/composition-api";
import VueQrcodeReader from "vue-qrcode-reader";
import TransactionItem from "@/components/TransactionItem.vue";
import BackupWarning from "@/components/BackupWarning.vue";
import Page from "@/components/Page.vue";
import PageFooter from "@/components/PageFooter.vue";
import PageSubtitle from "@/components/PageSubtitle.vue";
import PageContent from "@/components/PageContent.vue";
import PageHeader from "@/components/PageHeader.vue";
import Notification from "@/components/Notification.vue";
import Identicon from "@/components/Identicon.vue";
import WalletItem from "@/components/WalletItem.vue";
import TokenItem from "@/components/TokenItem.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import BaseDialog from "@/components/BaseDialog.vue";
import NetworkList from "@/components/NetworkList.vue";
import App from "@/App.vue";
import store from "@/store";
import router from "@/router";
import { Help } from "@/directives/help";
import * as filters from "@/lib/format";
import { usePrices } from "@/hooks/use-prices";

export const vuetify = new Vuetify(vuetifyOptions);

Vue.use(VueCompositionAPI);

const app = createApp({
  store: store.original,
  router,
  vuetify,
  setup() {
    provide("vuex-store", store);
    const { prices } = usePrices();
    return {
      prices,
      ...filters.useFilters()
    };
  },
  render: h => h(App)
});

app.use(VuetifyDialog, {
  context: {
    vuetify
  }
});

app.use(Vue2Filters);
app.use(PortalVue);
app.use(Vuetify);
app.use(VueQrcodeReader);

app.directive("help", Help);

/**
 * @deprecated
 * @todo: migrate to functions
 */
// Vue.filter("token", filters.token);
// Vue.filter("time", filters.time);
// Vue.filter("fromNow", filters.fromNow);
// Vue.filter("shortify", filters.shortify);
// Vue.filter("fromSatoshi", filters.fromSatoshi);
// Vue.filter("toSatoshi", filters.toSatoshi);

app.component("TransactionItem", TransactionItem);
app.component("Page", Page);
app.component("PageFooter", PageFooter);
app.component("PageHeader", PageHeader);
app.component("PageContent", PageContent);
app.component("PageSubtitle", PageSubtitle);
app.component("BackupWarning", BackupWarning);
app.component("Identicon", Identicon);
app.component("WalletItem", WalletItem);
app.component("Notification", Notification);
app.component("ImageUpload", ImageUpload);
app.component("TokenItem", TokenItem);
app.component("BaseDialog", BaseDialog);
app.component("NetworkList", NetworkList);

export default app;

app.mount("#app");

const rootEl = document.getElementById("app") as HTMLElement;
const appInstance = rootEl["__vue__"] as Vue;
window["APP"] = appInstance;

export const dialog = appInstance.$dialog;
export const useDialog = () => dialog;
