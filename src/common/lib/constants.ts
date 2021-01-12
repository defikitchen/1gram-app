import { ERC20TokenInfo } from "../models/erc20";
import { Network } from "../models/network";
import { tokenList } from "../sdk/ccc";

export const sendTimeout = 40000;
export const forgeTimeout = 40000;
export const etherscanKey = process.env.VUE_APP_ETHERSCAN_KEY || "";
export const infuraId = process.env.VUE_APP_INFURA_ID || "";
export const infuraKey = process.env.VUE_APP_INFURA_KEY || "";
export const alchemyKey = process.env.VUE_APP_ALCHEMY_KEY || "";
export const maxCacheTime = 1000 * 60 * 30;
export const tonWasmUrl =
  "https://cors-anywhere.herokuapp.com/http://one-gram.web.app/tonclient.wasm";
export const tonDefaultPath = "m/44'/396'/0'/0/0";
export const ethDefaultPath = "m/44'/60'/0'/0/0";

export const defaultNetworks: Network[] = [
  {
    id: 396,
    name: "main.ton.dev",
    symbol: "💎",
    blockExplorerURL: "https://ton.live/",
    protocol: "ton",
    decimals: 9,
    etherscanId: tokenList.TON
  },
  {
    id: 396,
    name: "fld.ton.dev",
    symbol: "🍀",
    blockExplorerURL: "https://fld.ton.live/",
    graphqlURL: "https://gql.custler.net/graphql",
    protocol: "ton",
    decimals: 9,
    giverAddress:
      "0:deda155da7c518f57cb664be70b9042ed54a92542769735dfb73d3eef85acdaf"
  },
  {
    id: 396,
    name: "rustnet.ton.dev",
    symbol: "🦀",
    blockExplorerURL: "https://rustnet.ton.live/",
    protocol: "ton",
    decimals: 9
  },
  {
    id: 396,
    name: "net.ton.dev",
    symbol: "🔶",
    blockExplorerURL: "https://net.ton.live/",
    protocol: "ton",
    decimals: 9
    // giverAddress:
    //   "0:deda155da7c518f57cb664be70b9042ed54a92542769735dfb73d3eef85acdaf"
  }
  // {
  //   id: 60,
  //   name: "mainnet",
  //   symbol: "ETH",
  //   blockExplorerURL: "https://etherscan.io/",
  //   protocol: "ethereum",
  //   decimals: 18,
  //   etherscanId: tokenList.ETH
  // },
  // {
  //   id: 60,
  //   name: "ropsten",
  //   symbol: "ETH",
  //   blockExplorerURL: "https://ropsten.etherscan.io/",
  //   protocol: "ethereum",
  //   decimals: 18
  // }
];

export const defaultTonNetwork = defaultNetworks[1];

export const defaultTokenList: { [name: string]: ERC20TokenInfo } = {
  WETH: {
    lastFetched: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    totalSupply: "0",
    usdtRate: "0",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    decimals: 18
  },
  USDT: {
    lastFetched: 0,
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
    symbol: "USDT",
    name: "Tether USD",
    totalSupply: "0",
    usdtRate: "0"
  }
};
