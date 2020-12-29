import { TONClient, setWasmOptions } from "ton-client-web-js";

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
