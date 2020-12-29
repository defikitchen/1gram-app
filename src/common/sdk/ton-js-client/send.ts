import { walletPkg } from "./contracts/wallet.pkg";
import { KeyPair } from "./types/key-pair";

export const send = async (
  client: any,
  from: string,
  to: string,
  keyPair: KeyPair,
  value: number,
  bounce = true
) => {
  const { contracts } = client;
  const runMessage = await contracts.createRunMessage({
    address: from,
    functionName: "sendTransaction",
    abi: walletPkg.abi,
    input: {
      dest: to,
      value,
      bounce
    },
    keyPair
  });

  const messageProcessingState = await contracts.sendMessage(
    runMessage.message
  );

  console.log({ messageProcessingState });

  const sentTransactionInfo = await contracts.waitForRunTransaction(
    runMessage,
    messageProcessingState
  );

  console.log({ messageProcessingState });

  const id: string = sentTransactionInfo.transaction.id;

  return id;
};
