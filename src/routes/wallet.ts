import { RouteWithProps } from "@/routes";
import { shortify } from "@/lib/format";
import store from "@/store";
import { WalletState } from "@/store/Wallet";

const Welcome = () =>
  import(/* webpackChunkName: "Backup" */ "@/views/Welcome.vue");

const ContactBook = () =>
  import(/* webpackChunkName: "ContactBook" */ "@/views/ContactBook.vue");

const Backup = () =>
  import(/* webpackChunkName: "Backup" */ "@/views/Backup.vue");
const Import = () =>
  import(/* webpackChunkName: "Import" */ "@/views/Import.vue");
const Send = () => import(/* webpackChunkName: "Send" */ "@/views/Send.vue");
const Wallet = () =>
  import(/* webpackChunkName: "Wallet" */ "@/views/Wallet.vue");
const Portfolio = () =>
  import(/* webpackChunkName: "Wallets" */ "@/views/Portfolio.vue");
const Receipt = () =>
  import(/* webpackChunkName: "Receipt" */ "@/views/Receipt.vue");
const Create = () =>
  import(/* webpackChunkName: "Create" */ "@/views/Create.vue");
const Networks = () =>
  import(/* webpackChunkName: "Networks" */ "@/views/Networks.vue");
const Settings = () =>
  import(/* webpackChunkName: "Settings" */ "@/views/Settings.vue");
const Receive = () =>
  import(/* webpackChunkName: "Receive" */ "@/views/Receive.vue");
const Transaction = () =>
  import(/* webpackChunkName: "Transaction" */ "@/views/Transaction.vue");

export const walletRoutes: RouteWithProps[] = [
  {
    path: "/wallets",
    redirect: "/portfolio"
  },
  {
    path: "/welcome",
    name: "welcome",
    component: Welcome,
    meta: {
      title: "Welcome",
      showToolbar: true,
      hideBack: true,
      stopLoading: true
    }
  },
  {
    path: "/portfolio",
    name: "portfolio",
    component: Portfolio,
    meta: {
      title: "Portfolio",
      showToolbar: true,
      hideBack: true,
      stopLoading: true
    },
    beforeEnter(to, _, next) {
      to.meta.flat = store.state.Wallet.wallets.length > 0;
      next();
    }
  },
  {
    path: "/wallet/networks",
    name: "Networks",
    component: Networks,
    meta: {
      title: "Networks",
      showToolbar: true
    }
  },
  {
    path: "/wallet",
    name: "Wallet",
    component: Wallet,
    meta: {
      title: "Wallet",
      showToolbar: true,
      flat: true,
      backRoute: "/portfolio",
      stopLoading: true
    },
    beforeEnter(to, _, next) {
      const { color, address } = store.getters.Wallet?.wallet || {};
      if (color) {
        to.meta.toolbarType = color || "primary";
      }
      next(address ? undefined : "/portfolio");
    }
  },
  {
    path: "/wallet/transaction",
    name: "Transaction",
    component: Transaction,
    meta: {
      title: "Transaction",
      showToolbar: true,
      flat: true,
      backIcon: "close",
      hideFab: true,
      backRoute: "/wallet"
    },
    beforeEnter(to, _, next) {
      const { transaction, wallet } = store.state.Wallet as WalletState;
      if (!wallet || !transaction) return next("/portfolio");
      const inn = wallet === transaction.to;
      to.meta.toolbarType = inn ? "primary" : "accent";
      next();
    }
  },
  {
    path: "/wallet/import",
    name: "Import Wallet",
    component: Import,
    meta: {
      title: "Import Wallet",
      showToolbar: true,
      flat: true,
      backRoute: "/portfolio",
      backIcon: "close",
      hideFab: true,
      stopLoading: true
    }
  },
  {
    path: "/wallet/contacts",
    name: "Contact Book",
    component: ContactBook,
    meta: {
      title: "Contact Book",
      showToolbar: true,
      flat: true
    }
  },
  {
    path: "/wallet/Settings",
    name: "Wallet Settings",
    component: Settings,
    meta: {
      title: "Settings",
      showToolbar: true,
      backRoute: "/wallet",
      backIcon: "close",
      stopLoading: true
    },
    beforeEnter(to, _, next) {
      const { wallet } = store.getters.Wallet;
      if (!wallet) return next("/portfolio");
      else {
        to.meta.toolbarType = wallet.color || "primary";
        next();
      }
    }
  },
  {
    path: "/wallet/receive",
    name: "Receive",
    component: Receive,
    meta: {
      title: "Receive",
      showToolbar: true,
      hideFab: true,
      backIcon: "close",
      stopLoading: true
    },
    beforeEnter(_, __, next) {
      const { wallet } = store.getters.Wallet;
      next(wallet?.address ? undefined : "/portfolio");
    }
  },
  {
    path: "/wallet/send",
    name: "Send",
    component: Send,
    meta: {
      title: "Send",
      showToolbar: true,
      flat: true,
      backIcon: "close",
      backRoute: "/wallet",
      hideFab: true
    }
  },
  {
    path: "/wallet/receipt",
    name: "Confirm Transaction",
    component: Receipt,
    meta: {
      title: "Confirm Transaction",
      showToolbar: true,
      hideFab: true,
      backIcon: "close",
      backRoute: "/wallet"
    },
    beforeEnter(_, __, next) {
      const transaction = store.state.Wallet.pendingTransaction;
      transaction ? next() : next("/wallet/send");
    }
  },
  {
    path: "/wallet/create",
    name: "Create Wallet",
    component: Create,
    meta: {
      title: "Choose a Name",
      showToolbar: true,
      flat: true,
      hideFab: true,
      backIcon: "close",
      backRoute: "/portfolio",
      stopLoading: true
    }
  },
  {
    path: "/wallet/backup",
    name: "Backup Wallet",
    component: Backup,
    meta: {
      title: "Backup Wallet",
      showToolbar: true,
      hideFab: true,
      hideBack: true,
      pin: true,
      stopLoading: true
    },
    beforeEnter(to, _, next) {
      const { wallet } = store.getters.Wallet;
      if (!wallet?.mnemonic) return next("/portfolio");
      to.meta.toolbarType = wallet.color || "primary";
      next();
    }
  }
];
