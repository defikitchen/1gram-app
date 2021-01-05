import { defaultNetworks } from "@/common/lib/constants";
import { hexToBytes } from "@/common/lib/open-file";
import { NetworkName } from "@/common/models/network";
import { TONClient, setWasmOptions } from "ton-client-web-js";

export const getClient = async (network: NetworkName = "fld.ton.dev") => {
  setWasmOptions({
    addHTML: console.log
  });
  const graphqlURL = defaultNetworks.find(n => n.name === network)?.graphqlURL;
  const server = graphqlURL || network;
  console.log({ server });
  const client = await TONClient.create({
    servers: [server]
  });
  client._name = network;
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
