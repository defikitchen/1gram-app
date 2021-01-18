<template>
  <div
    class="swipe-btn"
    ref="slider"
    :class="sliderClass"
    :data-loading="loading"
  >
    <button type="submit" ref="submitButton" class="d-none"></button>

    <div
      ref="slideButton"
      class="swipe-btn__fab"
      :style="slideButtonStyle"
      @mousedown="startSwipe"
      @mousemove="continueSwipe"
      @mouseup="endSwipe"
      @touchstart="startSwipe"
      @touchmove="continueSwipe"
      @touchend="endSwipe"
    >
      <v-btn
        fab
        :color="
          loading
            ? loadingColor
            : error
            ? errorColor
            : completed
            ? completedColor
            : initialColor
        "
      >
        <v-icon
          v-text="error ? errorIcon : completed ? completedIcon : initialIcon"
          v-if="!loading"
        />
        <v-progress-circular v-else :size="30" indeterminate color="yellow" />
      </v-btn>
    </div>

    <div class="swipe-btn__background" :class="'elevation-' + elevation">
      <div
        ref="overlay"
        class="swipe-btn__background__overlay"
        :style="overlayStyle"
      />
    </div>

    <div
      class="swipe-btn__text"
      v-text="loading ? loadingText : error ? errorText : instructionText"
    />
  </div>
</template>

<script lang="ts">
import _get from "lodash/get";
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref
} from "@vue/composition-api";

export default defineComponent({
  props: {
    initialText: {
      default: "Swipe to continue"
    },
    completedText: {
      default: "Success!"
    },
    loadingText: {
      default: "Loading…"
    },
    initialColor: {
      default: "primary"
    },
    completedColor: {
      default: "success"
    },
    errorColor: {
      default: "error"
    },
    errorText: {
      default: "Complete all fields"
    },
    loadingColor: {
      default: "grey"
    },
    initialIcon: {
      default: "check"
    },
    completedIcon: {
      default: "check"
    },
    errorIcon: {
      default: "warning"
    },
    elevation: {
      default: "3"
    },
    loading: {
      default: false
    },
    error: {
      default: false
    }
  },
  setup(props, ctx) {
    const initialMouseX = ref(0);
    const currentMouseX = ref(0);
    const startDrag = ref(false);
    const endPoint = ref(500);
    const initialSliderWidth = ref(0);
    const initialSlideButtonPosition = ref(0);
    const instructionText = ref(props.initialText);
    const slideButtonStyle = ref({ left: "0px" });
    const getButtonWidth = () => {
      if (!slideButton || !slideButton.value) return 0;
      const slideButtonRect = slideButton?.value?.getClientRects()[0];
      return slideButtonRect.width;
    };
    const overlayStyle = ref({ width: getButtonWidth() / 2 + "px" });
    const sliderClass = ref("");
    const completed = ref(false);
    const slider = ref<null | HTMLElement>(null);
    const slideButton = ref<null | HTMLElement>(null);
    const submitButton = ref<null | HTMLElement>(null);
    const overlay = ref<null | HTMLElement>(null);

    const startSwipe = (event: MouseEvent | TouchEvent) => {
      if (completed.value) return;
      // this will be used to calculate the offset to increase the width
      // of the slider
      initialMouseX.value = getMouseXPosFromEvent(event);
      // once our slider's x button position >= slider - button's width,
      // the action is confirmed
      endPoint.value = getEndingPoint();
      calculateSliderInitialWidth();
      calculateSlideButtonInitialPosition();
      updateSlideButton(0);
      updateSlider(0);
      startDrag.value = true;
      // for transition animation
      sliderClass.value = "has--started";
    };

    const getEndingPoint = () => {
      if (!slider.value) return 0;
      const clientRects = slider.value.getClientRects()[0];
      return clientRects.right;
    };

    const calculateSliderInitialWidth = () => {
      if (!slider.value) return (initialSliderWidth.value = 0);
      const sliderLeftPos = slider.value.getClientRects()[0]["x"];
      initialSliderWidth.value = initialMouseX.value - sliderLeftPos;
      if (initialSliderWidth.value < 0) {
        initialSliderWidth.value = 0;
      }
    };

    const calculateSlideButtonInitialPosition = () => {
      if (!slider.value) return 0;
      initialSlideButtonPosition.value = slider.value.getClientRects()[0]["x"];
    };

    const continueSwipe = (event: MouseEvent | TouchEvent) => {
      if (!startDrag.value) return;
      currentMouseX.value = getMouseXPosFromEvent(event);
      const delta = currentMouseX.value - initialMouseX.value;
      updateSlider(delta);
      updateSlideButton(delta);
      if (sliderReachedEndPoint()) endSwipe();
    };

    const endSwipe = () => {
      startDrag.value = false;
      if (sliderReachedEndPoint()) {
        sliderClass.value = "has--completed";
        actionConfirmed();
      } else {
        sliderClass.value = "";
        slideButtonStyle.value.left = "0px";
        overlayStyle.value.width = getButtonWidth() / 2 + "px";
      }
    };

    const getMouseXPosFromEvent = (event: any) => {
      return event.clientX || _get(event, "touches[0].pageX") || 0;
    };

    const updateSlider = (delta: number) => {
      const sliderWidth = getSliderWidth();
      let newWidth = initialSliderWidth.value + delta;
      // prevent overflow
      if (newWidth > sliderWidth) newWidth = sliderWidth;
    };

    const getSliderWidth = () => {
      if (!slider.value) return 0;
      return slider.value.getClientRects()[0].width;
    };

    const updateSlideButton = (delta: number) => {
      if (delta < 0) return;
      slideButtonStyle.value.left = `${delta}px`;
      overlayStyle.value.width = `${delta + getButtonWidth() / 2}px`;
      // prevent overflow
      if (sliderReachedEndPoint()) {
        const buttonLeftPos = getSliderWidth() - getButtonWidth();
        slideButtonStyle.value.left = `${buttonLeftPos}px`;
        overlayStyle.value.width = `${buttonLeftPos + getButtonWidth() / 2}px`;
      }
    };

    const sliderReachedEndPoint = () => {
      if (!slideButton.value) return false;
      const slideButtonRect = slideButton.value.getClientRects()[0];
      return slideButtonRect.right >= endPoint.value;
    };

    const actionConfirmed = () => {
      // ensure the event is only fire once
      if (!completed.value) {
        completed.value = true;
        instructionText.value = props.error
          ? props.errorText
          : props.completedText;
        ctx.emit("confirm");
        setTimeout(reset, 1000);
      }
    };
    const reset = () => {
      completed.value = false;
      instructionText.value = props.initialText;
      sliderClass.value = "";
      updateSlider(0);
      updateSlideButton(0);
      slideButtonStyle.value.left = "0px";
      overlayStyle.value.width = getButtonWidth() / 2 + "px";
    };

    onMounted(() => {
      document.addEventListener("mousemove", continueSwipe);
      document.addEventListener("mouseup", endSwipe);
      overlayStyle.value = { width: getButtonWidth() / 2 + "px" };
    });

    onUnmounted(() => {
      document.removeEventListener("mousemove", continueSwipe);
      document.removeEventListener("mouseup", endSwipe);
    });

    const submit = () => {
      if (!submitButton.value) return;
      submitButton.value.click();
    };

    return {
      submit,
      slideButtonStyle,
      startSwipe,
      continueSwipe,
      endSwipe,
      overlayStyle,
      reset,
      sliderClass,
      completed,
      instructionText,
      slideButton,
      slider,
      submitButton,
      overlay
    };
  }
});
</script>

<style lang="scss" scoped>
$size: 54px;
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
@mixin nonselect {
  user-select: none;
  cursor: default;
}

.swipe-btn {
  position: relative;
  height: $size;
  @include flex-center;
  @include nonselect;
  margin-left: -60px;
  margin-right: -60px;

  &[data-loading] {
    pointer-events: none;
  }

  &__background__overlay,
  &__fab {
    .has--started & {
      transition: none;
    }
  }

  &__fab {
    transition: 0.5s ease;
    position: absolute;
    z-index: 5;
    @include flex-center;
  }

  &__text {
    @include nonselect;
    text-transform: uppercase;
    font-size: 13px;
    @media screen and (max-width: 600px) {
      font-size: 13px;
    }
    font-weight: 500;
    letter-spacing: 1.125px;
    position: relative;
    z-index: 2;
  }

  &__background {
    $size: $size - 0;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    left: 0;
    height: $size;
    border-radius: $size / 2;
    overflow: hidden;
    background: rgba(white, 0.09);

    .v-application.theme--light & {
      background: white;
    }

    &__overlay {
      /* this defines the return animation when user touchout */
      transition: 0.5s ease;
      position: absolute;
      left: 0px;
      width: 100px;
      height: $size;
      @include flex-center;
      @include nonselect;
      background: rgba(white, 0.1);

      .v-application.theme--light & {
        background: rgba(black, 0.1);
      }
    }
  }
}
</style>
