export interface Block {
  /**
   * @field workchainId typically `-1 | 0 | 1`
   */
  workchain: -1 | 0 | 1;
  shard: string;
  seqno: number;
  roothash: string;
  filehash: string;
}
export interface TransactionSummary {
  /**
   * @field account address in `baddr` format
   */
  account: string;
  lt: number;
  hash: string;
}
export interface Message {
  hash: string;
  type: "internal" | "external" | null;
  source: string | null;
  destination: string;
  message: string;
  lt?: string;
  time?: number;
  value?: string;
}
export interface TransactionResponse {
  block: Block;
  workchain: "-1" | "0" | "1";
  account_hex: string;
  /**
   * @field account address in `baddr` format
   */
  account: string;
  hash: string;
  lt: string;
  time: number;
  out_messages: Message[];
  in_message: Message | null;
  prev_transaction: TransactionSummary | null;
  transaction: string;
}
export interface Transaction {
  type: "send" | "received" | "incoming" | "outgoing";
  workchain: "-1" | "0" | "1";
  block: Block;
  account_hex: string;
  account: string;
  hash?: string;
  lt?: string;
  time: number;
  prev_transaction: TransactionSummary | null;
  transaction: string;
  source: string | null;
  destination: string | null;
  value?: number | null;
}
export declare const mapTransactions: (
  response: TransactionResponse[]
) => Transaction[];
