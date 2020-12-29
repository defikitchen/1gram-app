import { PriceResponse } from "./price";

interface TokenList {
  [key: string]: number;
}

const tokenList: TokenList = {
  TON: 7505,
  ETH: 1027,
  BTC: 1
  // could grow
};

const defaultTokens = [tokenList.TON, tokenList.ETH, tokenList.BTC];

export { PriceResponse, tokenList, defaultTokens, TokenList };
