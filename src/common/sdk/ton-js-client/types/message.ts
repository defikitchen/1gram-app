import { KeyPair } from "./key-pair";

export interface Message {
  address: string;
  messageId: string;
  messageBodyBase64: string;
  expire?: any;
}

export interface DeployMessage {
  address: string;
  message: Message;
}

export interface CalcWallet {
  account: string;
  keyPair: KeyPair;
  deployMessage: DeployMessage;
}
