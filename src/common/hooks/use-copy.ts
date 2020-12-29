import { notify } from "../store";
import { useVuex } from "./use-vuex";

export const useCopy = (str: string) => {
  const { store } = useVuex();
  store.original.dispatch("Common/copy", str).catch(() => {
    notify({
      text: "Couldn't copy",
      type: "error",
      duration: 1500,
      payload: { str }
    });
  });
};
