<template>
  <div>
    <v-list-item @click="dialog = true">
      <v-list-item-avatar size="25">
        <identicon v-if="'logo' in token" :src="token.logo" />
        <identicon e-else :seed="token.address" />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title name="wallet-item-name" class="wallet-item__name">
          {{ token.name }} ({{ token.symbol }})
        </v-list-item-title>
        <v-list-item-subtitle>ERC20 Token </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-list-item-action-text class="wallet-item__balance font-weight-bold">
          {{ formatToken(asBaseCurrency(balance), baseCurrency.code, 0, 2) }}
        </v-list-item-action-text>
      </v-list-item-action>
    </v-list-item>

    <BaseDialog
      v-model="dialog"
      :title="`${token.name} (${token.symbol})`"
      :name="`modal-${token.symbol}`"
    >
      <v-list>
        <v-list-item>
          <v-list-item-avatar :size="45">
            <identicon v-if="'logo' in token" :src="token.logo" />
            <identicon e-else :seed="token.address" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-subtitle class="mb-2">Address</v-list-item-subtitle>
            <v-list-item-title class="selectable">{{
              token.address
            }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              icon
              @click="copy(token.address)"
              style="position: relative; top: 0.5em;"
            >
              <v-icon small class="half-transparent">file_copy</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-divider />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle class="mb-2"
              >Your Balance</v-list-item-subtitle
            >
            <v-list-item-title>
              {{
                formatToken(
                  "balance" in token ? token.balance : 0,
                  token.symbol,
                  token.decimals,
                  2
                )
              }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle class="mb-2"
              >Balance in {{ baseCurrency.code }}</v-list-item-subtitle
            >
            <v-list-item-title>
              {{
                formatToken(asBaseCurrency(balance), baseCurrency.code, 0, 2)
              }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle class="mb-2"
              >Latest Exchange Rate</v-list-item-subtitle
            >

            <v-list-item-title
              >1 {{ token.symbol }} ≈
              {{
                formatToken(asBaseCurrency(price), baseCurrency.code, 0, 2)
              }}</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
        <v-divider />

        <v-list-item>
          <v-row dense>
            <v-col>
              <v-btn
                block
                color="accent"
                :href="url"
                target="_blank"
                class="mt-2"
              >
                explore
                <v-icon v-text="'explore'" right />
              </v-btn>
            </v-col>
            <v-col>
              <v-btn
                block
                color="accent"
                :href="
                  `https://app.uniswap.org/#/swap?outputCurrency=${token.address}`
                "
                target="_blank"
                class="mt-2"
              >
                swap
                <v-icon v-text="'swap_horiz'" right />
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item>

        <v-list-item
          :key="tx.hash"
          v-for="(tx, i) of txs"
          @click="openTransaction(tx)"
        >
          <transaction-item
            :wallet="wallet"
            :transaction="tx"
            :divider="i !== 0"
          />
        </v-list-item>
      </v-list>
    </BaseDialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  toRefs,
  ref
} from "@vue/composition-api";
import { Wallet } from "@/models/wallet";
import { Tx } from "@/models/tx";
import { ERC20AccountInfo, ERC20TokenInfo } from "@/models/erc20";
import { useUsdTokenPrice, usePrices } from "@/hooks/use-prices";
import { useExplorer } from "@/hooks/use-explorer";
import { useCopy } from "@/hooks/use-copy";
import TransactionItem from "./TransactionItem.vue";
import { useERC20 } from "@/hooks/use-erc20";
import { useVuex } from "@/hooks/use-vuex";
import { useRouter } from "@/hooks/use-router";
import { useFilters } from "@/lib/format";

export default defineComponent({
  components: { TransactionItem },
  props: {
    token: {
      required: true,
      type: Object as PropType<ERC20TokenInfo | ERC20AccountInfo>
    },
    wallet: {
      type: Object as PropType<Wallet>,
      required: true
    }
  },
  setup(props, { emit }) {
    const { token, wallet } = toRefs(props);
    const { tokenPrices, asBaseCurrency, baseCurrency } = usePrices();
    const { ERC20TokenTransfers } = useERC20();
    const router = useRouter();
    const { tokenUrl } = useExplorer();
    const dialog = ref(false);
    const copy = useCopy;
    const { store } = useVuex();

    const url = computed(() =>
      wallet?.value?.network
        ? tokenUrl(wallet?.value?.network, token.value.address)
        : ""
    );

    const openTransaction = (tx: Tx) => {
      store.commit.Wallet.setTransaction(tx);
      router.push("/wallet/transaction");
    };

    const balance = computed(() => {
      const tokenPrice = +useUsdTokenPrice(
        token.value.address,
        "balance" in token.value ? token.value.balance : 0,
        token.value.decimals,
        tokenPrices
      );
      return tokenPrice;
    });

    const price = computed(() => {
      const tokenPrice = +useUsdTokenPrice(
        token.value.address,
        1 * 10 ** token.value.decimals,
        token.value.decimals,
        tokenPrices
      );
      return tokenPrice;
    });

    const txs = computed(() => {
      if (!wallet?.value) return [];
      return ERC20TokenTransfers(token.value.address, wallet?.value);
    });

    return {
      formatToken: useFilters().token,
      price,
      balance,
      asBaseCurrency,
      baseCurrency,
      dialog,
      url,
      copy,
      txs,
      openTransaction
    };
  }
});
</script>
