<template>
  <Page>
    <span class="clickable" @click="copy(tx.hash)" v-if="tx.hash">
      <PageSubtitle>{{ tx.hash | shortify }}</PageSubtitle>
    </span>
    <PageHeader class="text-center" :color="inn ? 'primary' : 'accent'">
      <v-avatar class="avatar mt-6 " size="45">
        <v-icon v-if="inn" v-text="'call_received'" />
        <v-icon v-else-if="toToken" v-text="'receipt'" />
        <v-icon v-else v-text="'send'" />
      </v-avatar>

      <div
        class="text-center subtitle-1 my-2 mb-n2 black--text slightly-transparent"
      >
        <span v-if="inn">received</span>
        <span v-else-if="toToken"
          >Interacted with {{ toToken.symbol }} contract</span
        >
        <span v-else>sent</span>
      </div>

      <v-list two-line subheader class="list--clean mb-n5">
        <v-list-item>
          <v-list-item-content class="total-amount">
            <v-list-item-title class="my-3 total-amount__amount">
              {{ tx && tx.value === "0" ? "" : inn ? "+" : "-"
              }}{{
                delta
                  | token(
                    "",
                    (parentToken && parentToken.decimals) ||
                      wallet.network.decimals
                  )
              }}
              <small class="mt-n1">{{
                (parentToken && parentToken.symbol) || wallet.network.symbol
              }}</small>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </PageHeader>

    <PageContent>
      <v-list v-if="tx" class="list--clean">
        <template v-if="functionName">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Function Called'" />
              <v-list-item-title class="mt-2">
                {{ functionName }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <template v-if="toToken">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle
                class="d-flex align-center overflow-initial"
              >
                <span class="d-flex"
                  ><v-img
                    :src="toToken.logo"
                    v-if="toToken.logo"
                    class="mr-2"
                    :width="15"
                  />
                  {{ toToken.name }} ({{ toToken.symbol }}) Contract</span
                >
                <v-spacer />
                <v-btn
                  small
                  text
                  class="mr-n3 half-transparent"
                  :href="tokenUrl(wallet.network, toToken.address)"
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
                class="has--copy mb-n7 mt-2"
                label="Address"
                @click:append="copy((toToken && toToken.address) || '')"
                :value="toToken.address"
              />
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle v-text="'Total Fees'" />
            <v-list-item-title class="mt-2">
              {{ fees | token(wallet.network.symbol, wallet.network.decimals) }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle v-text="'Time'" />
            <v-list-item-title class="mt-2">
              {{ ((tx.timestamp || 0) * 1000) | time("MM/DD/YYYY, hh:mm:ss") }}
              <span class="half-transparent"
                >({{ ((tx.timestamp || 0) * 1000) | fromNow }})</span
              >
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" />

        <template v-if="msg">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Type'" />
              <v-list-item-title class="mt-2">
                {{ msg.msg_type_name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <template v-if="msg">
          <v-list-item v-if="tx.statusName">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Status'" />
              <v-list-item-title class="mt-2">
                {{ tx.statusName }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <v-list-item v-if="tx.hash">
          <v-list-item-content>
            <v-list-item-subtitle v-text="'Transaction ID'" />
            <v-text-field
              readonly
              append-icon="file_copy"
              solo
              class="has--copy mb-n7 mt-2"
              label="Address"
              @click:append="copy((tx && tx.hash) || '')"
              :value="tx.hash"
            />
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" v-if="tx.hash" />

        <!-- <v-list-item v-if="wallet">
          <v-list-item-content class="overflow-initial">
            <v-list-item-subtitle class="d-flex align-center overflow-initial">
              <span v-text="'My Address'"></span>
            </v-list-item-subtitle>
            <v-text-field
              readonly
              append-icon="file_copy"
              solo
              class="has--copy mb-n7 mt-2"
              label="My Address"
              @click:append="copy(wallet.address)"
              :value="wallet.address"
            />
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" v-if="wallet" /> -->

        <template v-if="tx && tx.from && tx.from !== wallet.address">
          <v-list-item>
            <v-list-item-content class="overflow-initial">
              <v-list-item-subtitle
                class="d-flex align-center overflow-initial"
              >
                <span v-text="'From'"></span>
                <v-spacer />
                <v-btn
                  small
                  text
                  class="mr-n3 half-transparent"
                  @click="
                    $router.push({
                      query: {
                        modal: 'addContact',
                        address: tx.to,
                        networkName: wallet.network.name
                      }
                    })
                  "
                >
                  Add contact
                  <v-icon
                    x-small
                    class="ml-1"
                    v-text="'perm_contact_calendar'"
                  />
                </v-btn>
                <v-btn
                  small
                  v-if="tx.from !== wallet.address"
                  text
                  class="mr-n3 half-transparent"
                  @click="sendto(tx.from)"
                >
                  Send
                  <v-icon x-small class="ml-1" v-text="'send'" />
                </v-btn>
              </v-list-item-subtitle>
              <v-text-field
                readonly
                append-icon="file_copy"
                solo
                class="has--copy mb-n7 mt-2"
                label="From"
                @click:append="copy(tx.from || '')"
                :value="tx.from"
              />
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <template v-if="tx && tx.to && tx.to !== wallet.address">
          <v-list-item>
            <v-list-item-content class="overflow-initial">
              <v-list-item-subtitle
                class="d-flex align-center overflow-initial"
              >
                <span v-text="'To'"></span>
                <v-spacer />
                <v-btn
                  small
                  text
                  class="mr-n3 half-transparent"
                  @click="
                    $router.push({
                      query: {
                        modal: 'addContact',
                        address: tx.to,
                        networkName: wallet.network.name
                      }
                    })
                  "
                >
                  Add contact
                  <v-icon
                    x-small
                    class="ml-1"
                    v-text="'perm_contact_calendar'"
                  />
                </v-btn>
                <v-btn
                  small
                  text
                  class="mr-n3 half-transparent"
                  @click="sendto(tx.to)"
                >
                  Send
                  <v-icon x-small class="ml-1" v-text="'send'" />
                </v-btn>
              </v-list-item-subtitle>
              <v-text-field
                readonly
                append-icon="file_copy"
                solo
                class="has--copy mb-n7 mt-2"
                label="To"
                @click:append="copy(tx.to)"
                :value="tx.to"
              />
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <template v-if="tx && tx.confirmations">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Confirmations'" />
              <v-list-item-title class="mt-2">
                {{ tx.confirmations }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <template v-if="tx && tx.nonce">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Nonce'" />
              <v-list-item-title class="mt-2">
                {{ tx.nonce }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <template v-if="msg && msg.dst">
          <v-list-item>
            <v-list-item-content class="overflow-initial">
              <v-list-item-subtitle
                class="d-flex align-center overflow-initial"
              >
                <span v-text="'Destination'"></span>
                <v-spacer />
                <v-btn
                  small
                  text
                  v-if="msg.dst !== wallet.address"
                  class="mr-n3 half-transparent"
                  @click="sendTo(msg && msg.dst)"
                >
                  Send
                  <v-icon x-small class="ml-1" v-text="'send'" />
                </v-btn>
              </v-list-item-subtitle>
              <v-text-field
                readonly
                append-icon="file_copy"
                solo
                class="has--copy mb-n7 mt-2"
                label="Destination"
                @click:append="copy((msg && msg.dst) || '')"
                :value="msg.dst"
              />
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle v-text="'Block ID'" />
            <v-text-field
              readonly
              append-icon="file_copy"
              solo
              class="has--copy mb-n7 mt-2"
              label="Block ID"
              @click:append="copy((tx && tx.blockId) || '')"
              :value="tx.blockId || 'awaiting confirmations'"
            />
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle v-text="'Protocol'" />
            <v-list-item-title class="mt-2">
              {{ wallet.network.protocol }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle v-text="'Network'" />
            <v-list-item-title class="mt-2">
              {{ wallet.network.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="my-1" />

        <template v-if="(msg && msg.body) || tx.data">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle
                class="clickable"
                @click="panels.message = !panels.message"
              >
                {{ tx.data ? "Data" : "Body" }}
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action class="text-center mb-auto mt-2">
              <v-btn
                icon
                @click="togglePanel('message')"
                class="slightly-transparent"
              >
                <v-icon v-text="'keyboard_arrow_down'" />
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-expand-transition>
            <v-card class="mt-0 mb-4" v-show="panels.message">
              <v-card-text>
                <pre>{{ (msg && msg.body) || tx.data }}</pre>
              </v-card-text>
            </v-card>
          </v-expand-transition>
          <v-divider class="my-1" />
        </template>

        <template v-if="parsedData">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle
                class="clickable"
                @click="panels.parsedData = !panels.parsedData"
              >
                Parsed Data
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action class="text-center mb-auto mt-2">
              <v-btn
                icon
                @click="togglePanel('parsedData')"
                class="slightly-transparent"
              >
                <v-icon v-text="'keyboard_arrow_down'" />
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-expand-transition>
            <v-card class="mt-0 mb-4" v-show="panels.parsedData">
              <v-card-text>
                <pre>{{ parsedData }}</pre>
              </v-card-text>
            </v-card>
          </v-expand-transition>
          <v-divider class="my-1" />
        </template>
      </v-list>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn
        color="primary"
        large
        block
        name="wallet-receive"
        :href="url"
        target="_blank"
      >
        Explore
        <v-icon v-text="'explore'" right />
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { getMsg } from "@/common/sdk";
import { Ethers } from "@/common/sdk/web3";
import BigNumber from "bignumber.js";
import {
  reactive,
  computed,
  onBeforeUnmount,
  defineComponent,
  ref,
  watch
} from "@vue/composition-api";
import { useVuex } from "@/common/hooks/use-vuex";
import { useCopy } from "@/common/hooks/use-copy";
import { useRouter } from "@/common/hooks/use-router";
import { useExplorer } from "@/common/hooks/use-explorer";
import { WalletState } from "@/common/store/Wallet/Wallet";
import { PendingTx } from "@/common/models/tx";
import { Wallet } from "@/common/models/wallet";
import { Network } from "@/common/models/network";
import { useEthereum } from "@/common/hooks/use-ethereum";
import { useERC20 } from "@/common/hooks/use-erc20";
import { usePrices } from "@/common/hooks/use-prices";
import { getProvider } from "@/common/sdk/web3/client";

export default defineComponent({
  setup() {
    const panels = reactive({
      message: false,
      transaction: false,
      block: false,
      parsedData: false
    });
    const copy = (str: string) => useCopy(str);
    const router = useRouter();
    const {
      store: { state, getters, commit }
    } = useVuex();
    const { parseERC20Tx, getERC20History } = useERC20();
    const { tokenPrices } = usePrices();
    const Wallet = state.Wallet as WalletState;
    const wallet = computed(() => getters.Wallet.wallet as Wallet);
    const tx = computed(() => Wallet.transaction);
    const msg = computed(() => {
      if (!tx.value) return null;
      return wallet.value.messages.find(m => m.id === tx.value?.inMsg);
    });

    const togglePanel = (key: string) => {
      panels[key] = !panels[key];
    };

    const url = computed(() => {
      return useExplorer().txUrl(wallet.value.network, tx.value?.hash || "");
    });

    const sendto = (addr: string) => {
      commit.Wallet.setPendingTx({
        amount: null,
        from: wallet.value.address,
        to: addr
      } as PendingTx);
      router.push("/wallet/send");
    };

    const fees = computed(() => {
      return new BigNumber(tx.value?.totalFees || "0").toNumber();
    });

    const delta = computed(() => {
      return new BigNumber(tx.value?.value || "0").toNumber();
    });

    const netDelta = computed(() => {
      return new BigNumber(tx.value?.totalFees || "0")
        .minus(fees.value)
        .toNumber();
    });

    const inn = computed(() => wallet.value.address === tx.value?.to);
    const out = computed(() => wallet.value.address !== tx.value?.to);

    // onBeforeUnmount(() => {
    //   commit.Wallet.setTransaction(null);
    // });

    watch(
      () => tx.value?.data,
      () => {
        if (!tx.value || !wallet.value) return router.push("/wallet");
      },
      { immediate: true }
    );

    const parsedData = computed(() => {
      if (!tx.value || !wallet.value) return null;
      return parseERC20Tx(tx.value, wallet.value);
    });

    const functionName = computed(
      () => parsedData.value && parsedData.value?.parsed?.functionFragment?.name
    );

    const parentToken = computed(() => {
      const address = tx && tx.value?.parentAddress;
      const token = ((tokenPrices && tokenPrices.value) || []).find(
        t => t.address === address
      );
      return token;
    });

    const toToken = computed(() => {
      const address = tx.value?.to || "";

      const token = ((tokenPrices && tokenPrices.value) || []).find(
        t => t.address === address
      );

      return token;
    });

    return {
      panels,
      msg,
      tx,
      wallet,
      copy,
      togglePanel,
      url,
      sendto,
      fees,
      delta,
      netDelta,
      inn,
      out,
      toToken,
      parsedData,
      parentToken,
      functionName,
      tokenUrl: useExplorer().tokenUrl
    };
  }
});
</script>

<style scoped lang="scss">
pre {
  overflow: auto;
}

.avatar {
  border: 1px solid rgba(black, 0.1);
}

.is--flipped {
  transform: scaleX(-1);
}
</style>
