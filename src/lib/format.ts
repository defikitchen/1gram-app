import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const int = (value: string | number) => parseInt(value + "");

export const round = (value: string | number) => Math.round(+value);

export const toFixed = (value: string | number, fixed = 2) =>
  Number(value).toFixed(fixed);

export const prefix = (value: string | number, prefix: string | number) =>
  prefix + "" + (value + "");

export const suffix = (value: string | number, suffix: string | number) =>
  value + "" + (suffix + "");

export const numberFormat = (n: string | number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits
  }).format(+(n || 0));

export const time = (
  time: string | number,
  format = "MM/DD/YYYY, h:mm:ss a "
) => dayjs(time).format(format) as string;

export const fromNow = (time: string | number) => {
  return dayjs(time).fromNow();
};

export const shortify = (value = "", max = 6) => {
  const l = value.length;
  if (l <= max) return value;
  return `${value.slice(0, max)}...${value.slice(l - 4, l)}`;
};

export const toSatoshi = (value: string | number | BigNumber, decimals = 9) => {
  return new BigNumber(value).times(10 ** decimals).toNumber();
};

export const fromSatoshi = (
  value: string | number | BigNumber,
  decimals = 9
) => {
  return new BigNumber(value).div(10 ** decimals).toPrecision(18);
};

export const token = (
  value: string | number | BigNumber,
  symbol = "Ξ",
  decimals = 0,
  maximumFractionDigits = 9
) => {
  const parsed = new BigNumber(value).div(10 ** decimals).toPrecision(18);
  return `${numberFormat(parsed, maximumFractionDigits)} ${symbol}`;
};

export const abbrNumber = (value: string | number) => {
  let val = Number(value);
  let newVal: string | number = val;
  if (val >= 1000) {
    let suffixes = ["", "k", "m", "b", "t"];
    let suffixNum = Math.floor(("" + val).length / 3);
    let shortValue: any = "";
    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum != 0 ? val / Math.pow(1000, suffixNum) : val).toPrecision(
          precision
        )
      );
      let dotLessShortValue = (shortValue + "").replace(/[^a-zA-Z 0-9]+/g, "");
      if (dotLessShortValue.length <= 2) {
        break;
      }
    }
    if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
    newVal = shortValue + suffixes[suffixNum];
  }
  return newVal;
};

export const useFilters = () => {
  return {
    int,
    round,
    toFixed,
    prefix,
    suffix,
    numberFormat,
    time,
    fromNow,
    shortify,
    toSatoshi,
    fromSatoshi,
    token,
    abbrNumber
  };
};
