import store from "@/store";
import { computed } from "@vue/composition-api";
import { Wallet } from "@/models/wallet";

export const useVuex = () => {
  return {
    store,
    wallet: computed(() => store.getters.Wallet.wallet as Wallet)
  };
};
