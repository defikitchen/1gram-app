import axios from "axios";
import { fiatMap, Currency } from "./fiat-map";
import { FiatResponse } from "./fiat-response";

const mapper = (data: string): Currency[] => {
  const parsed: FiatResponse = JSON.parse(data);
  const mapped: Currency[] = Object.entries(parsed.rates).map(([key, val]) => {
    return {
      usdRate: val as number,
      ...fiatMap[key]
    };
  });
  const filtered = mapped.filter(
    rate => !!rate.usdRate && rate.code && rate.name
  );
  return filtered;
};

export const getFiatRates = () =>
  axios.get<Currency[]>("https://api.exchangerate-api.com/v4/latest/USD", {
    transformResponse: mapper
  });
