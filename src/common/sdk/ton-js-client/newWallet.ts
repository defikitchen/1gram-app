import { addTimeoutToPromise } from "@/common/lib/error-handling";
import { NetworkName } from "@/common/models/network";
import { getAccountFromKeyPair, KeyPair } from "..";
import { grant } from "./grant";
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
  console.log(deployMessage, account);

  const { balance, id } = await initWallet(client, deployMessage);

  return {
    account,
    deployMessage,
    balance,
    id
  };
};

export const newWallet = async (
  client: any,
  workchainId: 0 | -1 = 0,
  mnemonic?: string
) => {
  const time = new Date().getTime();
  const name = (client._name as NetworkName) || "";

  mnemonic = mnemonic || (await getMnemonic(client)).mnemonic;
  const { account, deployMessage, keyPair } = await getAccountFromMnemonic(
    client,
    mnemonic,
    workchainId
  );

  console.log(mnemonic, account);

  let balance = 0;
  let id = "";
  let deployed = false;

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
    deployMessage,
    deployed
  };
};
