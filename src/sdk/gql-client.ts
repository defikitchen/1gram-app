import axios, { AxiosInstance } from "axios";
import { DocumentNode } from "graphql";

const hash = (value: any) => {
  let s = "";
  typeof value === "object" ? (s += JSON.stringify(value)) : (s += value);
  return Math.abs(
    s.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  );
};

const getGqlString = (node: DocumentNode) => {
  const body = (node.loc && node.loc.source && node.loc.source.body) || "";
  return body;
};

export type FetchPolicy = "network" | "cache-only" | "network-and-cache";

export class CacheEntry<S = any, V = any> {
  createdAt: Date;
  updateAt: Date;
  id: number;
  history: CacheEntry<V>[] = [];

  constructor(public signature: S, public value: V) {
    this.createdAt = new Date();
    this.updateAt = new Date();
    this.id = hash(signature);
  }
}

export interface GqlQueryOptions {
  query: DocumentNode;
  fetchPolicy?: FetchPolicy;
  variables?: {
    [key: string]: any;
  };
}

export interface GqlMutationOptions {
  mutation: DocumentNode;
  fetchPolicy?: FetchPolicy;
  variables?: {
    [key: string]: any;
  };
}

export class GqlClient {
  client?: AxiosInstance;
  cache: CacheEntry[] = [];
  private readonly fetchPolicy: FetchPolicy = "network-and-cache";
  private readonly cacheExpiration = 1 * 60 * 1000;

  setCacheEntry<S, V>(signature: S, value: V) {
    const entry = new CacheEntry(signature, value);
    const others = this.cache.filter(i => i.id !== entry.id);
    this.cache = [...others, entry];
    return entry;
  }

  getCacheEntry<S, V>(signature: S) {
    const id = hash(signature);
    const entry = this.cache.find(i => i.id === id);
    return entry as undefined | CacheEntry<S, V>;
  }

  init(url: string) {
    this.url = url;
    this.client = axios.create({
      baseURL: this.url
    });
    this.cache = [];
  }

  constructor(public url = "") {
    this.init(url);
  }

  async query<T>({ query, variables, fetchPolicy }: GqlQueryOptions) {
    const q = getGqlString(query);
    const signature = { q, variables };
    const cacheEntry = this.getCacheEntry<typeof signature, T>(signature);
    const policy = fetchPolicy || this.fetchPolicy;

    if (policy === "cache-only") {
      console.log("[gql] from cache");
      return cacheEntry && cacheEntry.value;
    } else if (policy === "network-and-cache" && cacheEntry) {
      const now = new Date().getTime();
      const cachedTime = cacheEntry.updateAt.getTime();
      const expirationTime = cachedTime + this.cacheExpiration;
      if (now < expirationTime) {
        console.log("[gql] from cache and network");
        return cacheEntry.value;
      } else {
        console.log("[gql] cache expired > network");
      }
    }

    console.log("[gql] from network");

    const response = await this.client?.post<{
      data: T;
    }>("", {
      query: q,
      variables
    });

    const data = response?.data?.data;

    this.setCacheEntry({ q, variables }, data);

    return data;
  }

  async mutate<T>({ mutation, variables, fetchPolicy }: GqlMutationOptions) {
    return this.query<T>({
      query: mutation,
      variables,
      fetchPolicy
    });
  }
}
