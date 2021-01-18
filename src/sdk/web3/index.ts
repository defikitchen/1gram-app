import { Ethers, utils } from "./client";
import erc20Abi from "./contracts/erc20.json";

const decimals = 18;
type Wallet = Ethers.Wallet;

export { Ethers, utils, decimals, Wallet };
