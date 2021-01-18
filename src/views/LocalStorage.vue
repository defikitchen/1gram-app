<template>
  <Page>
    <PageContent>
      <v-card class="pb-0">
        <v-card-actions>
          <v-btn text class="half-transparent" @click="exportStorage"
            >Export <v-icon right>file_copy</v-icon></v-btn
          >
          <v-btn text class="half-transparent" @click="clear"
            >Clear <v-icon right>block</v-icon></v-btn
          >
          <v-spacer />
          <v-btn text color="accent" @click="importStorage"
            >Import <v-icon right>save_alt</v-icon></v-btn
          >
        </v-card-actions>
        <v-divider />
        <v-textarea
          rows="5"
          class="type--depressed pa-1"
          ref="input"
          solo
          auto-grow
          placeholder="Paste a json string to import to LocalStorage"
          v-model="form.data"
        />
      </v-card>
    </PageContent>
  </Page>
</template>

<script lang="ts">
import { notify } from "@/store";
import { handleError } from "@/lib/error-handling";
import { pause } from "@/lib/helpers";
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref
} from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { dialog } from "@/main";
import { useCopy } from "@/hooks/use-copy";

export default defineComponent({
  setup() {
    const form = reactive({
      data: ""
    });
    const { store } = useVuex();
    const input = ref<null | HTMLInputElement>();

    onMounted(async () => {
      await pause(200);
      input?.value?.focus();
      store.commit.Common.Loading.stopLoading();
    });

    const storage = computed({
      get() {
        const data = JSON.stringify(localStorage, null, 2);
        return data;
      },
      set(value: string) {
        try {
          const obj = JSON.parse(value);
          if (typeof obj !== "object") return;
          localStorage.clear();
          Object.entries(obj).forEach(([key, val]) => {
            localStorage.setItem(key, val + "");
          });
        } catch (error) {
          console.warn(error);
        }
      }
    });

    const importStorage = async () => {
      const yes = await dialog.confirm({
        title: "Are you sure?",
        text:
          "Do you really want to overwrite all app data including wallets and keys?"
      });
      if (!yes) return;
      try {
        const obj = JSON.parse(form.data);
        if (typeof obj !== "object") return;
        localStorage.clear();
        Object.entries(obj).forEach(([key, val]) => {
          localStorage.setItem(key, val + "");
        });

        await notify({
          text: "Imported " + form.data.slice(0, 60) + "...",
          duration: 1000,
          payload: localStorage
        });
        form.data = "";
        location.reload();
      } catch (error) {
        handleError(error, error);
      }
    };

    const exportStorage = () => {
      useCopy(JSON.stringify(localStorage));
    };

    const clear = async () => {
      const yes = await dialog.confirm({
        title: "Are you sure?",
        text:
          "Do you really want to clear all app data including wallets and keys?"
      });
      if (yes) {
        localStorage.clear();
        location.reload();
      }
    };

    return {
      form,
      input,
      storage,
      clear,
      exportStorage,
      importStorage
    };
  }
});
</script>

<style lang="scss">
.type--depressed {
  .v-input__slot {
    box-shadow: none !important;
  }
  .v-input__slot {
    margin-bottom: 0;
  }
  .v-text-field__details {
    display: none;
  }
}
</style>
