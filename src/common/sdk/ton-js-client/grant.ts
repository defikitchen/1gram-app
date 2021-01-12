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

export const grant = async (
  client: any,
  giverAddress: string,
  to: string,
  wait?: boolean
) => {
  const { contracts } = client;
  const runMessage: RunMessage = await contracts.createRunMessage({
    address: giverAddress,
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
