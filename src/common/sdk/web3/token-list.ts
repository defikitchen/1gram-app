import { ERC20TokenInfo } from "@/common/models/erc20";
import axios from "axios";

export interface TokenListResponse {
  name: string;
  timestamp: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  keywords: string[];
  tokens: {
    address: string;
    chainId: number;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  }[];
  logoURI: string;
}

interface TokenList {
  version: string;
  timestamp: number;
  tokens: ERC20TokenInfo[];
}
export const getTokenList = async () => {
  const { data } = await axios.get<TokenListResponse>(
    "http://tokens.1inch.eth.link/"
  );
  const timestamp = new Date(data.timestamp).getTime();
  const version =
    data.version.major + "." + data.version.minor + "." + data.version.patch;
  const tokens: ERC20TokenInfo[] = data.tokens.map(t => ({
    address: t.address,
    decimals: t.decimals,
    lastFetched: timestamp,
    name: t.name,
    symbol: t.symbol,
    logo: t.logoURI
  }));

  const res: TokenList = {
    tokens,
    version,
    timestamp
  };

  return res;
};
