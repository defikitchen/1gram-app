export type NetworkName =
  | "net.ton.dev"
  | "main.ton.dev"
  | "fld.ton.dev"
  | "rustnet.ton.dev"
  | "ropsten"
  | "mainnet"
  | string
  | undefined;

export interface Network {
  id: string | number;
  name: NetworkName;
  symbol?: string;
  blockExplorerURL?: string;
  removable?: boolean;
  protocol: "ton" | "ethereum";
  decimals: number;
  etherscanId?: number;
  graphqlURL?: string;
  giverAddress?: string;
}
