<template>
  <div
    :class="{ 'elevation-3': help.open }"
    style="position: relative; z-index: 3;"
  >
    <div class="help-drawer" :class="{ 'is--open': help.open }">
      <h5 class="help-drawer__content">
        <span
          v-for="(step, i) in help.steps"
          :key="i"
          :class="{ 'is--active': i === help.activeIndex }"
          >{{ step.content }}</span
        >
      </h5>

      <div class="help-drawer__action">
        <v-btn
          icon
          @click="next"
          light
          v-if="!last"
          class="half-transparent"
          :dark="!$vuetify.theme.dark"
        >
          <v-icon>keyboard_arrow_right</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="closeHelp"
          class="half-transparent"
          light
          :dark="!$vuetify.theme.dark"
          v-else
        >
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";

export default defineComponent({
  setup() {
    const { store } = useVuex();
    const help = computed(() => store.state.Help);
    const showOverlay = computed(() => store.getters.Help.showHelpOverlay);
    const last = computed(() => store.getters.Help.lastHelpStep);

    const closeHelp = () => {
      store.commit.Help.setHelpOpen(false);
      setTimeout(() => {
        store.commit.Help.setActiveIndex(0);
      }, 300);
    };

    const openHelp = () => {
      store.commit.Help.setHelpOpen(true);
    };

    const next = () => {
      store.dispatch.Help.nextHelpStep();
    };

    return {
      help,
      showOverlay,
      last,
      closeHelp,
      openHelp,
      next
    };
  }
});
</script>

<style lang="scss">
[data-help-mode="true"]:not([data-help-overlay="false"]) {
  .help-step:not(.help--active) {
    display: none;
  }
}

[data-help] {
  &[data-help-active="true"] {
    position: relative;
    z-index: 10000;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
      0 4px 5px 0 rgba(0, 0, 0, 0.14);
  }
}

.main-content__wrap__help {
  position: relative;
  z-index: 20;
}

.help-drawer {
  overflow: hidden;
  transition: all 0.5s ease;
  text-align: center;
  max-height: 0;
  background: white;
  box-shadow: inset 0 2px 7px -1px rgba(0, 0, 0, 0.4);
  color: grey;
  position: relative;

  .theme--light & {
    background: #1e1e1e;
    color: grey;
  }

  &__action {
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    z-index: 2;
  }

  &__content {
    position: relative;
    font-size: 16px;
    margin: 0;
    line-height: 1.4;
    padding: 1rem 2.5rem;
    font-weight: 450;

    & > span {
      overflow: hidden;
      opacity: 0;
      max-height: 0;
      display: block;
      position: relative;
      transition: none;
      transition: opacity 0.7s ease-out, transform 0.4s ease-out;
      transform: translateX(30%);

      &.is--active {
        max-height: 150px;
        opacity: 1;
        z-index: 2;
        transform: translateX(0);
      }
    }
  }

  &.is--open {
    max-height: 150px;
  }
}

.v-overlay-click {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
