import { NetworkName } from "@/common/models/network";
import { getAccount, Account } from "../ton-graph";

export const waitFor = async (
  network: NetworkName,
  address: string,
  query: "balance" | "active",
  interval = 2000,
  timeout = 18000
): Promise<false | Account> => {
  const checkQuery = async () => {
    const account = await getAccount(address, network);
    console.log(`[waitFor][${query}] polling`, { account });
    if (query === "balance" && account?.balance) return account;
    else if (query === "active" && account?.acc_type_name === "Active")
      return account;
    else return false;
  };
  return new Promise((res, rej) => {
    let timeoutTimer: any;
    let intervalTimer: any;

    const finish = (account: Account) => {
      clearTimeout(timeoutTimer);
      clearInterval(intervalTimer);
      console.log("[waitFor] done");
      res(account);
    };

    checkQuery().then(account => {
      if (account) finish(account);
    });
    intervalTimer = setInterval(async () => {
      const account = await checkQuery();
      if (account) finish(account);
    }, interval);
    timeoutTimer = setTimeout(() => {
      clearInterval(intervalTimer);
      clearTimeout(timeoutTimer);
      console.warn("[waitFor] error");
      rej("Timed out");
    }, timeout);
  });
};
