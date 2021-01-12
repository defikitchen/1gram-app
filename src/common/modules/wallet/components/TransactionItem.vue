<template>
  <div v-if="transaction">
    <div class="item" v-if="divider">
      <v-divider class="mx-4" />
    </div>
    <v-list-item ripple class="clickable px-4 py-1 item">
      <v-list-item-avatar class="avatar">
        <v-icon v-if="inn" v-text="'call_received'" color="primary" />
        <v-icon v-else-if="toToken" v-text="'receipt'" color="accent" />
        <v-icon v-else color="accent" v-text="'send'" />
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-subtitle class="slightly-transparent">
          <span>{{
            ((transaction.timestamp || 0) * 1000) | time("MMM DD h:mm:ss a")
          }}</span>
          -
          <span v-if="inn">received:</span>
          <span v-else-if="toToken"
            >Interacted with {{ toToken.symbol }} contract:</span
          >
          <span v-else>sent:</span>
        </v-list-item-subtitle>
        <v-list-item-subtitle class="subtitle-1">
          <span>{{ transaction.hash | shortify(20) }}</span>
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action v-if="!toToken || (toToken && +transaction.value)">
        <span
          :class="
            `${
              inn ? 'success--text' : ''
            } transaction-item__amount font-weight-bold`
          "
        >
          {{ transaction.value === "0" ? "" : inn ? "+" : "-"
          }}{{
            transaction.value
              | token(
                (parentToken && parentToken.symbol) || wallet.network.symbol,
                (parentToken && parentToken.decimals) || wallet.network.decimals
              )
          }}</span
        >

        <!-- <span class="transaction-item__usd">{{
          asBaseCurrency(price) | token(baseCurrency.code, 0, 2)
        }}</span> -->
      </v-list-item-action>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import { Tx } from "@/common/models/tx";
import { Wallet } from "@/common/models/wallet";
import {
  defineComponent,
  PropType,
  computed,
  toRefs
} from "@vue/composition-api";
import {
  usePrices,
  useUsdPrice,
  useUsdTokenPrice
} from "@/common/hooks/use-prices";
import { Ethers } from "@/common/sdk/web3";
import { hexDataSlice } from "ethers/lib/utils";
import { useERC20 } from "@/common/hooks/use-erc20";

export default defineComponent({
  props: {
    wallet: {
      required: true,
      type: Object as PropType<Wallet>
    },
    divider: Boolean,
    transaction: {
      type: Object as PropType<Tx>,
      default: false
    }
  },
  setup(props) {
    const refs = toRefs(props);
    const inn = computed(() => props.transaction.to === props.wallet.address);
    const { prices, asBaseCurrency, baseCurrency, tokenPrices } = usePrices();
    const { parseERC20Tx } = useERC20();

    const price = computed(() => {
      if (parentToken.value) {
        return useUsdTokenPrice(
          parentToken.value?.address || "",
          refs.transaction.value.value || "",
          parentToken.value?.decimals || 0,
          tokenPrices
        );
      } else {
        return useUsdPrice(
          refs.wallet.value.network.etherscanId || -1,
          refs.transaction.value.value,
          refs.wallet.value.network.decimals,
          prices
        );
      }
    });

    const toToken = computed(() => {
      const address = refs.transaction.value.to;
      const token = ((tokenPrices && tokenPrices.value) || []).find(
        t => t.address === address
      );
      return token;
    });

    const parsedData = computed(() => {
      if (refs.transaction.value || !refs.wallet.value) return null;
      return parseERC20Tx(refs.transaction.value, refs.wallet.value);
    });

    const functionName = computed(() => {
      return parsedData && parsedData?.value?.parsed.functionFragment.name;
    });

    const parentToken = computed(() => {
      const address = refs.transaction.value.parentAddress;
      const token = ((tokenPrices && tokenPrices.value) || []).find(
        t => t.address === address
      );
      return token;
    });

    return {
      inn,
      price,
      baseCurrency,
      asBaseCurrency,
      parseERC20Tx,
      toToken,
      parentToken,
      parsedData,
      functionName
    };
  }
});
</script>

<style scoped lang="scss">
.item {
  width: calc(100% + 32px);
  margin-left: -16px;
  margin-right: -16px;
}
.subtitle-1 {
  margin-top: 2px;
}

.avatar {
  border: 1px solid rgba(white, 0.15);

  .v-application.theme--light & {
    border: 1px solid rgba(black, 0.1);
  }

  .v-icon {
    transform: scale(0.7);
    &.is--flipped {
      transform: scale(0.7) scaleX(-1);
    }
  }
}

.transaction-item__amount {
  font-weight: 500;
  font-size: 15px;

  &:not(.success--text) {
    color: rgba(white, 0.7) !important;

    .theme--light & {
      color: rgba(black, 0.55) !important;
    }
  }
}

.transaction-item__usd {
  font-weight: 500;
  font-size: 13px;
  position: relative;
  top: -6px;

  &:not(.success--text) {
    color: rgba(white, 0.7) !important;

    .theme--light & {
      color: rgba(black, 0.55) !important;
    }
  }
}
</style>
