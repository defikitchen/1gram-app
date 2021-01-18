export const availableSymbols = [
  "USD",
  "AED",
  "ARS",
  "AUD",
  "BGN",
  "BRL",
  "BSD",
  "CAD",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CZK",
  "DKK",
  "DOP",
  "EGP",
  "EUR",
  "FJD",
  "GBP",
  "GTQ",
  "HKD",
  "HRK",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "ISK",
  "JPY",
  "KRW",
  "KZT",
  "MVR",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PAB",
  "PEN",
  "PHP",
  "PKR",
  "PLN",
  "PYG",
  "RON",
  "RUB",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "TWD",
  "UAH",
  "UYU",
  "ZAR"
];

export type FiatSymbol =
  | "USD"
  | "AED"
  | "ARS"
  | "AUD"
  | "BGN"
  | "BRL"
  | "BSD"
  | "CAD"
  | "CHF"
  | "CLP"
  | "CNY"
  | "COP"
  | "CZK"
  | "DKK"
  | "DOP"
  | "EGP"
  | "EUR"
  | "FJD"
  | "GBP"
  | "GTQ"
  | "HKD"
  | "HRK"
  | "HUF"
  | "IDR"
  | "ILS"
  | "INR"
  | "ISK"
  | "JPY"
  | "KRW"
  | "KZT"
  | "MVR"
  | "MXN"
  | "MYR"
  | "NOK"
  | "NZD"
  | "PAB"
  | "PEN"
  | "PHP"
  | "PKR"
  | "PLN"
  | "PYG"
  | "RON"
  | "RUB"
  | "SAR"
  | "SEK"
  | "SGD"
  | "THB"
  | "TRY"
  | "TWD"
  | "UAH"
  | "UYU"
  | "ZAR";

export interface FiatRates {
  USD: number;
  AED: number;
  ARS: number;
  AUD: number;
  BGN: number;
  BRL: number;
  BSD: number;
  CAD: number;
  CHF: number;
  CLP: number;
  CNY: number;
  COP: number;
  CZK: number;
  DKK: number;
  DOP: number;
  EGP: number;
  EUR: number;
  FJD: number;
  GBP: number;
  GTQ: number;
  HKD: number;
  HRK: number;
  HUF: number;
  IDR: number;
  ILS: number;
  INR: number;
  ISK: number;
  JPY: number;
  KRW: number;
  KZT: number;
  MVR: number;
  MXN: number;
  MYR: number;
  NOK: number;
  NZD: number;
  PAB: number;
  PEN: number;
  PHP: number;
  PKR: number;
  PLN: number;
  PYG: number;
  RON: number;
  RUB: number;
  SAR: number;
  SEK: number;
  SGD: number;
  THB: number;
  TRY: number;
  TWD: number;
  UAH: number;
  UYU: number;
  ZAR: number;
}

export interface FiatResponse {
  base: FiatSymbol;
  date: string;
  time_last_updated: number;
  rates: FiatRates;
}
