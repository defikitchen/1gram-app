export interface ERC20AccountInfo {
  balance: string;
  decimals: number;
  name: string;
  symbol: string;
  address: string;
  totalSupply?: string;
  usdtRate?: string;
}

export interface ERC20TokenInfo {
  decimals: number;
  name: string;
  symbol: string;
  address: string;
  totalSupply?: string;
  usdtRate?: string;
  lastFetched: number;
  logo?: string;
}

export interface ERC20TokenTransferEtherscan {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  nonce: string;
  timeStamp: string;
  to: string;
  tokenDecimal: string;
  tokenName: string;
  tokenSymbol: string;
  transactionIndex: string;
  value: string;
}
