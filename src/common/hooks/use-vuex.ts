import store from "@/common/store";
import { computed } from "@vue/composition-api";
import { Wallet } from "@/common/models/wallet";

export const useVuex = () => {
  return {
    store,
    wallet: computed(() => store.getters.Wallet.wallet as Wallet)
  };
};
