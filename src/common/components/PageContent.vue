<template>
  <div class="page__content" :class="{ 'is--disabled': disabled }">
    <div class="page__content__scroll">
      <div
        class="page__content__scroll__container"
        :class="{ 'd-flex': flex }"
        :style="{ 'max-width': maxWidth }"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import { Component, Vue, Prop } from "vue-property-decorator";

export default defineComponent({
  props: {
    flex: Boolean,
    disabled: Boolean,
    width: {
      default: 500
    }
  },
  setup(props) {
    const maxWidth = computed(() => {
      return isNaN(props.width) ? props.width + "" : props.width + "px";
    });

    return {
      maxWidth
    };
  }
});
</script>

<style scoped lang="scss">
.page__content {
  transition: 0.3s ease-in;
}

.page__content__scroll__container {
  margin: auto;
  padding: 2.75rem 1rem 3.5rem;
  min-height: 100%;
  max-width: 500px;

  @media screen and (max-width: 960px) {
    padding: 2rem 1rem 3.5rem;
  }

  @media screen and (max-width: 600px) {
    padding: 1.5rem 1rem 3.5rem;
  }
}

.page__content.is--disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
