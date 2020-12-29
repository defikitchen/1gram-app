<template>
  <Page>
    <portal to="page-title">New Wallet</portal>
    <page-subtitle>Choose a name</page-subtitle>
    <PageHeader :disabled="forging">
      <v-text-field
        class="type--large my-3"
        label="Enter Name"
        single-line
        light
        ref="name"
        @keydown.enter="submit"
        hide-details
        flat
        :loading="forging"
        :disabled="forging"
        height="4rem"
        solo
        v-model="form.name"
      />
    </PageHeader>
    <PageContent :disabled="forging">
      <v-card>
        <network-list title="Select network" />
      </v-card>

      <div v-if="network && network.protocol === 'ton'">
        <v-subheader class="px-0">Workchain</v-subheader>
        <v-btn
          small
          classs="mr-1"
          @click="form.workchain = 0"
          :input-value="form.workchain === 0"
          >0</v-btn
        >
        <v-btn
          small
          @click="form.workchain = -1"
          :input-value="form.workchain === -1"
          >-1</v-btn
        >
      </div>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn @click="submit" block large color="accent" v-if="!forging">{{
        forging ? forgingString : "Create Wallet"
      }}</v-btn>
      <v-btn block large color="accent" v-else disabled
        >{{ forgingString || "Forging wallet" }}...
        <v-progress-circular
          width="2"
          size="15"
          class="ml-2"
          color="rgba(255,255,255,.3)"
          indeterminate
        />
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { getNextName } from "@/common/store/Wallet/Wallet";
import { notify } from "@/common/store";
import {
  defineComponent,
  computed,
  ref,
  onMounted
} from "@vue/composition-api";
import { useVuex } from "@/common/hooks/use-vuex";
import { handleError } from "@/common/lib/error-handling";

export default defineComponent({
  setup() {
    const {
      store: { state, commit, dispatch }
    } = useVuex();
    const form = ref({
      name: "",
      workchain: 0 as 0 | -1
    });
    const name = ref<HTMLInputElement | null>(null);
    const network = computed(() => state.Wallet.network);
    const forging = computed(() => state.Wallet.forging);
    const forgingString = computed(() => state.Wallet.forgingString);

    onMounted(() => {
      form.value.name = getNextName(
        "Wallet",
        state.Wallet.wallets.map(w => w.name)
      );
      setTimeout(() => {
        name.value?.focus();
      }, 500);
    });

    const submit = async () => {
      const alert = (text: string) =>
        notify({
          text,
          type: "error",
          duration: 2000
        });
      const exists = state.Wallet.wallets
        .map(w => w.name)
        .find(n => n === form.value.name);

      if (!network.value) {
        return alert("Please select a network");
      } else if (exists) {
        return alert("A wallet with this name already exists");
      }

      try {
        await dispatch.Wallet.forgeWallet({
          name: form.value.name,
          workchain: form.value.workchain
        });
      } catch (error) {
        handleError(error, error, 6000);
      } finally {
        commit.Wallet.setForging(false);
      }
    };

    return {
      network,
      forging,
      forgingString,
      form,
      name,
      submit
    };
  }
});
</script>

<style scoped></style>
