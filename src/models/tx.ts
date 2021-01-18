import { BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Ethers } from "@/sdk/web3";
import { ERC20TokenTransferEtherscan } from "./erc20";

export interface EthTx {
  blockHash: string;
  blockNumber: number;
  chainId: number;
  confirmations: number;
  data: string;
  from: string;
  gasLimit: BigNumber;
  gasPrice: BigNumber;
  hash: string;
  nonce: number;
  timestamp: number;
  to: string;
  transactionIndex: number;
  value: BigNumber;
}

export interface TonMsg {
  id: string;
  msg_type: number;
  status: number;
  value: string;
  created_at: number;
  src: string;
  dst: string;
  status_name: string;
  msg_type_name: string;
  body: string;
}

export interface TonTx {
  id: string;
  tr_type: number;
  total_fees: string;
  block_id: string;
  status: number;
  now: number;
  balance_delta_other: null | string;
  balance_delta: string;
  in_msg: string;
  out_messages: TonMsg[];
  in_message: TonMsg;
  status_name: string;
  tr_type_name: string;
  account_addr: string;
}

export interface Tx {
  protocol: "ethereum" | "ton" | "bitcoin";
  hash: string;
  txType: number;
  txTypeName: string;
  totalFees: string;
  blockId: string;
  blockHash: string;
  nonce: number;
  status: number;
  confirmations: number;
  timestamp?: number;
  value: string;
  inMsg: string;
  outMsgs: string[];
  statusName: string;
  from: string;
  to: string;
  data: string;
  parentAddress?: string;
}

export interface PendingTx {
  amount: number | null;
  estimatedFees: number | null;
  from: string;
  to: string;
  comment?: string;
}

export const erc20TxToTx = (erc20Tx: ERC20TokenTransferEtherscan): Tx => {
  const tx: Tx = {
    protocol: "ethereum",
    hash: erc20Tx.hash,
    txType: -1,
    txTypeName: "",
    totalFees: erc20Tx.cumulativeGasUsed,
    blockId: erc20Tx.blockNumber,
    blockHash: erc20Tx.blockHash,
    nonce: +erc20Tx.nonce,
    status: -1,
    confirmations: +erc20Tx.confirmations,
    timestamp: +erc20Tx.timeStamp,
    value: erc20Tx.value,
    inMsg: "",
    outMsgs: [],
    statusName: "",
    from: Ethers.utils.getAddress(erc20Tx.from),
    to: Ethers.utils.getAddress(erc20Tx.to),
    data: "",
    parentAddress: Ethers.utils.getAddress(erc20Tx.contractAddress)
  };

  return tx;
};

export const ethTxToTx = (
  ethTx: Ethers.providers.TransactionResponse | EthTx
): Tx => {
  const tx: Tx = {
    protocol: "ethereum",
    hash: ethTx.hash,
    txType: -1,
    txTypeName: "",
    totalFees: "",
    blockId: ethTx?.blockNumber + "",
    blockHash: ethTx.blockHash + "",
    nonce: ethTx.nonce,
    status: -1,
    confirmations: ethTx.confirmations,
    timestamp: ethTx.timestamp,
    value: ethTx.value.toString(),
    inMsg: "",
    outMsgs: [],
    statusName: "",
    from: ethTx.from,
    to: ethTx.to + "",
    data: ethTx.data
  };
  return tx;
};

export const tonTxToTx = (tonTx: TonTx): Tx => {
  const outMsg = (tonTx.out_messages || [])[0];
  const delta = new BN(tonTx.balance_delta);
  const otherAddress = [
    tonTx?.in_message?.src,
    tonTx?.in_message?.dst,
    outMsg?.dst,
    outMsg?.src
  ].find(a => a && a !== tonTx.account_addr);
  const received = delta.isGreaterThanOrEqualTo(0);

  const tx: Tx = {
    protocol: "ton",
    hash: tonTx.id,
    txType: tonTx.tr_type,
    txTypeName: tonTx.tr_type_name,
    totalFees: tonTx.total_fees,
    blockId: tonTx.block_id,
    blockHash: "",
    nonce: 0,
    status: tonTx.status,
    confirmations: 0,
    timestamp: tonTx.now,
    value: delta.abs().toString(),
    inMsg: tonTx.in_msg,
    outMsgs: tonTx.out_messages.map(m => m.id),
    statusName: tonTx.status_name,
    from: (received && otherAddress) || (received && tonTx.account_addr) || "",
    to: (!received && otherAddress) || (received && tonTx.account_addr) || "",
    data: ""
  };
  return tx;
};
