import { getClient } from "./client";
import { newWallet } from "./newWallet";
import {
  getAccountFromMnemonic,
  getMnemonic,
  getAccountFromKeyPair
} from "./mnemonic";

import { send } from "./send";
import {
  importWalletFromKeyPair,
  importWalletFromMnemonic,
  importWallet
} from "./importWallet";
import { calcFees, Fees } from "./fees";

export {
  getClient,
  newWallet,
  getMnemonic,
  send,
  importWalletFromKeyPair,
  importWalletFromMnemonic,
  importWallet,
  getAccountFromMnemonic,
  getAccountFromKeyPair,
  calcFees,
  Fees
};
