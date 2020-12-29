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
import { Component, Vue, Emit, Watch } from "vue-property-decorator";
import store, { notify } from "@/common/store";
const { commit, state } = store;
import PinPad from "../components/PinPad.vue";
import { PinEventBus } from "../store/Common/Login";
import { handleError } from "../lib/error-handling";
import { pause } from "../lib/helpers";
import PageSubtitle from "../components/PageSubtitle.vue";

@Component({
  components: {
    PinPad,
    PageSubtitle
  }
})
export default class Template extends Vue {
  createdPin = "";
  confirmedPin = "";
  step: "create" | "confirm" | "enter" = "create";
  msg = " ";

  get title() {
    switch (this.step) {
      case "create":
        return "Choose a PIN code";
      case "confirm":
        return "Confirm PIN code";
      default:
        return "Enter PIN code";
    }
  }

  get enteredPin() {
    return state.Common.Login.pinDialogForm;
  }
  set enteredPin(value) {
    commit.Common.Login.setPinDialogForm(value);
  }

  get dialog() {
    return state.Common.Login.pinDialog;
  }

  set dialog(value) {
    commit.Common.Login.setPinDialog(value);
  }

  get persistent() {
    return !!state.Common.Login.pinDialogPersistent;
  }

  mounted() {
    commit.Common.stopLoading();
  }

  createPin() {
    this.step = "confirm";
  }

  async confirmPin() {
    if (this.createdPin && this.confirmedPin === this.createdPin) {
      try {
        await store.dispatch.Common.Login.create(this.createdPin);
        await pause(200);
        this.enterPin(this.createdPin);
      } catch (error) {
        handleError(error, error);
      }
    } else {
      this.confirmedPin = "";
      this.msg = "PIN codes don't match";
      setTimeout(() => (this.msg = " "), 1500);
    }
  }

  enterPin(pin: string) {
    PinEventBus.$emit("submit", pin);
  }

  @Watch("dialog", { deep: true, immediate: true })
  reset() {
    this.step = state.Common.Login.pinCreated ? "enter" : "create";
    this.createdPin = "";
    this.confirmedPin = "";
  }
}
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
