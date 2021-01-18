import { tonDefaultPath } from "@/lib/constants";
import { walletPkg } from "./contracts/wallet.pkg";
import { KeyPair } from "./types/key-pair";

// const HD_PATH = "m/44'/396'/0'/0/0";

export const getMnemonic = async (client: any) => {
  const mnemonic: string = await client.crypto.mnemonicFromRandom({
    dictionary: 1, //english
    wordCount: 12
  });

  return { mnemonic };
};

export const getAccountFromMnemonic = async (
  client: any,
  seedPhrase: string,
  workchainId: 0 | -1 = 0,
  derivationPath?: string
) => {
  const keyPair: KeyPair = await client.crypto.mnemonicDeriveSignKeys({
    dictionary: 1, // english
    wordCount: 12,
    phrase: seedPhrase,
    path: derivationPath || tonDefaultPath
  });

  const deployMessage = await client.contracts.createDeployMessage({
    package: walletPkg,
    constructorParams: {},
    keyPair,
    workchainId
  });
  const account: string = deployMessage.address;

  return { keyPair, account, deployMessage };
};

export const getAccountFromKeyPair = async (
  client: any,
  keyPair: KeyPair,
  workchainId: 0 | -1 = 0
) => {
  const deployMessage = await client.contracts.createDeployMessage({
    package: walletPkg,
    constructorParams: {},
    keyPair,
    workchainId
  });

  const account: string = deployMessage.address;

  return { keyPair, account, deployMessage };
};
