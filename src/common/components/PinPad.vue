<template>
  <div class="text-center">
    <div class="password">
      <span
        v-for="i in 6"
        :key="i"
        class="password__o"
        :class="{ active: i <= pin.length }"
      />
    </div>

    <p class="msg">
      {{ msg }}
    </p>

    <div class="keyboard">
      <v-row>
        <v-col v-for="i of [1, 2, 3]" :key="i">
          <v-btn x-large fab :color="color" @click="enter(i)" :ref="'key-' + i">
            {{ i }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="i of [4, 5, 6]" :key="i">
          <v-btn x-large fab :color="color" @click="enter(i)" :ref="'key-' + i">
            {{ i }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="i of [7, 8, 9]" :key="i">
          <v-btn x-large fab :color="color" @click="enter(i)" :ref="'key-' + i">
            {{ i }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>&nbsp;</v-col>
        <v-col>
          <v-btn x-large fab :color="color" @click="enter(0)" :ref="'key-' + 0"
            >0</v-btn
          >
        </v-col>
        <v-col>
          <v-btn
            text
            x-large
            fab
            class="half-transparent backspace"
            @click="backspace()"
            :ref="'backspace'"
          >
            <v-icon>backspace</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch, Prop } from "vue-property-decorator";
import store from "../store";

@Component({})
export default class PinPad extends Vue {
  @Prop({ default: "" }) value!: string;
  @Prop({ default: "Choose a PIN code" }) msg!: string;
  @Prop({ default: true }) open!: boolean;
  color = "rgba(255, 255, 255, .05)";

  get pin() {
    return this.value;
  }
  set pin(pin: string) {
    this.$emit("input", pin);
    if (pin.length === 6 && pin !== this.value) {
      setTimeout(() => this.$emit("submit", pin), 200);
    }
  }

  enter(value: number) {
    if (this.pin.length === 6) return;
    this.pin += value;
  }

  backspace() {
    this.pin = this.pin.substr(0, this.pin.length - 1);
  }

  mounted() {
    document.addEventListener("keydown", this.keydown);
  }

  destroyed() {
    document.removeEventListener("keydown", this.keydown);
  }

  keydown(e) {
    if (!this.open) return;
    const focus = (ref: any) => {
      try {
        const refs = this.$refs as any;
        const el = () =>
          refs[ref] && refs[ref].$el ? refs[ref].$el : refs[ref][0].$el;
        setTimeout(() => el().focus(), 50);
        setTimeout(() => el().blur(), 200);
      } catch {
        //  nothing
      }
    };

    if (e.code === "Backspace") {
      this.backspace();
      focus("backspace");
    } else if (
      ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)
    ) {
      this.enter(+e.key);
      focus("key-" + e.key);
    }
  }
}
</script>

<style>
.password input {
  letter-spacing: 9px;
  padding: 0.75rem 0.5rem;
  margin: auto;
  text-align: center;
}
</style>

<style lang="scss" scoped>
.password {
  text-align: center;
  margin-top: 6rem;
  &__o {
    $size: 18px;
    width: $size;
    height: $size;
    background: transparent;
    border: 2px solid rgba(white, 0.5);

    .theme--light & {
      border-color: rgba(black, 0.3);
    }
    border-radius: 50%;
    display: inline-block;
    margin: 0 $size / 2;

    transition: 0.3s ease;

    &.active {
      border-color: rgba(white, 0.9);
      background: rgba(white, 0.9);
      .theme--light & {
        border-color: rgba(black, 0.7);
        background: rgba(black, 0.7);
      }
    }
  }
}

.msg {
  line-height: 1.5rem;
  margin: 2.25rem auto;
  opacity: 0.6;
  min-height: 1.5rem;
}

.keyboard {
  margin: auto;
  max-width: 300px;
  margin-top: 2rem;
  margin-bottom: 6rem;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  min-height: 22rem;

  .v-btn {
    font-size: 20px;
    font-weight: 600;
    margin: -0.35rem 0;
    border: 1px solid rgba(white, 0.1) !important;
    box-shadow: none;

    &.backspace {
      background: none;
      border-color: transparent !important;

      .v-icon {
        font-size: 25px;
      }
    }
  }
}
</style>
