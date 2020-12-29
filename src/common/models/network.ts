export interface Network {
  id: string | number;
  name:
    | "net.ton.dev"
    | "main.ton.dev"
    | "fld.ton.dev"
    | "ropsten"
    | "mainnet"
    | string
    | undefined;
  RPCURL: string;
  chainID: number;
  symbol?: string;
  blockExplorerURL?: string;
  removable?: boolean;
  protocol: "ton" | "ethereum";
  decimals: number;
  etherscanId?: number;
}
