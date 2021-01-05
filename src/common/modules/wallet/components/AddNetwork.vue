<template>
  <v-form
    @submit.prevent="submit"
    v-model="formModel"
    ref="formRef"
    class="pa-4"
  >
    <!-- <div class="mb-2">
      <v-label class="label">Protocol</v-label>
      <v-btn
        x-small
        class="ml-2"
        @click="form.protocol = 'ton'"
        :input-value="form.protocol === 'ton'"
        >TON</v-btn
      >
      <v-btn
        class="ml-1"
        x-small
        @click="form.protocol = 'ethereum'"
        :input-value="form.protocol === 'ethereum'"
        >Ethereum</v-btn
      >
    </div> -->

    <v-text-field
      label="ID"
      type="number"
      v-model.number="form.id"
      :rules="IDRules"
    />
    <v-text-field label="Name" v-model="form.name" :rules="nameRules" />
    <v-text-field label="Decimals" v-model.number="form.decimals" />
    <v-text-field label="Symbol" v-model="form.symbol" />
    <v-text-field label="Block Explorer URL" v-model="form.blockExplorerURL" />
    <v-btn block large color="accent" type="submit">Add Network</v-btn>
  </v-form>
</template>

<script lang="ts">
import { Network } from "@/common/models/network";
import { makeid } from "@/common/lib/makeid";
import { notify } from "@/common/store";
import { defineComponent, ref } from "@vue/composition-api";
import { defaultTonNetwork } from "@/common/lib/constants";

export default defineComponent({
  setup(_, ctx) {
    const formRef = ref(null);
    const formModel = ref(true);
    const defaultForm = defaultTonNetwork;
    const form = ref({ ...defaultForm });
    const IDRules = ref([v => !!v || "ID is required"]);
    const nameRules = ref([v => !!v || "Name is required"]);

    const submit = () => {
      (formRef.value as any)?.validate();
      if (!formModel.value)
        return notify({
          text: "Please fill out all required fields",
          type: "error",
          duration: 4000
        });
      ctx.emit("submit", form.value);
      form.value = { ...defaultForm };
    };

    return {
      form,
      defaultForm,
      formModel,
      IDRules,
      nameRules,
      formRef,
      submit
    };
  }
});
</script>

<style lang="scss" scoped>
.v-label {
  margin: 0;
  vertical-align: middle;
  font-size: 13px;
}
</style>
