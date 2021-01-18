export interface Account {
  acc_type: 0 | 1 | 2;
  id: string;
  balance: string;
  last_trans_lt: string;
}

export const getAccount = async (
  client: any,
  address: string,
  wait = false
) => {
  const account = await client.queries.accounts[wait ? "waitFor" : "query"](
    {
      id: {
        eq: address
      }
    },
    "id balance last_trans_lt acc_type"
  );
  return account[0] as Account | undefined;
};
