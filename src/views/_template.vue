<template>
  <Page>
    <PageContent>
      <pre>{{ title }}</pre>
    </PageContent>
    <PageFooter :padding="true">
      <v-btn block color="accent" large @click="submit">Submit</v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { notify } from "@/store";

export default defineComponent({
  setup() {
    const { store } = useVuex();
    onMounted(() => {
      store.commit.Common.Loading.stopLoading();
    });

    return {
      submit() {
        notify({
          text: "Submitting works!",
          type: "success",
          duration: Infinity,
          payload: {
            foo: "bar"
          }
        });
      }
    };
  }
});
</script>
