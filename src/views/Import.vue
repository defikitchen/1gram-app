<template>
  <Page>
    <PageHeader :padding="false">
      <v-tabs
        v-model="tab"
        class="mt-6"
        :mobile-break-point="500"
        color="black"
        centered
        light
        background-color="primary"
      >
        <v-tab v-for="item in items" :key="item.tab">{{ item.title }}</v-tab>
      </v-tabs>
    </PageHeader>
    <PageContent :disabled="allLoading" :width="500">
      <v-card class="mb-6">
        <network-list title="Select network" />
      </v-card>

      <v-tabs-items v-model="tab" class="mt-n3">
        <v-tab-item key="One">
          <v-textarea
            auto-grow
            v-model="form.mnemonic"
            :disabled="allLoading"
            single-line
            ref="phrase"
            rows="1"
            label="Secret phrase"
            hint="The 12-word phrase you wrote down"
          />

          <v-text-field
            v-model="form.path"
            :disabled="allLoading"
            single-line
            label="Derivation path (optional)"
            hint="Looks something like m/44/13371337/0'"
          />
        </v-tab-item>

        <v-tab-item key="Two">
          <v-textarea
            v-model="form.privateKey"
            :disabled="allLoading"
            :rows="1"
            auto-grow
            ref="pk"
            placeholder="Enter private key"
            hint="64 charachters code that looks something like 4385d7...7faf"
            :append-outer-icon="'qr_code'"
            @click:append-outer="scanPrivateKey"
          />

          <input
            type="file"
            accept="image/png"
            hidden
            ref="qr"
            @change="webReadPrivateKey($event)"
          />
        </v-tab-item>

        <v-tab-item key="Three">
          <v-textarea
            v-model="form.address"
            :disabled="allLoading"
            :rows="1"
            auto-grow
            ref="address"
            placeholder="Enter address"
            :append-outer-icon="'qr_code'"
            @click:append-outer="scanAddress"
          />
        </v-tab-item>
      </v-tabs-items>
      <div v-if="network && network.protocol === 'ton' && tab < 2">
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
      <v-btn large block v-if="!allLoading" color="accent" @click="submit">
        Import
        <v-icon right>arrow_downward</v-icon>
      </v-btn>

      <v-btn block large color="accent" v-else disabled
        >{{ "Importing wallet" }}...
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
import { defineComponent, computed, ref, watch } from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import getPlatform, { Platform } from "@/lib/get-platform";
import { getCache, setCache } from "@/lib/cache";
import { handleError, addTimeoutToPromise } from "@/lib/error-handling";
import { cordovaReadQr, HTMLInputEvent, readQr } from "@/lib/open-file";
import { validateMnemonic } from "bip39-ts";
import { forgeTimeout } from "@/lib/constants";
import { Ethers } from "@/sdk/web3";
import { isAddress } from "@/sdk/ton-js-client/client";
import { Network } from "@/models/network";
import { useQr } from "@/hooks/use-qr";

export default defineComponent({
  setup() {
    const {
      store: { state, dispatch, commit }
    } = useVuex();
    const pk = ref<HTMLInputElement>();
    const phrase = ref<HTMLInputElement>();
    const address = ref<HTMLInputElement>();
    const qrLoading = ref(false);
    const qr = ref<HTMLInputElement>();
    const isCordova = getPlatform() === Platform.Cordova;
    const allLoading = computed(
      () => state.Loading.loading || state.Wallet.forging || qrLoading.value
    );
    const network = computed(() => state.Wallet.network);
    const items = [
      { tab: "One", title: "Secret Phrase" },
      { tab: "Two", title: "Private Key" },
      { tab: "Three", title: "View only" }
    ];
    const { getQr } = useQr();

    const scanPrivateKey = async () => {
      const qr = await getQr();
      if (qr) form.value.privateKey = qr;
    };

    const scanAddress = async () => {
      const qr = await getQr();
      if (qr) form.value.address = qr;
    };

    const defaultForm = {
      privateKey: "",
      mnemonic: "",
      path: "",
      workchain: 0 as 0 | -1,
      address: ""
    };

    const form = ref({ ...defaultForm });
    const tabModel = ref(+getCache("preferedImportMethod", 1));

    const tab = computed({
      set: (value: number) => {
        tabModel.value = value;
        setCache("preferedImportMethod", value);
        setTimeout(() => {
          if (value === 0) phrase.value?.focus();
          if (value === 1) pk.value?.focus();
          if (value === 2) address.value?.focus();
        }, 600);
      },
      get: () => tabModel.value
    });

    watch(
      () => tab.value,
      () => reset()
    );

    const reset = () => {
      form.value = { ...defaultForm };
      if (qr?.value) qr.value.value = "";
    };

    const cordovaReadPrivateKey = async () => {
      try {
        const privateKey = (await cordovaReadQr()) || "";
        form.value.privateKey = privateKey;
        submit();
      } catch (error) {
        handleError(error, error);
      }
    };

    const webReadPrivateKey = async (event: HTMLInputEvent) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      qrLoading.value = true;
      try {
        const qr = await readQr(file);
        const privateKey: string = qr?.data || "";
        form.value.privateKey = privateKey;
      } catch (error) {
        handleError(error, "Not a valid QR code");
      }
      qrLoading.value = false;
    };

    const validMnemonic = computed(() =>
      validateMnemonic(form.value.mnemonic.trim())
    );
    const validPrivateKey = computed(() => {
      const key = form.value.privateKey.trim();
      return key.length >= 64 && key.length <= 66;
    });
    const validAddress = computed(() => {
      const address = form.value.address.trim();
      const protocol = network.value?.protocol;
      if (protocol === "ethereum") return Ethers.utils.isAddress(address);
      else if (protocol === "ton") return isAddress(address);
      return false;
    });

    const submit = async () => {
      if (tab.value === 0 && !validMnemonic.value) {
        return handleError(
          {},
          "Please use a valid secret phrase. Typicallly 12 words",
          6000
        );
      } else if (tab.value == 1 && !validPrivateKey.value) {
        return handleError(
          {},
          "Please use a valid private key. Typicallly 64 or 66 hexadecimal characters long",
          6000
        );
      } else if (tab.value === 2 && !validAddress.value) {
        return handleError({}, "Enter a valid address", 6000);
      }

      try {
        let privateKey: string | undefined = undefined;
        if (form.value.privateKey) privateKey = form.value.privateKey.trim();
        if (
          privateKey &&
          network.value?.protocol === "ethereum" &&
          privateKey.length === 64
        )
          privateKey = "0x" + privateKey;

        if (tab.value === 2) {
          await dispatch.Wallet.addViewWallet({
            address: form.value.address,
            network: network.value as Network
          });
        } else
          await addTimeoutToPromise(
            dispatch.Wallet.forgeWallet({
              imported: true,
              mnemonic: form.value.mnemonic || undefined,
              path: form.value.path || undefined,
              privateKey,
              workchain: form.value.workchain
            }),
            forgeTimeout
          );
      } catch (error) {
        commit.Wallet.setForging(false);
        handleError(error, error, 6000);
      }
      reset();
    };

    const onDecode = (e: any) => {
      console.log(e);
    };

    return {
      allLoading,
      isCordova,
      network,
      items,
      form,
      tab,
      submit,
      pk,
      phrase,
      qr,
      webReadPrivateKey,
      validPrivateKey,
      validMnemonic,
      validAddress,
      address,
      onDecode,
      scanAddress,
      scanPrivateKey
    };
  }
});
</script>

<style scoped lang="scss">
.v-tabs-items {
  background: none !important;
}
.v-window-item {
  padding: 0;
}

.pk-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  & > small {
    padding-right: 0.75rem;
  }
}

.v-tabs-bar.primary .v-tab,
.v-tabs-bar.primary .v-tabs-slider,
.v-tabs-bar.secondary .v-tab,
.v-tabs-bar.secondary .v-tabs-slider,
.v-tabs-bar.accent .v-tab,
.v-tabs-bar.accent .v-tabs-slider,
.v-tabs-bar.success .v-tab,
.v-tabs-bar.success .v-tabs-slider,
.v-tabs-bar.error .v-tab,
.v-tabs-bar.error .v-tabs-slider,
.v-tabs-bar.warning .v-tab,
.v-tabs-bar.warning .v-tabs-slider,
.v-tabs-bar.info .v-tab,
.v-tabs-bar.info .v-tabs-slider {
  color: #272727;
}

.v-tab {
  font-weight: 600;

  &--active {
    font-weight: 700;
  }
}
</style>

<style>
.v-tabs-slider {
  color: #272727 !important;
}
</style>
