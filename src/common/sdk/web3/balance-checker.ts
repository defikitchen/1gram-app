import { WalletERC20Token } from "@/common/models/wallet";
import { uniq } from "lodash";
import { Ethers, getProvider, Networklike } from "./client";
import { balanceCheckerABI } from "./contracts/balance-checker.solidity";

export const getTokenBalances = async (
  addresses: string | string[],
  tokenAddresses: string | string[],
  network?: Networklike
) => {
  const networkName = (
    (typeof network === "string" ? network : network?.name) || ""
  ).toLowerCase();
  const limit = 50;
  const blacklist = ["0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3"];
  if (typeof addresses === "string") addresses = [addresses];
  if (typeof tokenAddresses === "string") tokenAddresses = [tokenAddresses];
  if (tokenAddresses.length === 0 || addresses.length === 0) return [];
  tokenAddresses = uniq(
    (tokenAddresses as string[])
      .filter(Ethers.utils.isAddress)
      .filter(a => !blacklist.includes(a))
      .map(Ethers.utils.getAddress)
  );

  const copy = [...tokenAddresses];
  tokenAddresses = tokenAddresses.slice(0, limit);

  const contractAdresses = {
    mainnet: "0xb1f8e55c7f64d203c1400b9d8555d050f94adf39",
    ropsten: "0x8D9708f3F514206486D7E988533f770a16d074a7"
  };

  let contractAddress = contractAdresses.mainnet;

  if (networkName === "ropsten") {
    contractAddress = contractAdresses.ropsten;
  } else if (networkName === "mainnet") {
    // silence
  } else {
    return [];
  }

  const contract = new Ethers.Contract(
    contractAddress,
    balanceCheckerABI,
    getProvider(network)
  );

  const balances = (await contract.balances(
    addresses,
    tokenAddresses
  )) as Ethers.BigNumber[];

  let remaining: { address: string; tokens: WalletERC20Token[] }[] = [];

  if (copy.length > limit) {
    remaining = await getTokenBalances(addresses, copy.slice(limit), network);
  }

  const result = addresses.map((address, i) => ({
    address,
    tokens: <WalletERC20Token[]>[
      ...(tokenAddresses as string[]).map((token, j) => ({
        address: token,
        balance: balances[i * tokenAddresses.length + j].toString()
      })),
      ...remaining.filter(t => t.address === address)
    ]
  }));

  return result;
};
