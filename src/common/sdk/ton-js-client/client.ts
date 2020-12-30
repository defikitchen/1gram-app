import { hexToBytes } from "@/common/lib/open-file";
import { TONClient, setWasmOptions } from "ton-client-web-js";
import { utils } from "../web3";

export const getClient = async (
  network: "net.ton.dev" | "main.ton.dev" | "fld.ton.dev" = "fld.ton.dev"
) => {
  setWasmOptions({
    addHTML: console.log
  });
  let server: string = network;
  if (network === "fld.ton.dev") server = "https://gql.custler.net";
  console.log(server);
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
