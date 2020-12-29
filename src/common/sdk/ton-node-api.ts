import axios from "axios";
import { PriceResponse } from "./ccc";

export interface KeyPair {
  public: string;
  secret: string;
}

export interface NewWallet {
  createdIn: number;
  createdAt: number;
  account: string;
  keyPair: KeyPair;
  transactionId: string;
  balance: number;
  mnemonic: string;
}

export interface ImportedWallet {
  createdIn: number;
  createdAt: number;
  account: string;
  keyPair: KeyPair;
  mnemonic: string;
}

export interface Mnemonic {
  mnemonic: string;
}

export interface SendOptions {
  value: number;
  keypair?: KeyPair;
  mnemonic?: string;
  address: string;
  recipient: string;
}

export interface ImportOptions {
  mnemonic?: string;
  keypair?: KeyPair;
  derivationPath?: string;
}

export interface Gift {
  id: string;
  address: string;
}

const api = axios.create({
  baseURL: "https://freeton-api.herokuapp.com/"
});

// const api = axios.create({
//   baseURL: "http://localhost:3000/"
// });

export const newWallet = async (mnemonic?: string, network?: string) => {
  const res = await api.get<NewWallet>("/newwallet", {
    params: {
      mnemonic,
      network
    }
  });

  return res.data;
};

export const importWallet = async (
  options: ImportOptions,
  network?: string
) => {
  const res = await api.post<ImportedWallet>("/importwallet", options, {
    params: {
      network
    }
  });
  return res.data;
};

export const mnemonic = async (network?: string) => {
  const res = await api.get<Mnemonic>("/mnemonic", {
    params: {
      network
    }
  });

  return res.data.mnemonic;
};

export const gift = async (address: string, network?: string) => {
  const res = await api.get<Gift>("/grant", {
    params: {
      network,
      address
    }
  });

  return res.data;
};

export const send = async (options: SendOptions, network?: string) => {
  const res = await api.post<{ id: string }>("/send", options, {
    params: {
      network
    }
  });
  return res.data.id;
};

export const getPrices = async (ids: number[]) => {
  const res = await api.get<PriceResponse>("/prices", {
    params: {
      id: ids.join(",")
    }
  });
  return res.data;
};
