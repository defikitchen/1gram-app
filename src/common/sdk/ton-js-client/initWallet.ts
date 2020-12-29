export const initWallet = async (client: any, deployMessage: any) => {
  const messageProcessingState = await client.contracts.sendMessage(
    deployMessage.message
  );
  const msg = await client.contracts.waitForDeployTransaction(
    deployMessage,
    messageProcessingState
  );

  let id = "";
  let balance = "";

  try {
    const result = await client.queries.accounts.waitFor(
      {
        id: { eq: deployMessage.address },
        balance: { gt: "0" }
      },
      "id balance"
    );
    balance = result.balance;
    id = result.id;
  } catch (e) {
    console.warn(e);
  }
  const balanceInt = parseInt(balance, 16);
  return { result: msg, id: id as string, balance: balanceInt };
};
