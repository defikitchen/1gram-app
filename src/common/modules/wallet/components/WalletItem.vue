<template>
  <div class="wallet-item" :class="{ 'type--inset': inset }">
    <div class="item" v-if="divider">
      <v-divider :class="{ 'mx-4': inset }" />
    </div>

    <v-list-item
      class="px-4 py-2 item"
      name="wallet-item"
      selectable
      :input-value="selected"
      ripple
      @click="
        select();
        open();
      "
    >
      <v-list-item-avatar :class="{ avatar: !wallet }" size="45">
        <identicon :seed="wallet.address" />
      </v-list-item-avatar>

      <v-list-item-content class="overflow-initial">
        <v-list-item-title
          name="wallet-item-name"
          class="wallet-item__name font-weight-bold"
          >{{ wallet.name }}</v-list-item-title
        >
        <v-list-item-subtitle class="wallet-item__addr overflow-initial">
          <span
            class="clickable-bg clickable-bg--darker"
            @click.stop="copy(wallet.address)"
          >
            {{ wallet.address | shortify(10) }}
            <v-icon x-small class="half-transparent">file_copy</v-icon>
          </span>
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-list-item-action-text class="wallet-item__balance overflow-initial">
          <span
            class="clickable-bg clickable-bg--darker font-weight-bold"
            v-if="wallet.network.etherscanId"
            @click.stop="$router.push('?modal=currency')"
          >
            {{ asBaseCurrency(price) | token(baseCurrency.code, 0, 2) }}
          </span>
          <span v-else class="half-transparent text-m">
            {{ wallet.network.name }}
          </span>
        </v-list-item-action-text>
      </v-list-item-action>
    </v-list-item>

    <token-item
      v-for="token of tokens"
      :key="token.symbol"
      :token="token"
      :wallet="wallet"
    />
  </div>
</template>

<script lang="ts">
import { Wallet } from "@/common/models/wallet";
import {
  defineComponent,
  PropType,
  toRefs,
  computed,
  onMounted,
  toRef
} from "@vue/composition-api";
import { token } from "@/common/lib/format";
import {
  usePrices,
  useUsdPrice,
  useUsdTokenPrice
} from "@/common/hooks/use-prices";
import { useEthereum } from "@/common/hooks/use-ethereum";
import BigNumber from "bignumber.js";
import { ERC20AccountInfo, ERC20TokenInfo } from "@/common/models/erc20";
import { useCopy } from "@/common/hooks/use-copy";

export default defineComponent({
  props: {
    wallet: {
      required: true,
      type: Object as PropType<Wallet>
    },
    divider: Boolean,
    selected: Boolean,
    inset: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const { wallet } = toRefs(props);
    const open = () => emit("open", wallet.value);
    const remove = () => emit("remove", wallet.value);
    const select = () => emit("select", wallet.value);
    const { prices, baseCurrency, asBaseCurrency } = usePrices();
    const price = useUsdPrice(
      wallet.value.network.etherscanId || -1,
      wallet.value.balance,
      wallet.value.network.decimals,
      prices
    );
    const copy = useCopy;

    const balance = computed(() => {
      const { balance, network } = wallet.value;
      return token(balance, network.symbol, network.decimals);
    });

    const tokens = computed(() => {
      const { tokenPrices, tokenByAddress } = usePrices();
      const list = [...(wallet.value?.erc20Tokens || [])];
      const tokens = list
        .map(({ address }) => tokenByAddress(address))
        .filter(t => !!t && t.name && (+(t?.usdtRate || "0") || t.logo))
        .map((t, i) => ({
          ...t,
          balance: list.find(_t => _t.address === t?.address)?.balance || "0"
        }))
        .sort((a, b) =>
          (a as ERC20TokenInfo).name.toLowerCase() <
          (a as ERC20TokenInfo).name.toLowerCase()
            ? -1
            : 0
        );
      return tokens as ERC20TokenInfo[];
    });

    return {
      open,
      remove,
      select,
      balance,
      price,
      prices,
      tokens,
      asBaseCurrency,
      baseCurrency,
      copy
    };
  }
});
</script>

<style scoped lang="scss">
.avatar {
  border: 1px solid rgba(grey, 0.2);
}

.wallet-item.type--inset {
  width: calc(100% + 32px);
  margin-left: -16px;
  margin-right: -16px;
}

.wallet-item {
  &__name {
  }

  &__addr {
    margin-top: 2px;
  }

  &__balance {
    font-weight: 500;
    font-size: 14px;
    color: rgba(white, 0.7) !important;

    .theme--light & {
      color: rgba(black, 0.55) !important;
    }
  }
}
</style>
