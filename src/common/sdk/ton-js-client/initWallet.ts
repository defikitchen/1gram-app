import { NetworkName } from "@/common/models/network";
import { waitFor } from "./waitFor";

export const initWallet = async (client: any, deployMessage: any) => {
  await client.contracts.sendMessage(deployMessage.message);

  await waitFor(
    client._name as NetworkName,
    deployMessage.address as string,
    "active"
  );
  return { msg: deployMessage.message, id: "", balance: 0 };
};
