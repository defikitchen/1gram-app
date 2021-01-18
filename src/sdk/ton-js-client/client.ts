import { defaultNetworks, defaultTonNetwork } from "@/lib/constants";
import { hexToBytes } from "@/lib/open-file";
import { Network, NetworkName } from "@/models/network";
import store from "@/store";
import { TONClient, setWasmOptions } from "ton-client-web-js";

export const getClient = async (
  networkName: NetworkName = defaultTonNetwork.name
) => {
  setWasmOptions({
    addHTML: console.log
  });
  const networks = [...defaultNetworks, ...store.state.Wallet.networks];

  const network: Network =
    networks.find(n => n.name === networkName) || defaultTonNetwork;

  let server = network.graphqlURL || `https://${networkName}`;

  if (server.endsWith("/")) server = server.slice(0, -1);
  if (server.endsWith("graphql")) server = server.slice(0, -7);
  const client = await TONClient.create({
    servers: [server]
  });
  client._name = network.name;
  return client;
};

export const isAddress = (address = "") => {
  try {
    const parts = address.split(":");
    const bytes = hexToBytes(parts[1]);
    const isHex =
      bytes.every(b => !isNaN(b) && b !== undefined && b !== null) &&
      bytes.length === 32;
    const validChainId = ["-1", "0", "1"].includes(parts[0]);
    return validChainId && isHex;
  } catch {
    return false;
  }
};
