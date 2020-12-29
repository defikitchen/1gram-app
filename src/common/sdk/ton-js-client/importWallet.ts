import { getPublicKey } from "ed25519-hd-key";
import {
  getAccountFromKeyPair,
  getAccountFromMnemonic,
  getMnemonic
} from "./mnemonic";
import { KeyPair } from "./types/key-pair";

export const derivePublicKey = async (privateKey: string) => {
  return await getPublicKey(
    Buffer.from(privateKey, "hex"),
    privateKey.length > 64
  ).toString("hex");
};

export const importWalletFromMnemonic = async (
  client: any,
  workchainId: 0 | -1 = 0,
  mnemonic?: string,
  derivationPath?: string
) => {
  const time = new Date().getTime();

  mnemonic = mnemonic || (await getMnemonic(client)).mnemonic;
  let { account, keyPair } = await getAccountFromMnemonic(
    client,
    mnemonic,
    workchainId,
    derivationPath
  );
  const endTime = new Date().getTime();
  const createdIn = endTime - time;

  return {
    createdIn,
    createdAt: time,
    account,
    keyPair,
    mnemonic
  };
};

export const importWalletFromKeyPair = async (
  client: any,
  keys: KeyPair,
  workchainId: 0 | -1 = 0
) => {
  const time = new Date().getTime();

  let { account, keyPair } = await getAccountFromKeyPair(
    client,
    keys,
    workchainId
  );
  const endTime = new Date().getTime();
  const createdIn = endTime - time;

  return {
    createdIn,
    createdAt: time,
    account,
    keyPair,
    mnemonic: ""
  };
};

export const importWallet = async (
  client: any,
  workChainId: 0 | -1 = 0,
  keypair?: KeyPair,
  mnemonic?: string,
  derivationPath?: string
) => {
  if (keypair) {
    const wallet = await importWalletFromKeyPair(client, keypair, workChainId);
    return wallet;
  } else if (mnemonic) {
    const wallet = await importWalletFromMnemonic(
      client,
      workChainId,
      mnemonic,
      derivationPath
    );
    return wallet;
  }
  throw new Error("invalid parameters");
};
