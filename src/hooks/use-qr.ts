import { computed, ref, watch } from "@vue/composition-api";
import { notify } from "@/store";
import { useRoute, useRouter } from "@/hooks/use-router";

let _useQr;

export const useQr = () => {
  if (_useQr) return _useQr;
  const qr = ref("");
  const isActive = ref(false);
  const open = () => router.push("?modal=qr");
  const close = () => router.push("?");
  const router = useRouter();
  const route = useRoute();
  const reset = () => (qr.value = "");

  watch(
    () => route.value.query.modal === "qr",
    val => {
      isActive.value = val;
    },
    {
      immediate: true
    }
  );

  const getQr = async (): Promise<string> => {
    await open();
    reset();

    return new Promise(res => {
      const stop = watch(
        () => qr.value,
        (val, old) => {
          if (val !== old && val) {
            const copy = val + "";
            stop();
            setTimeout(() => {
              close();
              reset();
              return res(copy);
            }, 1000);
            notify({
              text: `Scanned ${val}`,
              duration: 5000
            });
          }
        }
      );
    });
  };

  const instance = {
    qr,
    isActive,
    open,
    close,
    getQr
  };

  _useQr = instance;
  return _useQr;
};
