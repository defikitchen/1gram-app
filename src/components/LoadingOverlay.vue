<template>
  <v-sheet
    class="overlay"
    :class="{ 'is--loading': loadingOverlay }"
    :dark="$vuetify.theme.dark"
  >
    <v-container fluid>
      <div class="status">{{ status }}</div>

      <v-progress-circular
        class="circle"
        :size="55"
        indeterminate
        color="yellow"
      />

      <div class="actions" v-if="redirectButton">
        <v-btn mt-3 :to="redirectButton[1]">{{ redirectButton[0] }}</v-btn>
      </div>
    </v-container>
  </v-sheet>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";

export default defineComponent({
  setup() {
    const { store } = useVuex();
    const status = computed(() => store.state.Loading.status);
    const loadingOverlay = computed(() => store.state.Loading.loadingOverlay);
    const loading = computed(() => store.state.Loading.loading);
    const redirectButton = computed(() => store.state.Loading.redirectButton);

    return {
      status,
      loadingOverlay,
      loading,
      redirectButton
    };
  }
});
</script>

<style scoped lang="scss">
.status {
  text-align: center;
  display: block;
  margin: 30px auto;
  font-size: 1.5rem;
  opacity: 0.7;
}
.actions {
  text-align: center;
  display: block;
  margin: 30px auto;
  pointer-events: all;
}
.circle {
  margin: 1rem auto;
  display: block;
  color: #edc036;
}
.overlay {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  border-radius: 0;
  margin-top: 0;
  z-index: 300;
  top: 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  min-height: 100vh;
  transition: 0.25s ease;
  visibility: hidden;
  pointer-events: all;

  &.is--loading {
    opacity: 1;
    visibility: visible;
  }
}
</style>
