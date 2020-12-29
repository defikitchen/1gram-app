import { KeyPair } from "..";
import { walletPkg } from "./contracts/wallet.pkg";
import BigNumber from "bignumber.js";

export interface Fees {
  account: {
    acc_type: number;
    balance_other: string;
    boc: string;
    code: string;
    code_hash: string;
    data: string;
    data_hash: string;
    id: string;
    number;
  };
  fees: {
    inMsgFwdFee: string;
    storageFee: string;
    gasFee: string;
    outMsgsFwdFee: string;
    totalAccountFees: string;
    totalOutput: string;
  };
}

export const calcFees = async (
  client: any,
  from: string,
  to: string,
  value: number,
  keyPair: KeyPair
) => {
  const fees: Fees = await client.contracts.calcRunFees({
    address: from,
    functionName: "sendTransaction",
    abi: walletPkg.abi,
    input: {
      dest: to,
      value,
      bounce: false
    },
    keyPair
  });
  const totalFees = new BigNumber(fees.fees.totalAccountFees).toNumber();
  return { fees, totalFees };
};
