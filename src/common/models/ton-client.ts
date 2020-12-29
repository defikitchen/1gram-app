export type TONConfigData = {
  defaultWorkchain?: number;
  servers: string[];
  requestsServer?: string;
  queriesServer?: string;
  queriesWsServer?: string;
  log_verbose?: boolean;
};

export type TONKeyPairData = {
  secret: string;
  public: string;
};

export type TONOutputEncodingType = "Text" | "Hex" | "HexUppercase" | "Base64";

export type TONInputMessage = {
  text?: string;
  hex?: string;
  base64?: string;
};

export type TONFactorizeResult = {
  a: string;
  b: string;
};

export type TONScryptParams = {
  password: TONInputMessage;
  salt: TONInputMessage;
  logN: number;
  r: number;
  p: number;
  dkLen: number;
  outputEncoding?: TONOutputEncodingType; // default Hex
};

export type TONNaclBoxParams = {
  message: TONInputMessage;
  nonce: string;
  theirPublicKey: string;
  secretKey: string;
  outputEncoding?: TONOutputEncodingType; // default Hex
};

export type TONNaclSecretBoxParams = {
  message: TONInputMessage;
  nonce: string;
  key: string;
  outputEncoding?: TONOutputEncodingType; // default Hex
};

interface TONCryptoModule {
  factorize(challengeHex: string): Promise<TONFactorizeResult>;

  modularPower(
    baseHex: string,
    exponentHex: string,
    modulusHex: string
  ): Promise<string>;

  randomGenerateBytes(
    length: number,
    outputEncoding: TONOutputEncodingType
  ): Promise<string>;

  ed25519Keypair(): Promise<TONKeyPairData>;

  sha512(
    message: TONInputMessage,
    outputEncoding: TONOutputEncodingType
  ): Promise<string>;

  sha256(
    message: TONInputMessage,
    outputEncoding: TONOutputEncodingType
  ): Promise<string>;

  scrypt(params: TONScryptParams): Promise<string>;

  naclBoxKeypair(): Promise<TONKeyPairData>;

  naclBoxKeypairFromSecretKey(secretKey: string): Promise<TONKeyPairData>;

  naclSignKeypair(): Promise<TONKeyPairData>;

  naclSignKeypairFromSecretKey(secretKey: string): Promise<TONKeyPairData>;

  naclBox(params: TONNaclBoxParams): Promise<string>;

  naclBoxOpen(params: TONNaclBoxParams): Promise<string>;

  naclSecretBox(params: TONNaclSecretBoxParams): Promise<string>;

  naclSecretBoxOpen(params: TONNaclSecretBoxParams): Promise<string>;

  naclSign(
    message: TONInputMessage,
    key: string,
    outputEncoding: TONOutputEncodingType
  ): Promise<string>;

  naclSignOpen(
    message: TONInputMessage,
    key: string,
    outputEncoding: TONOutputEncodingType
  ): Promise<string>;

  naclSignDetached(
    message: TONInputMessage,
    key: string,
    outputEncoding: TONOutputEncodingType
  ): Promise<string>;

  mnemonicWords(): Promise<string>;

  mnemonicFromRandom(): Promise<string>;

  mnemonicFromEntropy(entropyHex: string): Promise<string>;

  mnemonicIsValid(phrase: string): Promise<boolean>;

  hdkeyXPrvFromMnemonic(phrase: string): Promise<string>;

  hdkeyXPrvDerive(
    serialized: string,
    index: number,
    hardened: boolean,
    compliant: boolean
  ): Promise<string>;

  hdkeyXPrvDerivePath(
    serialized: string,
    path: string,
    compliant: boolean
  ): Promise<string>;

  hdkeyXPrvSecret(serialized: string): Promise<string>;

  hdkeyXPrvPublic(serialized: string): Promise<string>;
}

export type TONContractABIParameter = {
  name: string;
  type: string;
};

export type TONContractABIFunction = {
  name: string;
  signed?: boolean;
  inputs: TONContractABIParameter[];
  outputs: TONContractABIParameter[];
};

export type TONContractABI = {
  "ABI version": number;
  functions: TONContractABIFunction[];
};

export type TONContractPackage = {
  abi: TONContractABI;
  imageBase64: string;
};

declare type TONContractLoadParams = {
  address: string;
  includeImage: boolean;
};

type TONContractLoadResult = {
  id?: string;
  balanceGrams?: string;
  imageBase64?: string;
};

type TONContractDeployParams = {
  package: TONContractPackage;
  constructorParams: any;
  keyPair: TONKeyPairData;
};

type TONContractDeployResult = {
  address: string;
  alreadyDeployed: boolean;
};

type TONContractUnsignedMessage = {
  unsignedBytesBase64: string;
  bytesToSignBase64: string;
};

type TONContractMessage = {
  messageId: string;
  messageIdBase64: string;
  messageBodyBase64: string;
};

type TONContractUnsignedDeployMessage = {
  address: string;
  signParams: TONContractUnsignedMessage;
};

type TONContractUnsignedRunMessage = {
  abi: TONContractABI;
  functionName: string;
  signParams: TONContractUnsignedMessage;
};

type TONContractDeployMessage = {
  address: string;
  message: TONContractMessage;
};

type TONContractRunMessage = {
  abi: TONContractABI;
  functionName: string;
  message: TONContractMessage;
};

type TONContractCreateSignedMessageParams = {
  unsignedBytesBase64: string;
  signBytesBase64: string;
  publicKeyHex: string;
};

type TONContractCreateSignedDeployMessageParams = {
  address: string;
  createSignedParams: TONContractCreateSignedMessageParams;
};

type TONContractCreateSignedRunMessageParams = {
  abi: TONContractABI;
  functionName: string;
  createSignedParams: TONContractCreateSignedMessageParams;
};

type TONContractRunParams = {
  address: string;
  abi: TONContractABI;
  functionName: string;
  input: any;
  keyPair: TONKeyPairData;
};

type TONContractLocalRunParams = {
  address: string;
  abi: TONContractABI;
  functionName: string;
  input: any;
  keyPair?: TONKeyPairData;
};

type TONContractDecodeRunOutputParams = {
  abi: TONContractABI;
  functionName: string;
  bodyBase64: string;
};

type TONContractDecodeMessageBodyParams = {
  abi: TONContractABI;
  bodyBase64: string;
};

type TONContractRunResult = {
  output: any;
};

type TONContractDecodeMessageBodyResult = {
  function: string;
  output: any;
};

type QTransaction = {
  id: string;
  description: {
    Ordinary: {
      aborted: boolean;
    };
  };
  status: string;
  out_msgs: string[];
};

type QAddrStd = {
  AddrStd: {
    workchain_id: number;
    address: string;
  };
};

type QAddr = "AddrNone" | QAddrStd;

type QMessage = {
  id: string;
  header: {
    ExtOutMsgInfo?: {
      src: QAddr;
      dst: QAddr;
      created_at: number;
    };
  };
  body: string;
  status: string;
};

export interface TONContractsModule {
  load(params: TONContractLoadParams): Promise<TONContractLoadResult>;

  deploy(params: TONContractDeployParams): Promise<TONContractDeployResult>;

  run(params: TONContractRunParams): Promise<TONContractRunResult>;

  runLocal(params: TONContractLocalRunParams): Promise<TONContractRunResult>;

  createDeployMessage(
    params: TONContractDeployParams
  ): Promise<TONContractDeployMessage>;

  createRunMessage(
    params: TONContractRunParams
  ): Promise<TONContractRunMessage>;

  createUnsignedDeployMessage(
    params: TONContractDeployParams
  ): Promise<TONContractUnsignedDeployMessage>;

  createUnsignedRunMessage(
    params: TONContractRunParams
  ): Promise<TONContractUnsignedRunMessage>;

  createSignedMessage(
    params: TONContractCreateSignedMessageParams
  ): Promise<TONContractMessage>;

  createSignedDeployMessage(
    params: TONContractCreateSignedDeployMessageParams
  ): Promise<TONContractDeployMessage>;

  createSignedRunMessage(
    params: TONContractCreateSignedRunMessageParams
  ): Promise<TONContractRunMessage>;

  decodeRunOutput(
    params: TONContractDecodeRunOutputParams
  ): Promise<TONContractRunResult>;

  decodeInputMessageBody(
    params: TONContractDecodeMessageBodyParams
  ): Promise<TONContractDecodeMessageBodyResult>;

  decodeOutputMessageBody(
    params: TONContractDecodeMessageBodyParams
  ): Promise<TONContractDecodeMessageBodyResult>;

  sendMessage(params: TONContractMessage): Promise<void>;

  processMessage(
    message: TONContractMessage,
    resultFields: string
  ): Promise<QTransaction>;

  processDeployMessage(
    params: TONContractDeployMessage
  ): Promise<TONContractDeployResult>;

  processRunMessage(
    params: TONContractRunMessage
  ): Promise<TONContractRunResult>;
}

interface TONQueriesModule {
  transactions: TONQCollection;
  messages: TONQCollection;
  blocks: TONQCollection;
  accounts: TONQCollection;
}

type DocEvent = (changeType: string, doc: any) => void;

type OrderBy = {
  path: string;
  sort: "ASC" | "DESC";
};

type Subscription = {
  unsubscribe: () => void;
};

interface TONQCollection {
  query(
    filter: any,
    result: string,
    orderBy?: OrderBy[],
    limit?: number
  ): Promise<any>;

  subscribe(filter: any, result: string, onDocEvent: DocEvent): Subscription;

  waitFor(filter: any, result: string): Promise<any>;
}

export interface TONClient {
  crypto: TONCryptoModule;
  contracts: TONContractsModule;
  queries: TONQueriesModule;
}
