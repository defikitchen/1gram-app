import { etherscanKey } from "@/lib/constants";
import { ethers as Ethers, utils } from "ethers";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import axios from "axios";

const alchemyKey = "G5l6nxjTF3p3YtQ4lRRV8_Hg3PFpAyxD";

(window as any).ethers = Ethers; // debugging

type Networklike = string | Ethers.providers.Network | undefined;

const getProvider = (network?: Networklike) => {
  return Ethers.getDefaultProvider(network, {
    alchemy: alchemyKey
  });
};

const getAlchemyProvider = (network?: Networklike) => {
  return new Ethers.providers.AlchemyProvider(network, alchemyKey);
};

const getAlchemyWeb3 = (networkName = "mainnet") =>
  createAlchemyWeb3(
    `https://eth-${networkName}.alchemyapi.io/v2/${alchemyKey}`
  );

const getEtherscanProvider = (network?: Networklike) => {
  return new Ethers.providers.EtherscanProvider(network, etherscanKey);
};

const getEtherscanHttpClient = () => {
  const client = axios.create({
    baseURL: "https://api.etherscan.io/api",
    params: {
      apiKey: etherscanKey
    }
  });
  return client;
};

export {
  Ethers,
  Networklike,
  utils,
  getProvider,
  getEtherscanProvider,
  getAlchemyWeb3,
  getAlchemyProvider,
  getEtherscanHttpClient
};
