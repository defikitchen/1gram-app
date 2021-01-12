<template>
  <v-list-item class="px-0 image-upload">
    <v-list-item-avatar
      v-if="!fileOnly"
      @click="$refs.input.click()"
      class="clickable mr-2"
    >
      <v-img
        :lazy-src="fileBase64"
        alt="Image Upload"
        v-if="fileBase64 && !loading"
      />
      <v-avatar color="grey" v-else>
        <v-progress-circular
          v-if="loading || base64Loading"
          width="2"
          size="24"
          color="white"
          indeterminate
        />
        <v-icon color="white" v-else small v-text="icon" />
      </v-avatar>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title style="overflow: initial;">
        <v-btn
          @click="$refs.input.click()"
          :loading="loading || base64Loading"
          :disabled="disabled"
          type="button"
          :color="color"
        >
          <span
            v-if="fileBase64 && showFileName"
            class="image-upload__filename"
            >{{ file.name }}</span
          >
          <template v-if="!showFileName || (!fileBase64 && showFileName)">{{
            text
          }}</template>
          <v-icon
            right
            v-if="fileBase64"
            @click.stop="reset"
            v-text="'close'"
          />
        </v-btn>
      </v-list-item-title>
    </v-list-item-content>

    <input
      type="file"
      hidden
      ref="input"
      :accept="accept"
      @change="fileChange"
    />
  </v-list-item>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "@vue/composition-api";
import { handleError } from "../lib/error-handling";
import { getBase64 } from "../lib/get-base64";

export interface HTMLFileInputEvent extends HTMLInputElement {
  target: {
    files?: File[];
  };
}

export default defineComponent({
  props: {
    color: {
      default: "primary"
    },
    disabled: Boolean,
    text: {
      default: "Select Image"
    },
    showFileName: {
      default: true
    },
    loading: {
      default: false
    },
    icon: {
      default: "photo"
    },
    fileOnly: {
      default: false
    },
    accept: {
      default: "image/jpeg, image/png"
    }
  },
  setup(_, { emit }) {
    const input = ref<null | HTMLInputElement>(null);
    const file = computed(() => {
      return (
        input && input.value?.value && input.value.files && input.value.files[0]
      );
    });
    const fileBase64 = ref<string | null>(null);
    const base64Loading = ref(false);

    const reset = () => {
      fileBase64.value = null;
      base64Loading.value = false;
      if (input.value) input.value.value = "";
      emit("reset");
    };

    const fileChange = async (event: HTMLFileInputEvent) => {
      const file = event.target.files && event.target.files[0];
      if (file) {
        emit("fileChange", file);
        base64Loading.value = true;
        try {
          fileBase64.value = (await getBase64(file)) as string;
          emit("base64Change", fileBase64.value);
        } catch (error) {
          handleError(error, "Couldn't get image", 4000);
        } finally {
          base64Loading.value = false;
        }
      } else {
        emit("base64Change", null);
        emit("fileChange", null);
      }
    };

    return {
      input,
      file,
      reset,
      fileChange
    };
  }
});
</script>

<style>
.image-upload__filename {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
