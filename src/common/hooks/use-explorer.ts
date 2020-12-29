import { Network } from "../models/network";

export const useExplorer = () => {
  const txUrl = (network: Network, hash: string) => {
    const getSuffix = (hash: string, protocol: Network["protocol"]) => {
      let suffix = "";
      if (protocol === "ton")
        suffix = `transactions/transactionDetails?id=${hash}`;
      if (protocol === "ethereum") suffix = `tx/${hash}`;
      return suffix;
    };
    const prefix = network.blockExplorerURL || "";
    return prefix + getSuffix(hash || "", network.protocol);
  };

  const tokenUrl = (network: Network, address: string) => {
    const getSuffix = (address: string, protocol: Network["protocol"]) => {
      let suffix = "";
      if (protocol === "ton") suffix = `accounts/accountDetails?id=${address}`;
      if (protocol === "ethereum") suffix = `token/${address}`;
      return suffix;
    };
    const prefix = network.blockExplorerURL || "";
    return prefix + getSuffix(address || "", network.protocol);
  };

  const addressUrl = (network: Network, address: string) => {
    const getSuffix = (address: string, protocol: Network["protocol"]) => {
      let suffix = "";

      if (protocol === "ton") suffix = `accounts/accountDetails?id=${address}`;
      if (protocol === "ethereum") suffix = `address/${address}`;
      return suffix;
    };
    const prefix = network.blockExplorerURL || "";
    return prefix + getSuffix(address || "", network.protocol);
  };

  return { txUrl, tokenUrl, addressUrl };
};
