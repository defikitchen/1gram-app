<template>
  <Page v-if="wallet">
    <PageContent>
      <div class="text-center pb-2">
        <v-avatar :size="90" @click="$router.push('/wallet')">
          <identicon :size="90" :seed="wallet.address" />
        </v-avatar>
        <v-list-item-title class="mt-3">{{ wallet.name }}</v-list-item-title>
        <v-btn text small color="primary" @click="changeName"
          >Change Name</v-btn
        >
      </div>

      <v-list class="list--clean">
        <v-list-item v-if="wallet.address">
          <v-list-item-content>
            <v-list-item-subtitle class="d-flex align-center">
              Address
              <v-spacer />
              <v-btn
                small
                text
                class="mr-n3 half-transparent"
                :href="addressUrl(wallet.network, wallet.address)"
                target="_blank"
              >
                Explore
                <v-icon x-small class="ml-1" v-text="'explore'" />
              </v-btn>
            </v-list-item-subtitle>

            <v-text-field
              readonly
              append-icon="file_copy"
              solo
              class="has--copy mt-3 mb-n7"
              label="Address"
              @click:append="copy(wallet.address)"
              :value="wallet.address"
            />
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>Network</v-list-item-subtitle>
            <v-list-item-title class="mt-1">{{
              wallet.network.name
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="my-1" />
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle class="d-flex align-center">
              <span @click="menu = true" class="clickable pr-3">Color</span>

              <v-menu
                v-model="menu"
                bottom
                nudge-left="45"
                nudge-top="10"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ on }">
                  <span
                    :style="{ 'background-color': color }"
                    v-on="on"
                    class="selected-color"
                  />
                </template>
                <v-card>
                  <v-card-text class="pa-0">
                    <v-color-picker
                      :swatches="swatches"
                      show-swatches
                      v-model="color"
                      flat
                    />
                  </v-card-text>
                </v-card>
              </v-menu>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" />
        <v-subheader class="px-0 mb-n1 mt-2">
          Backup
          <v-spacer />
          <v-btn
            text
            small
            v-if="wallet.backedUp"
            color="success"
            @click="backup"
          >
            Backed up
            <v-icon right>check</v-icon>
          </v-btn>
        </v-subheader>
        <div
          class="clickable mt-2 mb-3"
          v-show="!wallet.backedUp && !wallet.imported"
          @click="backup"
        >
          <backup-warning />
        </div>

        <template v-if="expert && wallet.path">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle class="mb-1"
                >Derivation Path</v-list-item-subtitle
              >
              <v-list-item-title>
                {{ wallet.path }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>

        <v-list-item v-if="wallet.mnemonic">
          <v-list-item-content>
            <v-list-item-title class="d-flex align-center">
              Secret phrase
              <v-spacer />
              <v-btn
                @click="reveal('phrase')"
                :input-value="panels.phrase"
                class="half-transparent"
                text
                small
              >
                Reveal
                <v-icon v-text="!panels.phrase ? 'lock' : 'lock_open'" right />
              </v-btn>
            </v-list-item-title>
            <v-expand-transition>
              <div v-show="panels.phrase">
                <v-text-field
                  readonly
                  append-icon="file_copy"
                  solo
                  class="has--copy mt-3 mb-n7"
                  label="Address"
                  @click:append="copy(mnemonic)"
                  :value="mnemonic"
                />
              </div>
            </v-expand-transition>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="d-flex align-center">
              Private key
              <v-spacer />
              <v-btn
                @click="reveal('pk')"
                :input-value="panels.pk"
                text
                class="half-transparent"
                small
              >
                Reveal
                <v-icon v-text="!panels.pk ? 'lock' : 'lock_open'" right />
              </v-btn>
            </v-list-item-title>
            <v-expand-transition>
              <div v-show="panels.pk">
                <v-card light class="qr-well" @click="copy(privateKey)">
                  <img class="img-full" :src="qr" :alt="qr" />
                  <v-subheader
                    class="text-center align-center justify-center my-n3"
                    >Private Key</v-subheader
                  >
                  <v-text-field
                    readonly
                    append-icon="file_copy"
                    prepend-inner-icon="cloud_download"
                    solo
                    flat
                    hide-details
                    class="has--copy"
                    label="Privat Key"
                    @click:append="copy(privateKey)"
                    @click:prepend-inner="downloadKey()"
                    :value="privateKey"
                  />
                </v-card>
              </div>
            </v-expand-transition>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="d-flex align-center">
              Public key
              <v-spacer />
              <v-btn
                @click="reveal('pubk')"
                :input-value="panels.pubk"
                text
                class="half-transparent"
                small
              >
                Reveal
                <v-icon v-text="!panels.pubk ? 'lock' : 'lock_open'" right />
              </v-btn>
            </v-list-item-title>
            <v-expand-transition>
              <div v-show="panels.pubk">
                <v-card light class="qr-well" @click="copy(publicKey)">
                  <img class="img-full" :src="qrPub" :alt="publicKey" />
                  <v-subheader
                    class="text-center align-center justify-center my-n3"
                    >Public Key</v-subheader
                  >
                  <v-text-field
                    readonly
                    append-icon="file_copy"
                    prepend-inner-icon="cloud_download"
                    solo
                    flat
                    hide-details
                    class="has--copy"
                    label="Privat Key"
                    @click:append="copy(publicKey)"
                    @click:prepend-inner="downloadKey()"
                    :value="publicKey"
                  />
                </v-card>
              </div>
            </v-expand-transition>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn color="error" class="mt-2" large outlined block @click="remove">
        Remove Wallet
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import "reflect-metadata";
import { Component, Vue, Watch } from "vue-property-decorator";
import store, { notify } from "@/common/store";
import { getColor } from "../../../lib/identicon";
import { decrypt } from "@/common/lib/crypto";
import { Wallet } from "@/common/models/wallet";
import { useExplorer } from "@/common/hooks/use-explorer";
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch
} from "@vue/composition-api";
import { useVuex } from "@/common/hooks/use-vuex";
import { useRouter } from "@/common/hooks/use-router";
import { KeyPair } from "@/common/sdk";
import { useCopy } from "@/common/hooks/use-copy";

export default defineComponent({
  setup(_, { root }) {
    const { store } = useVuex();
    const wallet = computed(() => store.getters.Wallet.wallet);
    const router = useRouter();
    const expert = computed(
      () => store.state.Common.Settings.mode === "expert"
    );
    const { addressUrl } = useExplorer();
    const qr = ref("");
    const qrPub = ref("");
    const hex = ref("");
    const menu = ref(false);
    const defaultColor = ref(getColor(wallet?.value?.address || ""));
    const copy = useCopy;
    const swatches = computed(() => [
      [defaultColor.value],
      [root.$vuetify.theme.currentTheme.primary],
      [root.$vuetify.theme.currentTheme.error],
      [root.$vuetify.theme.currentTheme.accent],
      [root.$vuetify.theme.currentTheme.success]
    ]);

    const color = computed({
      get: () =>
        wallet?.value?.color ||
        (root.$vuetify.theme.currentTheme.primary as string),
      set: (value: string) => {
        store.commit.Wallet.patchWallet({
          address: wallet?.value?.address || "",
          update: { color: value }
        });
        root.$route.meta.toolbarType = value;
      }
    });

    const panels = ref({
      phrase: false,
      pk: false,
      pubk: false
    });

    const reveal = async (key: string) => {
      if (panels.value[key]) {
        panels.value[key] = false;
        return;
      }
      try {
        const pin = await store.dispatch.Common.Login.promptPin({
          persistent: false
        });
        panels.value[key] = true;
      } catch {
        // closed dialog
      }
    };

    const backup = async () => {
      const result = await store.dispatch.Common.Login.promptPin({
        persistent: false
      });
      if (result) router.push("/wallet/backup?redirect=" + root.$route.path);
    };

    const privateKey = computed(() => {
      const pin = store.state.Common.Login.pin;
      if (!pin)
        return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
      const pair: KeyPair = JSON.parse(decrypt(wallet?.value?.keyPair, pin));
      return pair.secret;
    });

    const publicKey = computed(() => {
      const pin = store.state.Common.Login.pin;
      if (!pin)
        return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
      const pair: KeyPair = JSON.parse(decrypt(wallet?.value?.keyPair, pin));
      return pair.public;
    });

    const keytoQR = async () => {
      if (!wallet.value) {
        qr.value = "";
        qrPub.value = "";
      } else {
        qr.value = await store.original.dispatch(
          "Common/getQR",
          privateKey.value
        );
        qrPub.value = await store.original.dispatch(
          "Common/getQR",
          publicKey.value
        );
      }
    };

    onMounted(() => {
      const authorizedPanel = root.$route.query.authorizedPanel as string;
      if (authorizedPanel) {
        panels.value[authorizedPanel] = true;
      }
    });

    const downloadKey = (
      key = privateKey.value,
      name = `${wallet?.value?.name}.pk`
    ) => {
      const payload = { value: key, name, encoding: "hex" };
      store.original.dispatch("Common/downloadString", payload);
    };

    const downloadQR = (
      _qr = qr.value,
      name = `${wallet?.value?.name}.png`
    ) => {
      store.original.dispatch("Common/downloadURL", { url: _qr, name });
    };

    const mnemonic = computed(() => {
      const pin = store.state.Common.Login.pin;
      if (!pin)
        return "xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx";
      const decrypted = decrypt(wallet?.value?.mnemonic, pin);
      return decrypted;
    });

    const changeName = async () => {
      const name = await root.$dialog.prompt({
        title: "Enter a new name"
      });
      const exists = store.state.Wallet.wallets
        .filter(w => w.address !== wallet.value?.address)
        .map(w => w.name)
        .find(n => n === name);
      if (!name) {
        return;
      } else if (exists) {
        notify({
          text: "A wallet with this name already exists",
          duration: 2000,
          type: "error"
        });
        changeName();
      } else {
        store.commit.Wallet.patchWallet({
          address: wallet.value?.address || "",
          update: { name }
        });
      }
    };

    watch(() => wallet.value, keytoQR, {
      immediate: true,
      deep: true
    });

    const remove = () => {
      if (!wallet.value) return;
      store.dispatch.Wallet.removeWallet(wallet.value);
    };

    return {
      qr,
      qrPub,
      remove,
      hex,
      menu,
      defaultColor,
      expert,
      addressUrl,
      swatches,
      color,
      panels,
      reveal,
      backup,
      privateKey,
      publicKey,
      copy,
      downloadKey,
      downloadQR,
      mnemonic,
      wallet,
      changeName
    };
  }
});
</script>

<style lang="scss" scoped>
.animate-blur {
  transition: background 0.3s ease, filter 0.3s ease;
}
.unrevealed {
  filter: blur(10px);
  opacity: 0.5;
  pointer-events: none;
}
</style>

<style>
.selected-color {
  cursor: pointer;
  height: 27px;
  width: 27px;
  border-radius: 50%;
  display: inline-block;
}
</style>
