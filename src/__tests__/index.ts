import { getClient } from "@/sdk/ton-js-client";
import { calcWallet } from "@/sdk/ton-js-client/calcWallet";
import { getPrices } from "@/sdk/ton-node-api";
import { expect } from "chai";
import { before } from "mocha";

describe("Prices SDK", () => {
  let client;
  let wallet;

  before(async () => {
    client = await getClient();
    return;
  });

  it("Should fetch the BTC price", async () => {
    const result = await getPrices([1]);
  });

  it("Should generate a wallet", async () => {
    wallet = await calcWallet(client);
    expect(wallet.account.length).gte(66);
    expect(wallet.deployMessage.message.messageId.length).eq(64);
    console.log({ wallet });
  });
});
