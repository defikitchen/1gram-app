<template>
  <v-card class="pin-prompt">
    <v-app-bar flat color="transparent">
      <v-row>
        <v-col :cols="2">
          <v-btn
            @click="dialog = false"
            icon
            class="ml-n1"
            v-if="step !== 'confirm' && !persistent"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-btn @click="reset()" icon v-if="step === 'confirm'" class="ml-n1">
            <v-icon>close</v-icon>
          </v-btn>
        </v-col>
        <v-col :cols="8" class="d-flex justify-center align-center">
          <v-toolbar-title class="title">
            {{ title }}
          </v-toolbar-title>
        </v-col>
        <v-col :cols="2" class="d-flex justify-end" />
      </v-row>
    </v-app-bar>

    <div class="pin-prompt__container">
      <div class="page__subtitle" v-if="step === 'create'">
        You cannot change this PIN code later
      </div>
      <div class="page__subtitle" v-if="step === 'confirm'">
        Type your PIN again to confirm
      </div>

      <PinPad
        v-model="createdPin"
        v-if="step === 'create'"
        :msg="msg"
        @submit="createPin"
        :open="dialog && step === 'create'"
      />
      <PinPad
        v-model="confirmedPin"
        v-if="step === 'confirm'"
        :msg="msg"
        @submit="confirmPin"
        :open="dialog && step === 'confirm'"
      />
      <PinPad
        v-model="enteredPin"
        v-if="step === 'enter'"
        :msg="msg"
        @submit="enterPin"
        :open="dialog && step === 'enter'"
      />
    </div>
  </v-card>
</template>

<script lang="ts">
import store from "@/common/store";
import PinPad from "../components/PinPad.vue";
import { PinEventBus } from "../store/Common/Login";
import { handleError } from "../lib/error-handling";
import { pause } from "../lib/helpers";
import PageSubtitle from "../components/PageSubtitle.vue";
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch
} from "@vue/composition-api";
import { useVuex } from "../hooks/use-vuex";

export default defineComponent({
  components: {
    PinPad,
    PageSubtitle
  },
  setup() {
    const createdPin = ref("");
    const confirmedPin = ref("");
    const msg = ref(" ");
    const step = ref<"create" | "confirm" | "enter">("create");
    const { store } = useVuex();

    const enteredPin = computed({
      get: () => store.state.Common.Login.pinDialogForm,
      set: store.commit.Common.Login.setPinDialogForm
    });

    const dialog = computed({
      get: () => store.state.Common.Login.pinDialog,
      set: (store.commit.Common.Login as any).setPinDialogForm
    });

    const title = computed(() => {
      switch (step.value) {
        case "create":
          return "Choose a PIN code";
        case "confirm":
          return "Confirm PIN code";
        default:
          return "Enter PIN code";
      }
    });

    const persistent = computed(() => {
      return !!store.state.Common.Login.pinDialogPersistent;
    });

    onMounted(() => {
      store.commit.Common.stopLoading();
    });

    const createPin = () => {
      step.value = "confirm";
    };

    const confirmPin = async () => {
      if (createdPin.value && confirmedPin.value === createdPin.value) {
        try {
          await store.dispatch.Common.Login.create(createdPin.value);
          await pause(200);
          enterPin(createdPin.value);
        } catch (error) {
          handleError(error, error);
        }
      } else {
        confirmedPin.value = "";
        msg.value = "PIN codes don't match";
        setTimeout(() => (msg.value = " "), 1500);
      }
    };

    const enterPin = (pin: string) => {
      PinEventBus.$emit("submit", pin);
    };

    const reset = () => {
      step.value = store.state.Common.Login.pinCreated ? "enter" : "create";
      createdPin.value = "";
      confirmedPin.value = "";
    };

    watch(() => dialog.value, reset, { immediate: true, deep: true });

    return {
      createdPin,
      confirmedPin,
      msg,
      step,
      enteredPin,
      dialog,
      title,
      persistent,
      createPin,
      enterPin,
      reset,
      confirmPin
    };
  }
});
</script>

<style lang="scss">
.pin-prompt {
  $dark: rgba(#121212, 1);
  $light: rgba(#fff, 1);
  background: $dark;
  border-radius: 0 !important;
  .theme--light & {
    background: $light;
  }

  &__container {
    max-width: 400px;
    margin: auto;
    padding: 1rem 1rem 0;
    position: relative;
  }
  .page__subtitle {
    //top
    color: white;
    min-width: 300px;
  }
}
</style>
