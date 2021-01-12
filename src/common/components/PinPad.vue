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
          <v-btn x-large fab :color="color" @click="enter(i)" :ref="'key' + i">
            {{ i }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="i of [4, 5, 6]" :key="i">
          <v-btn x-large fab :color="color" @click="enter(i)" :ref="'key' + i">
            {{ i }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="i of [7, 8, 9]" :key="i">
          <v-btn x-large fab :color="color" @click="enter(i)" :ref="'key' + i">
            {{ i }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>&nbsp;</v-col>
        <v-col>
          <v-btn x-large fab :color="color" @click="enter(0)" :ref="'key' + 0"
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
            ref="del"
          >
            <v-icon>backspace</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  onUnmounted,
  ref,
  Ref,
  reactive
} from "@vue/composition-api";
import { Vue } from "vue-property-decorator";

export default defineComponent({
  props: {
    value: {
      default: ""
    },
    msg: {
      default: "Choose a PIN code"
    },
    open: {
      default: true
    }
  },
  setup(props, { emit }) {
    const color = "rgba(255, 255, 255, .05)";
    const keyMap = reactive({
      del: ref<null | Vue>(null),
      key0: ref<null | Vue>(null),
      key1: ref<null | Vue>(null),
      key2: ref<null | Vue>(null),
      key3: ref<null | Vue>(null),
      key4: ref<null | Vue>(null),
      key5: ref<null | Vue>(null),
      key6: ref<null | Vue>(null),
      key7: ref<null | Vue>(null),
      key8: ref<null | Vue>(null),
      key9: ref<null | Vue>(null)
    });

    const pin = computed({
      get: () => props.value,
      set(value: string) {
        emit("input", value);
        if (value.length === 6 && value !== props.value) {
          setTimeout(() => emit("submit", value), 200);
        }
      }
    });

    const enter = (value: number) => {
      if (pin.value.length === 6) return;
      pin.value += value;
    };

    const backspace = () => {
      pin.value = pin.value.substr(0, pin.value.length - 1);
    };

    onMounted(() => {
      document.addEventListener("keydown", keydown);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", keydown);
    });

    const keydown = (e: KeyboardEvent) => {
      if (!props.open) return;
      const focus = (name: string) => {
        try {
          const el = (): HTMLInputElement | undefined =>
            keyMap[name] &&
            ((keyMap[name] as Ref<Vue>).value?.$el as HTMLInputElement);
          setTimeout(() => el()?.focus(), 50);
          setTimeout(() => el()?.blur(), 200);
        } catch {
          //  nothing
        }
      };

      if (e.code === "Backspace") {
        backspace();
        focus("del");
      } else if (
        ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)
      ) {
        enter(+e.key);
        focus("key" + e.key);
      }
    };

    return {
      color,
      pin,
      enter,
      backspace,
      keydown,
      ...keyMap
    };
  }
});
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
