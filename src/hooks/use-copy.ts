import { notify } from "@/store";
import { useVuex } from "@/hooks/use-vuex";

export const useCopy = (str: string) => {
  const { store } = useVuex();
  store.dispatch.copy(str).catch(() => {
    notify({
      text: "Couldn't copy",
      type: "error",
      duration: 1500,
      payload: { str }
    });
  });
};
