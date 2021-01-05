import { Message } from "./types/message";
import { marvinAbi } from "./contracts/marvin.abi";
import { waitFor } from "./waitFor";
import { NetworkName } from "@/common/models/network";

export interface RunMessage {
  address: string;
  abi: any;
  message: Message;
}

export interface MessageProcessingState {
  lastBlockId: string;
  sendingTime: number;
}

export const granter =
  "0:deda155da7c518f57cb664be70b9042ed54a92542769735dfb73d3eef85acdaf";

export const grant = async (client: any, to: string, wait?: boolean) => {
  const { contracts } = client;
  const runMessage: RunMessage = await contracts.createRunMessage({
    address: granter,
    functionName: "grant",
    abi: marvinAbi,
    input: {
      addr: to
    }
  });

  console.log({ runMessage });

  const messageProcessingState: MessageProcessingState = await contracts.sendMessage(
    runMessage.message
  );

  console.log({ messageProcessingState });

  let id = runMessage.message.messageId;

  console.log({ id });

  if (wait) {
    await waitFor(client._name as NetworkName, to, "balance");
  }

  return id;
};
