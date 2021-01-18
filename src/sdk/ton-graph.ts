import gql from "graphql-tag";
import { defaultNetworks, defaultTonNetwork } from "@/lib/constants";
import { Network, NetworkName } from "@/models/network";
import { TonMsg, TonTx } from "@/models/tx";
import { GqlClient } from "@/sdk/gql-client";

export interface Account {
  acc_type: number;
  last_paid: number;
  last_trans_lt: string;
  balance: string;
  acc_type_name?: "Active" | "Uninit" | string;
}

export interface FullAccount extends Account {
  messages: TonMsg[];
  tx: TonTx[];
}

const getGqlClient = (
  networkName: NetworkName = defaultTonNetwork.name as string
) => {
  const network: Network = defaultNetworks.find(
    n => n.name === networkName
  ) as Network;
  const graphqlURL = network && network.graphqlURL;
  const url = graphqlURL || `https://${networkName}/graphql`;
  console.log({ url });

  const client = new GqlClient();
  try {
    client.init(url);
    return client;
  } catch (error) {
    console.error({ error });
    throw new Error("not a valid network");
  }
};

export const getTxHistory = async (account: string, network?: string) => {
  const txQuery = gql`
    query tx($account: String!) {
      tx: transactions(
        filter: { account_addr: { eq: $account } }
        orderBy: { path: "created_at", direction: DESC }
        limit: 150
      ) {
        id
        tr_type
        account_addr
        total_fees
        block_id
        status
        now
        balance_delta_other {
          currency
          value
        }
        balance_delta
        in_msg
        in_message {
          id
          msg_type
          status
          value
          created_at
          src
          dst
          status_name
          msg_type
          msg_type_name
          body
        }
        out_messages {
          id
          msg_type
          status
          value
          created_at
          src
          dst
          status_name
          msg_type
          msg_type_name
          body
        }
        status_name
        tr_type
        tr_type_name
      }
    }
  `;
  const msgQuery = gql`
    query messages($account: String!) {
      messages(
        filter: { src: { eq: $account } }
        orderBy: { path: "created_at", direction: ASC }
        limit: 150
      ) {
        id
        msg_type
        status
        value
        created_at
        src
        dst
        status_name
        msg_type
        msg_type_name
        body
      }
    }
  `;

  const client = getGqlClient(network);

  const [msgRes, txRes] = await Promise.all([
    client.query<{ messages: TonMsg[] }>({
      query: msgQuery,
      fetchPolicy: "network",
      variables: {
        account
      }
    }),
    client.query<{ tx: TonTx[] }>({
      query: txQuery,
      fetchPolicy: "network",
      variables: {
        account
      }
    })
  ]);

  return {
    messages: msgRes?.messages || [],
    tx: txRes?.tx || []
  };
};

export const getMsg = async (id: string, network?: string) => {
  const query = gql`
    query tx($id: String!) {
      messages(
        filter: { id: { eq: $id } }
        orderBy: { path: "created_at", direction: DESC }
        limit: 1
      ) {
        id
        msg_type
        status
        value
        created_at
        src
        dst
        status_name
        msg_type
        msg_type_name
        body
      }
    }
  `;

  const res = await getGqlClient(network).query<{ messages: TonMsg[] }>({
    query,
    fetchPolicy: "network",
    variables: {
      id
    }
  });

  return (res?.messages || [])[0];
};

export const getAccount = async (account: string, network?: string) => {
  const query = gql`
    query accounts($account: String!) {
      accounts(filter: { id: { eq: $account } }) {
        acc_type
        last_paid
        last_trans_lt
        balance
        acc_type_name
      }
    }
  `;

  const res = await getGqlClient(network).query<{ accounts: Account[] }>({
    query,
    fetchPolicy: "network",
    variables: {
      account
    }
  });

  return (res?.accounts || [])[0];
};

export const getFullAccount = async (
  address: string,
  network?: NetworkName
): Promise<FullAccount> => {
  const [account, history] = await Promise.all([
    getAccount(address, network),
    getTxHistory(address, network)
  ]);
  return {
    ...account,
    ...history
  };
};
