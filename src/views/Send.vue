<template>
  <Page v-if="wallet">
    <PageSubtitle>
      {{
        token(wallet.balance, wallet.network.symbol, wallet.network.decimals)
      }}
      available
    </PageSubtitle>
    <portal to="page-title"
      ><span class="clickable-bg" @click="$router.push('?modal=walletMenu')"
        >Send from {{ shortify(wallet.address, 4) }}
        <v-icon small class="mx-n1">expand_more</v-icon></span
      ></portal
    >
    <PageHeader :width="500">
      <v-text-field
        type="number"
        label="0"
        single-line
        :max="maxAmount"
        :min="0"
        height="4rem"
        solo
        light
        autocomplete="off"
        flat
        ref="amount"
        hide-details
        class="type--large mt-8 mb-3"
        v-model.number="form.amount"
        @click:append="
          wallets.length > 1 ? selectWallet : $router.push('/wallet/create')
        "
        :error="fieldError('amount').length > 0"
        :error-messages="[...fieldError('amount')]"
      />
    </PageHeader>
    <PageContent :width="532">
      <div>
        <v-list class="list--clean mt-n2">
          <v-list-item to="?modal=walletMenu" class="px-4">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'From'" />
              <v-list-item-title class="mt-2">{{
                wallet.address
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-0 mx-4" />

          <v-list-item class="px-4">
            <v-list-item-content>
              <v-combobox
                v-model="form.addr"
                label="To"
                :items="comboboxItems"
                :append-outer-icon="'qr_code'"
                @click:append-outer="scanQr"
                :hide-no-data="true"
                item-value="addr"
                :return-object="false"
                autocomplete="off"
                hide-details
                class="mt-n2"
                :error-messages="fieldError('addr')"
              >
                <template v-slot:append-item>
                  <v-list-item
                    @click.stop="() => {}"
                    :to="{ query: { modal: 'addContact' } }"
                  >
                    <v-list-item-icon>
                      <v-icon class="slightly-transparent">add</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title
                      ><v-subheader class="px-0"
                        >Contacts</v-subheader
                      ></v-list-item-title
                    >
                  </v-list-item>
                </template>
                <template v-slot:item="{ index, item }">
                  <template v-if="item.type === 'contact'">
                    <div class="px-4" style="flex-grow: 1; display: flex">
                      <v-list-item-content>
                        <div class="combobox__content__max-width">
                          {{ item.name }}
                        </div>
                        <v-list-item-subtitle>{{
                          shortify(item.addr, 15)
                        }}</v-list-item-subtitle>
                      </v-list-item-content>

                      <v-spacer />
                      <v-list-item-action class="text-right">
                        <v-list-item-action-text
                          >contact</v-list-item-action-text
                        >
                      </v-list-item-action>
                    </div>
                  </template>
                  <wallet-item
                    v-else
                    :wallet="item.wallet"
                    :divider="index !== 0"
                    style="flex-grow: 1"
                  />
                </template>
              </v-combobox>
            </v-list-item-content>
          </v-list-item>

          <v-divider class="my-0 mx-4" />

          <v-list-item class="px-4">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Fee (estimate)'" />
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text class="text-right">
                <v-progress-circular
                  width="2"
                  size="15"
                  class="ml-2"
                  :color="
                    $vuetify.theme.dark
                      ? 'rgba(255,255,255,.55)'
                      : 'rgba(0,0,0,.55)'
                  "
                  indeterminate
                  v-if="loadingFee"
                />
                <span class="error--text" v-else-if="feeError">{{
                  feeError
                }}</span>
                <template v-else>{{
                  token(fee, wallet.network.symbol, 0)
                }}</template>
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>

          <v-divider class="my-0 mx-4" />

          <v-list-item class="px-4">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Total (estimate)'" />
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text class="text-right">{{
                token(total, wallet.network.symbol, 0)
              }}</v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn @click="submit" block large color="accent" :loading="loading">
        <span class="mt-n1">
          Send
          {{ token(form.amount || 0, wallet.network.symbol, 0) }}
        </span>
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Wallet } from "@/models/wallet";
import { PendingTx } from "@/models/tx";
import { notify } from "@/store";
import { calcFees, getClient, KeyPair } from "@/sdk";
import { decrypt } from "@/lib/crypto";
import { token, useFilters } from "@/lib/format";
import BigNumber from "bignumber.js";
import { useEthereum } from "@/hooks/use-ethereum";
import { useQr } from "@/hooks/use-qr";
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  watch
} from "@vue/composition-api";
import { useVuex } from "@/hooks/use-vuex";
import { useRoute, useRouter } from "@/hooks/use-router";

export default defineComponent({
  setup() {
    const {
      store: { state, commit, getters, dispatch }
    } = useVuex();
    const loading = computed(() => state.Loading.loading);
    const pendingTransaction = computed(() => state.Wallet.pendingTransaction);
    const wallets = computed(() => state.Wallet.wallets);
    const wallet = computed(() => getters.Wallet.wallet as Wallet);
    const addresses = computed(() => getters.Wallet.usedAddresses);
    const qr = ref<null | HTMLElement>(null);
    const amount = ref<null | HTMLElement>(null);
    const fee = ref(0);
    const feeError = ref("");
    const defaultForm = {
      amount: null as null | number,
      comment: "",
      addr: "",
      touched: false
    };
    const router = useRouter();
    const route = useRoute();
    const form = reactive({ ...defaultForm });
    const loadingFee = ref(false);

    const comboboxItems = computed(() => {
      const fromWallet = state.Wallet.wallets
        .map(w => ({
          type: "wallet",
          wallet: w,
          addr: w.address,
          network: w.network
        }))
        .filter(item => wallet.value.address !== item.wallet.address)
        .filter(item => wallet.value.network.name === item.wallet.network.name);

      const fromContacts = state.Contacts.contacts.map(c => ({
        type: "contact",
        name: c.name,
        addr: c.address,
        network: c.network
      }));

      return [...fromWallet, ...fromContacts]
        .filter(item => wallet.value.address !== item.addr)
        .filter(item => wallet.value.network.name === item.network.name);
    });

    onBeforeMount(() => {
      if (!wallet.value) router.push("/portfolio");
      else if (pendingTransaction.value) {
        form.amount = pendingTransaction.value.amount
          ? new BigNumber(pendingTransaction.value.amount)
              .div(10 ** wallet.value.network.decimals)
              .toNumber()
          : null;
        form.comment = pendingTransaction.value.comment || "";
        form.addr = pendingTransaction.value.to;
      }
    });

    const resetForm = () => Object.assign(form, defaultForm);

    const amountHint = computed(() => {
      return `${token(
        wallet.value.balance || 0,
        wallet.value.network.symbol,
        wallet.value.network.decimals
      )} available`;
    });

    const fieldError = (field: string) => {
      return form.touched && hasError.value && error[field]
        ? [error[field]]
        : [];
    };

    const selectWallet = () => {
      router.push({
        path: "/portfolio",
        query: {
          redirect: route.value.path
        }
      });
    };

    const total = computed(() => {
      return +(form.amount || 0) + fee.value;
    });

    const scanQr = async () => {
      const qr = await useQr().getQr();
      if (qr) form.addr = qr;
    };

    const maxAmount = computed(() => {
      return new BigNumber(wallet.value.balance || 0)
        .div(10 ** wallet.value.network.decimals)
        .toNumber();
    });

    const error = computed(() => {
      let _error: { [key: string]: string } = {};

      if ((form.amount || 0) <= 0) {
        _error.amount = "Amount is required";
      }
      if (wallet.value && (form.amount || 0) > maxAmount.value) {
        _error.amount = "Amount exceeds balance " + amountHint.value;
      }
      if (!wallet.value) {
        _error.amount = "Please select a Wallet";
      }
      if (!form.addr) {
        _error.addr = "Please select a recipient address";
      }
      if (form.addr === wallet.value.address) {
        _error.addr = "You can't send to yourself";
      }
      if (loadingFee.value) {
        _error.amount = "Calculating fee...";
      }

      if (feeError.value) {
        _error.amount =
          feeError.value + ". Your balance is not enough to cover the fees";
      }

      return _error;
    });

    const hasError = computed(() => {
      return Object.keys(error.value).length > 0;
    });

    const touch = () => (form.touched = true);

    onMounted(() => {
      commit.Loading.stopLoading();
      setTimeout(() => {
        amount?.value?.focus();
      }, 200);
    });

    const changes = computed(() => [form, wallet.value]);

    const getFees = async () => {
      if (!form.amount || !form.addr) {
        feeError.value = "";
        return (fee.value = 0);
      }
      try {
        loadingFee.value = true;
        if (wallet.value.network.protocol === "ton") {
          const client = await getClient(
            wallet.value.network.name as
              | "net.ton.dev"
              | "main.ton.dev"
              | "rust.ton.dev"
              | "fld.ton.dev"
          );

          let pin = state.Login.pin;
          if (!pin)
            pin = await dispatch.Login.promptPin({
              persistent: false
            });
          const keypair: KeyPair = JSON.parse(
            decrypt(wallet.value.keyPair, pin || "")
          );

          feeError.value = "";
          const amount = new BigNumber(form.amount || 0)
            .times(10 ** wallet.value.network.decimals)
            .toNumber();
          console.log(amount);

          const fees = await calcFees(
            client,
            wallet.value.address,
            form.addr,
            amount,
            keypair
          );
          fee.value = new BigNumber((fees && fees?.totalFees) || 0)
            .div(10 ** wallet.value.network.decimals)
            .toNumber();
        }

        if (wallet.value.network.protocol === "ethereum") {
          const { estimateGas } = useEthereum();
          const _fee = await estimateGas(wallet.value, form.addr, form.amount);
          fee.value = new BigNumber(_fee)
            .div(10 ** wallet.value.network.decimals)
            .toNumber();
        }
      } catch (error) {
        feeError.value = error.message || "Unknown error";
        console.warn("[feeError]", error);
        fee.value = 0;
      } finally {
        loadingFee.value = false;
      }
    };

    watch(() => changes.value, getFees, { deep: true, immediate: true });

    const submit = () => {
      touch();

      if (hasError.value) {
        const firstError = Object.values(error.value).find(item => !!item);
        notify({
          text: firstError as string,
          duration: 2500,
          type: "error",
          payload: { form, error }
        });
      } else {
        const transaction: PendingTx = {
          amount: new BigNumber(form.amount || 0)
            .times(10 ** wallet.value.network.decimals)
            .toNumber(),
          comment: form.comment,
          from: wallet.value.address,
          to: form.addr,
          estimatedFees: new BigNumber(fee.value)
            .times(10 ** wallet.value.network.decimals)
            .toNumber()
        };
        commit.Wallet.setPendingTx(transaction);
        resetForm();
        router.push("/wallet/receipt");
      }
    };

    return {
      ...useFilters(),
      loading,
      pendingTransaction,
      wallets,
      wallet,
      comboboxItems,
      qr,
      amount,
      fee,
      feeError,
      addresses,
      form,
      resetForm,
      amountHint,
      fieldError,
      selectWallet,
      total,
      scanQr,
      maxAmount,
      error,
      touch,
      hasError,
      getFees,
      submit,
      loadingFee,
      token
    };
  }
});
</script>

<style lang="scss" scoped>
.combobox__content__max-width {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style lang="scss" scoped>
.v-list.v-select-list.v-sheet {
  padding: 0 !important;

  & > .v-list-item {
    padding: 0 !important;
  }
}
</style>
