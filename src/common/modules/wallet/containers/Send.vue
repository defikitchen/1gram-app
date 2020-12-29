<template>
  <Page>
    <PageSubtitle>
      {{
        wallet.balance | token(wallet.network.symbol, wallet.network.decimals)
      }}
      available
    </PageSubtitle>
    <portal to="page-title"
      ><span class="clickable-bg" @click="$router.push('?modal=walletMenu')"
        >Send from {{ wallet.address | shortify(4) }}
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
          wallets.length > 1
            ? selectWallet
            : $router.push({ path: '/wallet/create' })
        "
        :error="fieldError('amount').length > 0"
        :error-messages="[...fieldError('amount')]"
      />
    </PageHeader>
    <PageContent :width="532">
      <div>
        <input
          type="file"
          accept="image/png"
          hidden
          ref="qr"
          @change="readQr"
        />

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
                          item.addr | shortify(15)
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
              <v-list-item-action-text class="text-right">{{
                fee | token(wallet.network.symbol, 0)
              }}</v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>

          <v-divider class="my-0 mx-4" />

          <v-list-item class="px-4">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Total (estimate)'" />
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text class="text-right">{{
                total | token(wallet.network.symbol, 0)
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
          {{ (form.amount || 0) | token(wallet.network.symbol, 0) }}
        </span>
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { mapState } from "vuex";
import SwipeBtn from "@/common/components/SwipeBtn.vue";
import { Wallet } from "@/common/models/wallet";
import { PendingTx } from "@/common/models/tx";

import { HTMLInputEvent, readQr, cordovaReadQr } from "@/common/lib/open-file";
import store, { RootState, notify } from "@/common/store";
import getPlatform, { Platform } from "@/common/lib/get-platform";
import { handleError } from "@/common/lib/error-handling";
import { calcFees, getClient, KeyPair } from "@/common/sdk";
import { decrypt } from "@/common/lib/crypto";
import { token } from "@/common/lib/format";
import BigNumber from "bignumber.js";
import { useEthereum } from "@/common/hooks/use-ethereum";

@Component({
  components: {
    SwipeBtn
  },
  computed: {
    ...mapState<RootState>({
      loading: state => state.Common.Loading.loading,
      pendingTransaction: state => state.Wallet.pendingTransaction,
      wallets: state => state.Wallet.wallets
    })
  }
})
export default class Send extends Vue {
  loading!: boolean;
  isCordova = getPlatform() === Platform.Cordova;
  feeError = "";
  readonly defaultForm = {
    amount: null as null | number,
    comment: "",
    addr: "",
    touched: false
  };
  form = { ...this.defaultForm };
  wallets!: Wallet[];
  pendingTransaction!: PendingTx;
  $refs!: {
    qr: HTMLInputElement;
  };
  fee = 0;

  get comboboxItems() {
    const fromWallet = store.state.Wallet.wallets
      .map(w => ({
        type: "wallet",
        wallet: w,
        addr: w.address,
        network: w.network
      }))
      .filter(item => this.wallet.address !== item.wallet.address)
      .filter(item => this.wallet.network.name === item.wallet.network.name);

    const fromContacts = store.state.Contacts.contacts.map(c => ({
      type: "contact",
      name: c.name,
      addr: c.address,
      network: c.network
    }));

    console.log({ fromContacts });
    return [...fromWallet, ...fromContacts]
      .filter(item => this.wallet.address !== item.addr)
      .filter(item => this.wallet.network.name === item.network.name);
  }

  get wallet() {
    return store.getters.Wallet.wallet as Wallet;
  }

  get addresses() {
    return store.getters.Wallet.usedAddresses;
  }

  beforeMount() {
    if (!this.wallet) {
      this.$router.push({
        path: "/wallet/create"
      });
    } else if (this.pendingTransaction) {
      this.form.amount = this.pendingTransaction.amount
        ? new BigNumber(this.pendingTransaction.amount)
            .div(10 ** this.wallet.network.decimals)
            .toNumber()
        : null;
      this.form.comment = this.pendingTransaction.comment || "";
      this.form.addr = this.pendingTransaction.to;
    }
  }

  resetForm() {
    this.form = { ...this.defaultForm };
  }

  get amountHint() {
    return `${token(
      this.wallet.balance || 0,
      this.wallet.network.symbol,
      this.wallet.network.decimals
    )} available`;
  }

  get fieldError() {
    return (field: string) =>
      this.form.touched && this.hasError && this.error[field]
        ? [this.error[field]]
        : [];
  }

  selectWallet() {
    this.$router.push({
      path: "/portfolio",
      query: {
        redirect: this.$route.path
      }
    });
  }

  get total() {
    return +(this.form.amount || 0) + this.fee;
  }

  scanQr() {
    if (this.isCordova) this.cordovaReadQr();
    else this.$refs.qr.click();
  }

  async cordovaReadQr() {
    try {
      const qr = await cordovaReadQr();
      if (qr && qr.length > 0) {
        this.form.addr = qr;
      }
    } catch (error) {
      handleError(error, error);
    }
  }

  async readQr(event: HTMLInputEvent) {
    const file = event.target.files && event.target.files[0];
    const { dispatch } = this.$store;
    const notify = (
      text = "Not a valid QR code. Please try again",
      error?: any
    ) =>
      dispatch("Common/Notifications/notify", {
        text,
        duration: 2500,
        type: "info",
        payload: { error }
      });

    if (file) {
      try {
        const qr = await readQr(file);
        if (qr && qr.data) {
          this.form.addr = qr.data;
        }
      } catch (error) {
        handleError(error, error);
      }
    }
  }

  get maxAmount() {
    return new BigNumber(this.wallet.balance || 0)
      .div(10 ** this.wallet.network.decimals)
      .toNumber();
  }

  get error() {
    let error: { [key: string]: string } = {};

    if ((this.form.amount || 0) <= 0) {
      error.amount = "Amount is required";
    }
    if (this.wallet && (this.form.amount || 0) > this.maxAmount) {
      error.amount = "Amount exceeds balance " + this.amountHint;
    }
    if (!this.wallet) {
      error.amount = "Please select a Wallet";
    }
    if (!this.form.addr) {
      error.addr = "Please select a recipient address";
    }
    if (this.form.addr === this.wallet.address) {
      error.addr = "You can't send to yourself";
    }

    if (this.feeError) {
      error.amount =
        this.feeError + ". Your balance is not enough to cover the fees";
    }

    return error;
  }

  get hasError() {
    return Object.keys(this.error).length > 0;
  }

  touch() {
    this.form.touched = true;
  }

  mounted() {
    this.$store.commit("Common/stopLoading");
    setTimeout(() => {
      (this.$refs as any).amount.focus();
    }, 200);
  }

  @Watch("form", { immediate: true, deep: true })
  @Watch("wallet", { immediate: true, deep: true })
  async getFees() {
    if (!this.form.amount || !this.form.addr) {
      this.feeError = "";
      return (this.fee = 0);
    }
    const { state, dispatch } = this.$store;
    try {
      if (this.wallet.network.protocol === "ton") {
        const client = await getClient(
          this.wallet.network.name as
            | "net.ton.dev"
            | "main.ton.dev"
            | "fld.ton.dev"
        );

        let pin = state.Common.Login.pin;
        if (!pin)
          pin = await dispatch("Common/Login/promptPin", {
            persistent: false
          });
        const keypair: KeyPair = JSON.parse(decrypt(this.wallet.keyPair, pin));

        this.feeError = "";
        const amount = new BigNumber(this.form.amount || 0)
          .times(10 ** this.wallet.network.decimals)
          .toNumber();
        console.log(amount);

        const fees = await calcFees(
          client,
          this.wallet.address,
          this.form.addr,
          amount,
          keypair
        ).catch(console.log);
        this.fee = new BigNumber((fees && fees?.totalFees) || 0)
          .div(10 ** this.wallet.network.decimals)
          .toNumber();
      }

      if (this.wallet.network.protocol === "ethereum") {
        const { estimateGas } = useEthereum();
        const fee = await estimateGas(
          this.wallet,
          this.form.addr,
          this.form.amount
        );
        this.fee = new BigNumber(fee)
          .div(10 ** this.wallet.network.decimals)
          .toNumber();
      }
    } catch (error) {
      this.feeError = error.message || "Unknown error";
      console.warn("[feeError]", error);
      this.fee = 0;
    }
  }

  submit() {
    const { commit } = this.$store;
    const { form, error } = this;
    this.touch();

    if (this.hasError) {
      const firstError = Object.values(this.error).find(item => !!item);
      notify({
        text: firstError as string,
        duration: 2500,
        type: "error",
        payload: { form, error }
      });
    } else {
      const transaction: PendingTx = {
        amount: new BigNumber(this.form.amount || 0)
          .times(10 ** this.wallet.network.decimals)
          .toNumber(),
        comment: this.form.comment,
        from: this.wallet.address,
        to: this.form.addr,
        estimatedFees: new BigNumber(this.fee)
          .times(10 ** this.wallet.network.decimals)
          .toNumber()
      };
      commit("Wallet/setPendingTx", transaction);
      this.resetForm();
      this.$router.push("/wallet/receipt");
    }
  }
}
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
