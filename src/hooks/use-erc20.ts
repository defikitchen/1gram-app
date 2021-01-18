import { uniq, uniqBy } from "lodash";
import {
  ERC20AccountInfo,
  ERC20TokenInfo,
  ERC20TokenTransferEtherscan
} from "@/models/erc20";
import { erc20TxToTx, EthTx, Tx } from "@/models/tx";
import { Wallet, WalletERC20Token } from "@/models/wallet";
import { Ethers } from "@/sdk/web3";
import { getProvider, getEtherscanHttpClient } from "@/sdk/web3/client";
import { erc20Abi } from "@/sdk/web3/contracts/erc20.solidity";
import { getTokenInfo } from "@/sdk/web3/uniswap";
import { useEthereum } from "@/hooks/use-ethereum";
import { depositAbi } from "@/sdk/web3/contracts/deposit.solidity";
import { getTokenBalances } from "@/sdk/web3/balance-checker";

export const useERC20 = () => {
  const getERC20Contract = (address: string, wallet: Wallet, write = false) => {
    const provider = getProvider(wallet.network.name);

    // if (write) {
    //   // An example Signer
    //   const wal = await getSignerFromWallet(wallet);
    //   if (wal) wal.connect(provider);
    //   else return null;
    //   return new Ethers.Contract(address, abi, wal);
    // } else {
    //   return new Ethers.Contract(address, abi, provider);
    // }
    return new Ethers.Contract(address, erc20Abi, provider);
  };

  const getERC20TokenInfo = async (
    wallet: Wallet,
    tokenAddress: string
  ): Promise<ERC20TokenInfo | null> => {
    try {
      const info = await getTokenInfo(tokenAddress, wallet.network.name);
      if (info?.name) return info;
      else return null;
    } catch {
      return null;
    }
  };

  const getERC20Balances = async (
    { network, address }: Wallet,
    tokenAddresses: string[]
  ): Promise<WalletERC20Token[]> => {
    const networkName =
      typeof network === "string" ? network : network?.name || "mainnet";
    console.log("[tokenBalances]");
    const res = await getTokenBalances(address, tokenAddresses, networkName);
    return res[0]?.tokens as WalletERC20Token[];
  };

  const getERC20Balance = async (
    wallet: Wallet,
    tokenAddress: string
  ): Promise<string> => {
    try {
      const res = await getTokenBalances(
        wallet.address,
        tokenAddress,
        wallet.network.name
      );
      return res[0].tokens[0].balance || "0";
    } catch {
      return "0";
    }
  };

  const ERC20TokenTransfers = (tokenAddress: string, wallet: Wallet) => {
    const transactions = ((wallet && wallet?.erc20Transactions) || []).filter(
      tx => tx.parentAddress && tx.parentAddress === tokenAddress
    );
    const contractInteractions = (
      (wallet && wallet?.transactions) ||
      []
    ).filter(
      tx => tokenAddress && (tx.from === tokenAddress || tx.to === tokenAddress)
    );
    const combined = uniqBy(
      [...transactions, ...contractInteractions],
      "hash"
    ).sort((a, b) => ((a?.timestamp || 0) > (b?.timestamp || 0) ? -1 : 0));
    return combined;
  };

  const getERC20History = async (wallet: Wallet, tokenAddress: string) => {
    if (
      wallet.network.protocol !== "ethereum" &&
      wallet.network.name !== "mainnet"
    )
      return [];

    const res = await getEtherscanHttpClient().get<{
      result: ERC20TokenTransferEtherscan[];
    }>("", {
      params: {
        module: "account",
        action: "tokentx",
        contractaddress: tokenAddress,
        address: wallet.address,
        page: 1,
        offset: 100,
        sort: "asc"
      }
    });
    if (res.status >= 300 || !res?.data?.result?.map) return [];
    const history = res.data.result.map(erc20TxToTx);
    return history;
  };

  const parseERC20Tx = (tx: Tx, wallet: Wallet) => {
    if (!tx.data || tx.data === "0x") return null;
    const contract = getERC20Contract(tx.to, wallet);
    if (!contract) return null;
    try {
      const parsed = contract.interface.parseTransaction({
        data: tx.data,
        value: tx.value
      });
      return { parsed, from: tx.from, to: tx.to } || null;
    } catch {
      return null;
    }
  };

  const parseTokenLikeTx = (tx: Tx, wallet: Wallet) => {
    if (!tx.data || tx.data === "0x") return null;
    const contract = getERC20Contract(tx.to, wallet);
    if (!contract) return null;
    try {
      const parsed = contract.interface.parseTransaction({
        data: tx.data,
        value: tx.value
      });
      return (
        {
          parsed,
          from: parsed.args.from,
          to: parsed.args.to
        } || null
      );
    } catch {
      return null;
    }
  };

  const getSuspectedERC20Adresses = (wallet: Wallet) => {
    if (wallet.network.protocol !== "ethereum") return [];

    const depositables: string[] = wallet.transactions
      .map(tx => {
        try {
          const contract = new Ethers.Contract(
            tx.to,
            depositAbi,
            getProvider(wallet.network.name)
          );
          const data = contract.interface.decodeFunctionData(
            "deposit",
            tx.data
          );
          const owner = data?._owner as string | undefined;
          return owner || null;
        } catch {
          return null;
        }
      })
      .filter(a => !!a) as string[];

    const suspectedTxs = wallet.transactions
      .map(tx => parseERC20Tx(tx, wallet))
      .filter(tx => tx !== null);
    const suspectedTxsLike = wallet.transactions
      .map(tx => parseTokenLikeTx(tx, wallet))
      .filter(tx => tx !== null);

    const addresses = uniq([
      ...suspectedTxs.map(tx => tx?.to),
      ...suspectedTxs.map(tx => tx?.from),
      ...suspectedTxsLike.map(tx => tx?.to),
      ...suspectedTxsLike.map(tx => tx?.from),
      ...depositables
    ]).filter(a => a && a !== wallet.address);
    const uniqified = uniq(addresses) as string[];
    return uniqified;
  };

  const transferERC20Token = async (
    wallet: Wallet,
    token: ERC20AccountInfo,
    value: string,
    to: string
  ) => {
    const { getSignerFromWallet } = useEthereum();
    const signer = await getSignerFromWallet(wallet);
    const contract = new Ethers.Contract(
      token.address,
      erc20Abi,
      signer as Ethers.Wallet
    );
    const amount = Ethers.utils.parseUnits(value, token.decimals);
    const tx: EthTx = await contract.transfer(to, amount);
    return tx;
  };

  return {
    getERC20Contract,
    getERC20Balance,
    getERC20Balances,
    getERC20TokenInfo,
    getERC20History,
    getSuspectedERC20Adresses,
    transferERC20Token,
    ERC20TokenTransfers,
    parseERC20Tx
  };
};
