<template>
  <v-list>
    <v-list-item>
      <v-text-field
        ref="search"
        outlined
        rounded
        dense
        hide-details
        v-model="filter"
        placeholder="Search by name or symbol"
        class="my-3"
        clearable
        clear-icon="close"
      ></v-text-field>
    </v-list-item>
    <v-list-item
      :input-value="currency.code === baseCurrencyCode"
      v-for="(currency, i) of currencies"
      :key="i"
      @click="
        setBaseCurrency(currency.code);
        $emit('select', currency.code);
        reset();
      "
    >
      <v-list-item-content>
        <v-list-item-title>{{ currency.name }}</v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        <v-spacer />
        <v-list-item-action-text>
          {{ currency.code }} ({{ currency.symbol }})
        </v-list-item-action-text>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "@vue/composition-api";
import { usePrices } from "@/hooks/use-prices";

export default defineComponent({
  props: {
    open: Boolean
  },
  setup(props) {
    const { baseCurrencyCode, fiatPrices, setBaseCurrency } = usePrices();
    const search = ref<null | HTMLInputElement>(null);
    const filter = ref("");

    const currencies = computed(() => {
      const q = (filter.value || "").trim().toLowerCase();
      const unordered = fiatPrices.value || [];
      const list = unordered
        .sort((a, b) => {
          const top10 = [
            "USD",
            "RUB",
            "MYR",
            "EUR",
            "BTC",
            "CHF",
            "CNY",
            "JPY",
            "SGD",
            "AUD",
            "GBP"
          ];
          return b.code === baseCurrencyCode.value
            ? -50
            : top10.includes(b.code)
            ? top10.indexOf(b.code) - 10
            : 0;
        })
        .reverse();

      if (!q) return list;
      else
        return list.filter(c =>
          [c.code, c.name, c.symbol].some(text =>
            text.toLowerCase().includes(q)
          )
        );
    });

    watch(
      () => props.open,
      () => {
        setTimeout(() => {
          if (open && search.value) {
            search.value.focus();
          }
        }, 500);
      },
      {
        immediate: true
      }
    );

    const reset = () => {
      filter.value = "";
    };

    return {
      baseCurrencyCode,
      currencies,
      setBaseCurrency,
      search,
      filter,
      reset
    };
  }
});
</script>
