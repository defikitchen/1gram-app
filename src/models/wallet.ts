import { Network } from "./network";
import { TonMsg, Tx } from "./tx";

export interface WalletERC20Token {
  address: string;
  balance?: string;
}

export interface Wallet {
  address: string;
  name: string;
  backedUp: boolean;
  imported: boolean;
  mnemonic?: string;
  path?: string;
  keyPair: string;
  color?: string;
  balance: number;
  lastUsed: number;
  lastSynced?: number;
  transactions: Tx[];
  receipts: Tx[];
  messages: TonMsg[];
  network: Network;
  erc20Tokens: WalletERC20Token[];
  erc20Transactions?: Tx[];
  needsDeployment?: boolean;
}
