<template>
  <Page>
    <PageContent :disabled="forging || updating">
      <v-text-field
        label="Master mnemonic (12 words)"
        v-model="mnemonic"
        hint="Enter mnemonic or generate a random phrase"
        append-icon="shuffle"
        @click:append="shuffle"
      />
      <v-text-field
        label="Master hexSeed"
        v-model="form.hexSeed"
        append-icon="shuffle"
        @click:append="shuffle"
      />
      <v-row class="ma-0">
        <v-text-field label="Child derivationPath" v-model="form.path" />
        <v-btn @click="setCoin(396)" small text class="mt-3 mb-n1"
          >main.ton.dev</v-btn
        >
        <v-btn @click="setCoin(396)" small text class="mt-3 mb-n1"
          >net.ton.dev</v-btn
        >
        <v-btn icon class="mt-4 ml-2" x-small @click="add(-1)">
          <v-icon v-text="'remove'" />
        </v-btn>
        <v-btn x-small class="mt-4" icon @click="add()">
          <v-icon v-text="'add'" />
        </v-btn>
      </v-row>
      <v-text-field
        v-if="childKeys && childKeys.privateKey"
        label="Child Private Key"
        v-model="childKeys.privateKey"
        disabled
      />
    </PageContent>

    <!-- Footer -->
    <PageFooter :padding="true">
      <v-row dense>
        <v-col>
          <v-btn large block @click="shuffle" type="button">
            Random
            <v-icon right>shuffle</v-icon>
          </v-btn>
        </v-col>

        <v-col>
          <v-btn
            type="button"
            large
            block
            :class="{ 'half-transparent unclickable': error }"
            :color="error ? 'error' : 'primary'"
            @click="getWallet"
            :loading="forging || updating"
          >
            Create
            <v-icon right>account_balance_wallet</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { handleError } from "@/lib/error-handling";
import { WalletState } from "@/store/Wallet";
import { getMnemonic, toSeedHex, getKeys } from "@/lib/bip44";
import { useVuex } from "@/hooks/use-vuex";
import {
  computed,
  reactive,
  onMounted,
  defineComponent
} from "@vue/composition-api";

export default defineComponent({
  setup() {
    const {
      store: { state, dispatch, commit }
    } = useVuex();
    const Wallet = state.Common.Wallet as WalletState;

    const form = reactive({
      hexSeed: "",
      mnemonic: "",
      path: "m/44'/60'/0'"
    });

    const mnemonic = computed({
      get: () => form.mnemonic,
      set: mnemonic => {
        Object.assign(form, { ...form, mnemonic });
      }
    });

    const shuffle = () => {
      const mnemonic = getMnemonic("english", 12);
      const hexSeed = toSeedHex(mnemonic);

      const newForm = {
        ...form,
        mnemonic,
        hexSeed
      };

      Object.assign(form, newForm);
    };

    const keyToHex = (key: Buffer | Uint8Array) => {
      return key.toString("hex");
    };

    const childKeys = computed(() => {
      if (!form.hexSeed) return null;
      try {
        return getKeys(form.hexSeed, form.path);
      } catch (error) {
        console.warn(error.message);
        return null;
      }
    });

    const masterKeys = computed(() => {
      if (!form.hexSeed) return null;
      try {
        return getKeys(form.hexSeed);
      } catch (error) {
        console.warn(error.message);
        return null;
      }
    });

    const mnemonicToSeedHex = (value: string = form.mnemonic) => {
      form.hexSeed = toSeedHex(value);
    };

    const setCoin = (coin: number | string) => {
      try {
        const parts = form.path.split("/");
        let part: number | string = parts[2];
        let tick = false;
        if (part[part.length - 1] === "'") {
          part = part.substring(0, part.length - 1);
          tick = true;
        }
        part = +part;
        parts[2] = coin + (tick ? "'" : "");
        form.path = parts.join("/");
      } catch (error) {
        handleError(error, "Invalid path");
      }
    };

    const error = computed(() => !childKeys.value || !masterKeys.value);

    const getWallet = async () => {
      if (error.value) return;

      const key = await (dispatch.Common.Wallet as any).getKey();
      commit.Common.Wallet.addKey(key);
      try {
        await dispatch.Common.Wallet.forgeWallet({
          privateKey: key
        });
      } catch (error) {
        commit.Common.Wallet.setForging(false);
        handleError(error, error, 6000);
      }
    };

    const add = (value = 1) => {
      try {
        const parts = form.path.split("/");
        let last: number | string = parts[parts.length - 1];
        let tick = false;
        if (last[last.length - 1] === "'") {
          last = last.substring(0, last.length - 1);
          tick = true;
        }
        last = +last;
        parts[parts.length - 1] = last + 1 * value + (tick ? "'" : "");
        form.path = parts.join("/");
      } catch (error) {
        handleError(error, "Invalid path");
      }
    };

    onMounted(() => {
      shuffle();
    });

    return {
      forging: computed(() => Wallet.forging),
      updating: computed(() => Wallet.updating),
      error,
      form,
      mnemonic,
      shuffle,
      keyToHex,
      childKeys,
      masterKeys,
      mnemonicToSeedHex,
      setCoin,
      getWallet,
      add
    };
  }
});
</script>
