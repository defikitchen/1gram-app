import { getMnemonic, toSeedHex } from "@/common/lib/bip44";
import { Ethers } from "@/common/sdk/web3";
import { reactive, ref } from "@vue/composition-api";
import { decrypt } from "../lib/crypto";
import { KeyPair } from "../sdk";
import { Wallet } from "../models/wallet";
import { usePin } from "./use-pin";
import { ethTxToTx, Tx } from "../models/tx";
import BigNumber from "bignumber.js";
import { getEtherscanProvider, getProvider } from "../sdk/web3/client";
import { ethDefaultPath } from "../lib/constants";

export interface EthereumState {
  tx: null | Tx;
  wallet: null | Wallet;
}

let state: EthereumState;

export const useEthereum = () => {
  state =
    state ||
    reactive<EthereumState>({
      tx: null,
      wallet: null
    });

  const { getPin } = usePin();

  const shuffle = () => {
    const mnemonic = getMnemonic("english", 12);
    const hexSeed = toSeedHex(mnemonic);
    return { mnemonic, hexSeed };
  };

  const createWallet = async (
    provider = getProvider(),
    _mnemonic = shuffle().mnemonic,
    _path = ethDefaultPath
  ) => {
    const {
      address,
      mnemonic,
      privateKey,
      publicKey
    } = Ethers.Wallet.fromMnemonic(_mnemonic, _path);
    const { phrase, path } = mnemonic;
    const walletWithProvider = new Ethers.Wallet(privateKey, provider);
    const balance = await walletWithProvider.getBalance();
    const response = {
      phrase,
      path,
      publicKey,
      address,
      privateKey,
      balance: balance.toString(),
      wallet: walletWithProvider
    };
    return response;
  };

  const importWallet = async (provider = getProvider(), privateKey: string) => {
    const walletWithProvider = new Ethers.Wallet(privateKey, provider);
    const balance = await walletWithProvider.getBalance();
    const response = {
      phrase: "",
      path: "",
      publicKey: walletWithProvider.publicKey,
      address: walletWithProvider.address,
      privateKey: walletWithProvider.privateKey,
      balance: balance.toString(),
      wallet: walletWithProvider
    };
    return response;
  };

  const sendTx = async (simpleWallet: Wallet, value: string, to: string) => {
    const pin = await getPin(true);
    if (!pin) return;
    const wallet = await getSignerFromWallet(simpleWallet);
    if (!wallet) return null;
    const options = {
      to,
      value: Ethers.BigNumber.from(value)
    };
    return wallet.sendTransaction(options);
  };

  const getHistory = async (wallet: Wallet) => {
    const provider = getEtherscanProvider(wallet.network.name);
    if (!wallet.address) return [];
    const history = await provider.getHistory(wallet.address);
    return history;
  };

  const getBalance = async (wallet: Wallet) => {
    if (!wallet.address) return "0";
    const balance = await getProvider(wallet.network.name).getBalance(
      wallet.address
    );
    return balance.toString();
  };

  const getTx = async (wallet: Wallet, hash: string): Promise<Tx | null> => {
    const provider = getProvider(wallet.network.name);
    const tx = await provider.getTransaction(hash);
    return ethTxToTx(tx);
  };

  const getSignerFromWallet = async (wallet: Wallet) => {
    const pin = await getPin();
    if (!pin) return null;
    const provider = getProvider(wallet.network.name);
    const { secret } = JSON.parse(decrypt(wallet.keyPair, pin)) as KeyPair;
    const walletWithProvider = new Ethers.Wallet(secret, provider);
    return walletWithProvider;
  };

  const estimateGas = async (
    wallet: Wallet,
    to: string,
    value: string | number | BigNumber
  ) => {
    const tx = {
      from: wallet.address,
      to,
      value: Ethers.utils.parseEther(new BigNumber(value).toString()),
      data: "0x"
    };
    const provider = getProvider(wallet.network.name);
    const estimate = await provider.estimateGas(tx);
    return estimate.toString();
  };

  return {
    createWallet,
    importWallet,
    shuffle,
    sendTx,
    getHistory,
    getSignerFromWallet,
    getBalance,
    getTx,
    state,
    estimateGas
  };
};
