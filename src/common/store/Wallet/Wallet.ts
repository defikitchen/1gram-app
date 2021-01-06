import randomstring from "randomstring";
import { defineGetters, defineMutations } from "direct-vuex";
import { defineModule, defineActions } from "direct-vuex";
import { Network } from "@/common/models/network";
import store, { notify } from "@/common/store";
import { moduleActionContext } from "@/common/store";
import router from "@/router";
import { dialog } from "@/main";
import { setCache, getCache, fromCache } from "@/common/lib/cache";
import { getMnemonic } from "@/common/lib/bip44";
import { handleError } from "@/common/lib/error-handling";
import { encrypt, decrypt } from "@/common/lib/crypto";

import {
  getClient,
  ImportedWallet,
  importWallet,
  KeyPair,
  newWallet,
  send
} from "@/common/sdk";
import { getAccount, getTxHistory } from "@/common/sdk";
import BigNumber from "bignumber.js";
import {
  ethTxToTx,
  PendingTx,
  TonMsg,
  tonTxToTx,
  Tx
} from "@/common/models/tx";
import { Wallet } from "@/common/models/wallet";
import { useEthereum } from "@/common/hooks/use-ethereum";
import {
  defaultNetworks,
  defaultTonNetwork,
  tonDefaultPath
} from "@/common/lib/constants";
import { gift, NewWallet } from "@/common/sdk/ton-node-api";
import { derivePublicKey } from "@/common/sdk/ton-js-client/importWallet";
import { useERC20 } from "@/common/hooks/use-erc20";
import { usePrices } from "@/common/hooks/use-prices";
import { getProvider } from "@/common/sdk/web3/client";
import { uniqBy } from "lodash";
import { usePin } from "@/common/hooks/use-pin";
import { deployWallet } from "@/common/sdk/ton-js-client/newWallet";
import { grant } from "@/common/sdk/ton-js-client/grant";
import { pause } from "@/common/lib/helpers";

export const getNextName = (word: string, names: string[]) => {
  const regEx = new RegExp(`\\b${word} \\b(\\d+)$`);
  const num = names
    .filter(name => regEx.test(name))
    .map(name => {
      const match = name.match(regEx);
      const i: string = (match as RegExpMatchArray)[1];
      return +i;
    });

  const max = num.length > 0 ? Math.max(...num) : 0;
  const name = `${word} ${max + 1}`;
  return name;
};

export interface MasterKey {
  id: string;
  /**
   * 12 word string
   */
  mnemonic: string;
  name: string;
}

export interface WalletState {
  keystore: MasterKey[];
  wallets: Wallet[];
  /**
   * id of `Wallet`
   */
  wallet: string | null;
  key: MasterKey | null;
  // transactions: Transaction[];
  pendingTransaction: PendingTx | null;
  transaction: null | Tx;
  networks: Network[];
  network: Network | null;
  updating: boolean;
  updatingAll: boolean;
  forging: boolean;
  sending: boolean;
  forgingString: string;
}

export interface CreateWalletOptions {
  imported?: boolean;
  name?: string;
  mnemonic?: string;
  path?: string;
  privateKey?: string;
  workchain?: 0 | -1;
  address?: string;
}

export const syncCache = (state: WalletState) => {
  setCache("keystore", state.keystore);
  setCache("wallets", state.wallets);
  setCache("wallet", state.wallet);
  setCache("key", state.key);
  setCache("networks", state.networks);
  setCache("network", state.network);
  setCache("pendingTransaction", state.pendingTransaction);
};

const defaultNet = getCache<Network>("network", defaultTonNetwork);

const state: WalletState = {
  keystore: getCache<MasterKey[]>("keystore", []),
  wallet: getCache<null | string>("wallet", null),
  wallets: getCache<Wallet[]>("wallets", []),
  key: getCache<null | MasterKey>("key", null),
  pendingTransaction: getCache<null | PendingTx>("pendingTransaction", null),
  transaction: null,
  updating: false,
  updatingAll: false,
  forging: false,
  sending: false,
  networks: uniqBy(
    [...defaultNetworks, ...getCache<Network[]>("networks", defaultNetworks)],
    "name"
  ),
  network: defaultNetworks.find(n => n.name === defaultNet.name) || defaultNet,
  forgingString: ""
};

const getters = defineGetters<WalletState>()({
  wallet: state => state.wallets.find(w => w.address === state.wallet) || null,
  usedAddresses: state => {
    const transactions = state.wallets
      .filter(w => w.transactions && w.transactions.length > 0)
      .map(w => w.transactions)
      .flat() as Tx[];
    const mapped = transactions.filter(t => t.value);
    return [...new Set(mapped)];
  }
});

const mutations = defineMutations<WalletState>()({
  addNetwork: (state, network: Network) => {
    state.networks = [...state.networks, network];
    state.network = network;
    syncCache(state);
  },
  removeNetwork: (state, network: Network) => {
    state.networks = state.networks.filter(n => n.id !== network.id);
    if (state.network && state.network.id === network.id) {
      state.network = state.networks[0] || null;
    }
    syncCache(state);
  },
  setNetwork: (state, network: Network | null) => {
    state.network = network;
    syncCache(state);
  },
  setUpdating: (state, value: boolean) => (state.updating = value),
  setUpdatingAll: (state, value: boolean) => (state.updatingAll = value),
  setForging: (state, value: boolean) => (state.forging = value),
  setSending: (state, value: boolean) => (state.sending = value),
  setTransaction: (state, value: Tx | null) => (state.transaction = value),
  removeWallet: (state, wallet: Wallet) => {
    state.wallets = state.wallets.filter(w => w.address !== wallet.address);
    if (state.wallet && state.wallet === wallet.address) {
      state.wallet = null;
    }
    syncCache(state);
  },
  patchWallet(state, payload: { address: string; update: Partial<Wallet> }) {
    const { address, update } = payload;
    const wallets = state.wallets.map(wallet => {
      if (wallet.address === address) {
        return {
          ...wallet,
          ...update
        };
      } else return wallet;
    });
    state.wallets = [...wallets];
    syncCache(state);
  },
  setWallet: (state, wallet: Wallet | null = null) => {
    state.pendingTransaction = null;
    if (!wallet) {
      state.wallet = null;
    } else {
      const lastUsed = new Date().getTime();
      const updatedWallet = {
        ...wallet,
        lastUsed
      };
      state.wallet = updatedWallet.address;
      const found = state.wallets.find(w => w.address === wallet.address);
      if (found) {
        found.lastUsed = lastUsed;
        found.balance = wallet.balance;
      }
    }
    syncCache(state);
  },
  setKey: (state, key: MasterKey | null = null) => {
    state.key = key;
    syncCache(state);
  },
  setWallets: (state, wallets: Wallet[]) => {
    state.wallets = wallets;
    syncCache(state);
  },
  setPendingTx: (state, transaction: PendingTx | null = null) => {
    state.pendingTransaction = transaction;
    syncCache(state);
  },
  addWallet: (state, wallet: Wallet) => {
    if (state.wallets.find(w => w.address === wallet.address)) return;
    state.wallets = [...state.wallets, wallet];
    if (!state.wallet) state.wallet = wallet.address;
    syncCache(state);
  },
  addKey: (state, key: MasterKey) => {
    if (
      state.keystore.find(k => k.id === key.id || k.mnemonic === key.mnemonic)
    )
      return;
    state.keystore = [...state.keystore, key];
    syncCache(state);
  },
  setForgingString: (state, val: string) => (state.forgingString = val)
});

const actions = defineActions({
  async getKey(ctx) {
    const { rootState, rootDispatch } = moduleCtx(ctx);
    let pin = rootState.Common.Login.pin;
    if (!pin)
      pin = await rootDispatch.Common.Login.promptPin({
        persistent: false
      });
    const keyData: MasterKey = {
      mnemonic: encrypt(
        getMnemonic("english", 12),
        rootState.Common.Login.pin as string
      ),
      id: randomstring.generate(32),
      name: getNextName(
        "Key",
        state.keystore.map(k => k.name)
      )
    };
    return keyData;
  },

  async addViewWallet(
    ctx,
    settings: { address: string; network: Network; name?: string }
  ) {
    const { state, commit, dispatch } = moduleCtx(ctx);
    if (state.forging) throw new Error("Busy forging wallet");
    commit.setForging(true);
    commit.setForgingString("Preparing");
    const name =
      settings?.name ||
      getNextName(
        "View Wallet",
        state.wallets.map(w => w?.name)
      );
    const wallet: Wallet = {
      address: settings.address,
      network: settings.network,
      name,
      transactions: [],
      backedUp: true,
      balance: 0,
      erc20Tokens: [],
      imported: true,
      keyPair: "",
      lastUsed: new Date().getTime(),
      messages: [],
      receipts: []
    };
    console.log(wallet);
    commit.addWallet(wallet);
    commit.setWallet(wallet);
    commit.setForging(false);
    commit.setForgingString("Updating wallet");
    await dispatch.updateWallet({ address: wallet.address, force: true });

    // force backup on first non-imported wallet
    // const forceBackup =
    //   !wallet.imported && state.wallets.filter(w => !w.imported).length === 1;
    commit.setForgingString("");
    router.push("/wallet");
    return wallet;
  },
  async forgeWallet(ctx, settings: CreateWalletOptions) {
    const { getBalance, createWallet } = useEthereum();
    const importEthWallet = useEthereum().importWallet;
    const { updatePrices } = usePrices();
    const { rootState, state, commit, rootDispatch, dispatch } = moduleCtx(ctx);
    const { network } = state as WalletState;
    const pin =
      rootState.Common.Login.pin ||
      (await rootDispatch.Common.Login.promptPin({ persistent: false }));
    if (state.forging) throw new Error("Busy forging wallet");
    commit.setForging(true);
    commit.setForgingString("Preparing");
    const path = settings.path || `m/44'/${state.network?.id}'/0'/0/0`;

    if (!state.network) throw new Error("No network selected");
    let wallet: Wallet;
    let mnemonic = "";
    let balance = 0;
    let keyPair!: KeyPair;
    let address = "";
    let deployed = false;

    if (network?.protocol === "ton") {
      commit.setForgingString("Connecting to " + state.network.name);
      const client = await getClient(state.network.name as any);
      if (settings.privateKey?.length) {
        commit.setForgingString("Parsing keys");
        keyPair = {
          secret: settings.privateKey as string,
          public:
            (await derivePublicKey(settings.privateKey as string).catch(
              console.warn
            )) || ""
        };
      }
      commit.setForgingString(
        `${settings.imported ? "Importing" : "Creating"} TON Wallet`
      );
      const walletRes: ImportedWallet | NewWallet = settings.imported
        ? await importWallet(
            client,
            settings.workchain ?? 0,
            keyPair || undefined,
            keyPair ? undefined : settings.mnemonic,
            keyPair ? undefined : path
          )
        : await newWallet(client, settings.workchain ?? 0);
      deployed =
        "deployed" in (walletRes as ImportedWallet | NewWallet)
          ? (walletRes as NewWallet).deployed
          : false;
      balance =
        "deployed" in (walletRes as ImportedWallet | NewWallet)
          ? (walletRes as NewWallet).balance
          : 0;
      mnemonic = walletRes.mnemonic || settings.mnemonic || "";
      keyPair = walletRes.keyPair;
      address = walletRes.account;
    } else if (network?.protocol === "ethereum") {
      const client = getProvider(network.name);
      commit.setForgingString("Adding Ethereun Wallet");
      const response = settings.privateKey
        ? await importEthWallet(client, settings.privateKey)
        : await createWallet(client, settings.mnemonic);
      keyPair = {
        public: response.publicKey,
        secret: response.privateKey
      };
      address = response.address;
      mnemonic = response.phrase;
    }

    wallet = {
      path,
      balance,
      imported: settings.imported || false,
      keyPair: encrypt(JSON.stringify(keyPair), pin),
      mnemonic: mnemonic ? encrypt(mnemonic, pin) : "",
      lastUsed: new Date().getTime(),
      backedUp: false,
      receipts: [],
      name:
        settings.name ||
        getNextName(
          settings.imported ? "Imported Wallet" : "Wallet",
          state.wallets.map(w => w.name)
        ),
      network: network as Network,
      transactions: [],
      messages: [],
      address,
      erc20Tokens: []
    };

    if (deployed) {
      wallet.needsDeployment = false;
    }

    if (network?.protocol === "ethereum") {
      commit.setForgingString("Fetching balance");
      wallet.balance = +(await getBalance(wallet));
    }

    const exists = state.wallets.find(w => w.address === address);

    if (exists) {
      wallet = {
        ...exists,
        balance
      };

      notify({
        text: "Wallet already exists",
        type: "info",
        duration: 3000
      });
    }
    commit.addWallet(wallet);
    commit.setWallet(wallet);
    commit.setForging(false);

    commit.setForgingString("Updating wallet");
    dispatch.updateWallet({ address, force: true });

    // force backup on first non-imported wallet
    // const forceBackup =
    //   !wallet.imported && state.wallets.filter(w => !w.imported).length === 1;
    commit.setForgingString("");
    store.original.dispatch("Common/startLoading", {
      command: "startLoadingOverlay",
      value: "Loading…"
    });

    router
      .push("/wallet")
      .catch(() => store.commit.Common.stopLoading())
      .finally(() => {
        console.log(wallet);
        if (wallet.network.name === "fld.ton.dev") {
          (async () => {
            try {
              commit.setForging(true);
              await dispatch.grantTONWallet({ wallet });
              await pause(100);
              await dispatch.deployTONWallet({ wallet });
            } catch (e) {
              commit.setForging(false);
              console.log("could not initialize", e);
            }
          })();
        }
      });
    return wallet;
  },
  /**
   * @takes `state.pendingTransaction: Transaction` from store and sends it
   * @returns Promise<void>
   */
  async send(ctx) {
    const { commit, getters, rootState, rootDispatch, dispatch } = moduleCtx(
      ctx
    );
    const { sendTx } = useEthereum();
    const transaction: PendingTx = {
      ...(state.pendingTransaction as PendingTx)
    };
    const wallet = getters.wallet as Wallet;
    const network = wallet.network as Network;
    if (state.sending) throw new Error("Already sending");
    if (!transaction || !transaction.amount) throw new Error("Amount requird");
    try {
      commit.setSending(true);
      if (!wallet || !transaction) return;

      let id = "";

      if (network.protocol === "ton") {
        let pin = rootState.Common.Login.pin;
        if (!pin)
          pin = await rootDispatch.Common.Login.promptPin({
            persistent: false
          });
        const keypair: KeyPair = JSON.parse(decrypt(wallet.keyPair, pin));

        const client = await getClient(network.name as any);

        id = await send(
          client,
          wallet.address,
          transaction.to,
          keypair,
          transaction.amount
        );
        dispatch.updateWallet({
          address: wallet.address,
          force: true
        });
      }

      if (network.protocol === "ethereum") {
        const res = await sendTx(
          wallet,
          transaction.amount.toString(),
          transaction.to
        );
        if (!res) return;
        id = res?.hash || "";
        const tx: Tx = {
          ...ethTxToTx(res),
          timestamp: Math.round(new Date().getTime() / 1000),
          from: transaction.from,
          to: transaction.to,
          value: transaction.amount.toString(),
          totalFees: transaction.estimatedFees?.toString() || "0"
        };
        const receipts = [tx, ...(wallet.receipts || [])];
        commit.patchWallet({
          address: wallet.address,
          update: {
            receipts
          }
        });
        res
          .wait(8)
          .then(() => dispatch.updateWallet({ address: wallet.address }));
      }

      return id;
    } catch (error) {
      handleError(error, `Couldn't send ${wallet.network.symbol}`);
    } finally {
      commit.setSending(false);
    }
  },
  /**
    * @updates `state.wallet: Wallet` and `state.wallets: Wallet[]` with latest `AccountInfo` from the server
    * @remarks
    *  * If currently updating it doesn't run, but we're polling for updates every x minutes. So the wallets will be up-to-date anyhow.
    *  * If a change is found it notifies the user of the changes ammount, new old balance
      @returns `Promise<Wallet[]>`
    */
  async updateWallets(ctx, force?: boolean) {
    const { commit, dispatch, state } = moduleCtx(ctx);
    console.log("[updateWallets]");
    commit.setUpdatingAll(true);
    const promises = state.wallets.map(w =>
      dispatch.updateWallet({ address: w.address, force })
    );
    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn("Couldn't update all wallets", error);
    } finally {
      commit.setUpdatingAll(false);
    }
  },

  async updateWallet(
    ctx,
    { address, force }: { address: string; force?: boolean }
  ): Promise<void> {
    const { state, dispatch, commit } = moduleCtx(ctx);
    console.log("[updateWallet]");
    const wallet = state.wallets.find(w => w.address === address) as Wallet;
    if (!force && fromCache(wallet.lastSynced))
      return console.log("[wallet] fromCache");
    commit.setUpdating(true);

    commit.patchWallet({
      address,
      update: {
        lastSynced: new Date().getTime()
      }
    });

    const txPromise = dispatch.updateTx(address);
    const infoPromise = dispatch.updateBalance(address);

    try {
      const [txs, balance] = await Promise.all([txPromise, infoPromise]);
    } catch (e) {
      console.warn(`Couldn't update balance ${wallet.name}`, e);
    }

    dispatch.updateERC20TokenTransfersByWallet(wallet);
    commit.setUpdating(false);
  },

  async updateERC20TokenTransfersByWallet(ctx, wallet: Wallet) {
    const { getERC20History } = useERC20();
    const { tokenByAddress } = usePrices();
    const { commit } = moduleCtx(ctx);

    (wallet.erc20Tokens || []).forEach(token => {
      getERC20History(wallet, token.address).then(txs => {
        const thisWallet = state.wallets.find(
          w => w.address === wallet.address
        );
        if (!thisWallet) return;
        const erc20Transactions = uniqBy(
          [...txs, ...(thisWallet.erc20Transactions || [])],
          "hash"
        );
        const symbol = tokenByAddress(token.address)?.symbol;
        if (symbol) console.log("[erc20TxHistory]", symbol, txs);
        commit.patchWallet({
          address: thisWallet.address,
          update: {
            erc20Transactions
          }
        });
      });
    });
  },

  async grantTONWallet(
    ctx,
    { wallet, retries = 5 }: { wallet: Wallet; retries?: number }
  ): Promise<void> {
    const { dispatch, commit } = moduleCtx(ctx);
    if (retries < 1) {
      commit.setForging(false);
      commit.setForgingString("");
      return handleError(
        {},
        "Granting timed out. Problem connecting to the network. Try again later",
        7000
      );
    }
    if (wallet.network.protocol !== "ton")
      return handleError({}, "not a TON wallet");
    if (wallet.network.name === "main.ton.dev") {
      return handleError({}, "Not available for TON MainNet");
    }

    commit.setForging(true);
    commit.setForgingString("Connecting to " + wallet.network.name);
    const client = await getClient(wallet.network.name);

    try {
      commit.setForgingString("Fetching address");
      const balance = await dispatch.updateBalance(wallet.address);
      if (balance) {
        handleError(balance, "You already have funds", 7000);
        return commit.setForging(false);
      }
      commit.setForgingString("Granting 100k" + wallet.network.symbol);
      await grant(client, wallet.address, true);
      notify({
        text: "Successfuly received 100k" + wallet.network.symbol
      });
      commit.setForgingString("Updating wallet");
      dispatch.updateWallet({ address: wallet.address, force: true });
    } catch (e) {
      console.log("[retryGrant]", retries - 1, retries);
      await dispatch.grantTONWallet({ wallet, retries: retries - 1 });
    }
    commit.setForgingString("");
    commit.setForging(false);
  },

  async deployTONWallet(
    ctx,
    { wallet, retries = 5 }: { wallet: Wallet; retries?: number }
  ): Promise<void> {
    const { dispatch, commit } = moduleCtx(ctx);
    let copy = { ...wallet };
    if (retries < 1) {
      commit.setForging(false);
      commit.setForgingString("");
      return handleError(
        {},
        "Wallet deployment timed out. Problem connecting to the network. Try again later",
        7000
      );
    }

    if (copy.network.protocol !== "ton") return handleError("not a TON wallet");

    const client = await getClient(copy.network.name);
    console.log(copy.network.name, client, client._name);
    const pin = await usePin().getPin();
    if (!pin) return;
    const pair: KeyPair = JSON.parse(decrypt(copy.keyPair, pin));
    commit.setForging(true);

    try {
      const balance = await dispatch.updateBalance(copy.address);
      if (!balance) {
        handleError(balance, "Your balance is too low to deploy", 7000);
        return commit.setForging(false);
      }
      await deployWallet(client, pair, +copy.address.split(":")[0] as -1 | 0);
      notify({
        text: "Successfuly deployed"
      });
      dispatch.updateWallet({ address: copy.address, force: true });
    } catch (e) {
      console.log("[retryDeploy]", retries - 1, retries);
      await dispatch.deployTONWallet({ wallet: copy, retries: retries - 1 });
    }
    commit.setForging(false);
  },

  async updateERC20TokenTransfers(ctx) {
    const { dispatch, state } = moduleCtx(ctx);
    (state.wallets || []).forEach(dispatch.updateERC20TokenTransfersByWallet);
  },

  async updateBalance(ctx, address: string | null): Promise<number> {
    const { getBalance } = useEthereum();
    const { getSuspectedERC20Adresses, getERC20Balances } = useERC20();
    const { commit, state, dispatch } = moduleCtx(ctx);
    address = address || state.wallet || "";
    let balance = 0;
    const wallet = state.wallets.find(w => w.address === address) as Wallet;
    let needsDeployment = wallet.needsDeployment;
    if (!wallet) throw new Error("Wallet doesn't exist");

    if (wallet.network.protocol === "ton") {
      const info = await getAccount(wallet.address, wallet.network.name);
      balance = new BigNumber((info && info?.balance) || 0).toNumber();
      needsDeployment = !info || info?.acc_type_name === "Uninit";
    }
    if (wallet.network.protocol === "ethereum") {
      balance = new BigNumber(await getBalance(wallet)).toNumber();
      const erc20TokenAdresses = getSuspectedERC20Adresses(wallet);
      const erc20Tokens = await getERC20Balances(wallet, erc20TokenAdresses);
      commit.patchWallet({
        address,
        update: {
          erc20Tokens
        }
      });
    }

    commit.patchWallet({
      address,
      update: {
        balance,
        needsDeployment
      }
    });
    return balance;
  },
  async updateTx(ctx, address: string | null): Promise<Tx[]> {
    const { commit, state } = moduleCtx(ctx);
    const { getHistory } = useEthereum();

    address = address || state.wallet || "";
    let messages: TonMsg[] = [];
    let transactions: Tx[] = [];
    const wallet = state.wallets.find(w => w.address === address) as Wallet;
    if (!wallet) throw new Error("Wallet doesn't exist");

    if (wallet.network.protocol === "ton") {
      const txResponse = await getTxHistory(
        address as string,
        wallet.network.name
      );
      transactions = txResponse.tx.map(tonTxToTx);
      messages = txResponse.messages;
    }
    if (wallet.network.protocol === "ethereum") {
      const txResponse = await getHistory(wallet);
      transactions = txResponse.map(ethTxToTx);
    }

    const receipts = (wallet.receipts || []).filter(
      receipt => !transactions.map(t => t.hash).includes(receipt.hash)
    );

    commit.patchWallet({
      address,
      update: {
        transactions,
        messages,
        receipts
      }
    });
    return transactions;
  },
  async removeWallet(ctx, wallet: Wallet) {
    const { commit, dispatch } = moduleCtx(ctx);
    const confirmed = await dialog.confirm({
      title: `Remove ${wallet.name}`,
      text: `Are you sure you want to remove ${wallet.name}? Make sure that you have backed it up. Otherwise you might lose your funds. This action cannot be undone.`
    });
    if (!confirmed) return;
    const result = await dialog.prompt({
      title: `Type REMOVE to remove ${wallet.name}`,
      actions: {
        false: "Cancel",
        true: "Confirm"
      }
    });
    if (result === false) return;
    else if (result === "REMOVE") {
      commit.removeWallet(wallet);
      const lastUsed = (state.wallets || []).sort((a, b) =>
        a.lastUsed > b.lastUsed ? -1 : 0
      )[0];
      commit.setWallet(lastUsed);
      router.push("/portfolio").catch();
    } else dispatch.removeWallet(wallet);
  }
});

const mod = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
});

export default mod;

const moduleCtx = (context: any) => moduleActionContext(context, mod);
