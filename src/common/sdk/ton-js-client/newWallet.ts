import { addTimeoutToPromise } from "@/common/lib/error-handling";
import { getAccountFromKeyPair, KeyPair } from "..";
import { gift } from "../ton-node-api";
import { initWallet } from "./initWallet";
import { getAccountFromMnemonic, getMnemonic } from "./mnemonic";

export const deployWallet = async (
  client: any,
  keyPair: KeyPair,
  workchainId: 0 | -1 = 0
) => {
  const { account, deployMessage } = await getAccountFromKeyPair(
    client,
    keyPair,
    workchainId
  );
  const { balance, id, result } = await initWallet(client, deployMessage);

  return {
    account,
    deployMessage,
    balance,
    id,
    result
  };
};

export const newWallet = async (
  client: any,
  workchainId: 0 | -1 = 0,
  mnemonic?: string
) => {
  const time = new Date().getTime();

  mnemonic = mnemonic || (await getMnemonic(client)).mnemonic;
  const { account, deployMessage, keyPair } = await getAccountFromMnemonic(
    client,
    mnemonic,
    workchainId
  );

  let balance = 0;
  let id = "";

  try {
    //"net.ton.dev",
    if (["fld.ton.dev"].includes(client._name)) {
      const promise = Promise.all([
        gift(account, client._name),
        initWallet(client, deployMessage)
      ]);
      await addTimeoutToPromise(promise, 3 * 60 * 1000);
    }
  } catch (e) {
    console.log("could not initialize", e);
  }

  const endTime = new Date().getTime();
  const createdIn = endTime - time;

  return {
    createdIn,
    createdAt: time,
    account,
    keyPair,
    transactionId: id,
    balance,
    mnemonic,
    deployMessage
  };
};
