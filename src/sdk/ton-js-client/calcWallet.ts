import { walletPkg } from "./contracts/wallet.pkg";
import { KeyPair } from "./types/key-pair";

export const calcWallet = async (client: any) => {
  const keyPair: KeyPair = await client.crypto.ed25519Keypair();
  const deployMessage = await client.contracts.createDeployMessage({
    package: walletPkg,
    constructorParams: {},
    keyPair
  });
  const account: string = deployMessage.address;

  const futureInitContractAddress1 = (
    await client.contracts.getDeployData({
      abi: walletPkg.abi,
      imageBase64: walletPkg.imageBase64,
      publicKeyHex: keyPair.public,
      workchainId: 0
    })
  ).address;

  console.log({ futureInitContractAddress1 });

  return { account, keyPair: keyPair as KeyPair, deployMessage };
};
