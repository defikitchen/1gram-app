import gql from "graphql-tag";
import { TonMsg, TonTx } from "../models/tx";
import { GqlClient } from "./gql-client";

export interface Account {
  acc_type: number;
  last_paid: number;
  last_trans_lt: string;
  balance: string;
  acc_type_name?: "Active" | "Uninit" | string;
}

const gqlTestClient = new GqlClient();
gqlTestClient.init("https://net.ton.dev/graphql");

const gqlMainClient = new GqlClient();
gqlMainClient.init("https://main.ton.dev/graphql");

const gqlFldClient = new GqlClient();
gqlFldClient.init("https://gql.custler.net/graphql");

const getGqlClient = (network = "fld.ton.dev") => {
  if (network.indexOf("net.ton.dev") > -1) return gqlTestClient;
  else if (network.indexOf("main.ton.dev") > -1) return gqlMainClient;
  else if (network.indexOf("fld.ton.dev") > -1) return gqlFldClient;
  else throw new Error("not a valid network");
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

  const [msgRes, txRes] = await Promise.all([
    getGqlClient(network).query<{ messages: TonMsg[] }>({
      query: msgQuery,
      fetchPolicy: "network",
      variables: {
        account
      }
    }),
    getGqlClient(network).query<{ tx: TonTx[] }>({
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

  const client = getGqlClient(network);

  const res = await getGqlClient(network).query<{ accounts: Account[] }>({
    query,
    fetchPolicy: "network",
    variables: {
      account
    }
  });

  return (res?.accounts || [])[0];
};
