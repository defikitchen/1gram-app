import { computed } from "@vue/composition-api";
import { useVuex } from "./use-vuex";

export const usePin = () => {
  const {
    store: { state, dispatch }
  } = useVuex();

  const pin = computed(() => state.Common.Login.pin);

  const getPin = async (force = false) => {
    let _pin = force ? null : pin.value;
    if (!_pin)
      _pin = await dispatch.Common.Login.promptPin({
        persistent: false
      });
    return _pin;
  };

  {
    return {
      getPin,
      pin
    };
  }
};
