import { BigNumber, ethers } from "ethers";
import { join } from "path";
import { promises as fs } from "fs";
import {
  Folia__factory,
  FoliaController__factory,
  Metadata__factory,
  Folia,
  FoliaController,
  Metadata,
} from "./contracts";
import { CLIError } from "./exceptions";

export interface IContext {
  send: boolean;
  gasPrice: BigNumber;
  gasLimit: number;
  confirmations: number;
  url: (addressOrTx: string) => string;
  //gasLimitMargin: number;
  network: string;
  endpoint: string;
  privateKey: string;
  foliaAddress: string;
  foliaControllerAddress: string;
  metadataAddress: string;
  wallet: ethers.Wallet;
  provider: ethers.providers.Provider;
  foliaContract: Folia;
  foliaControllerContract: FoliaController;
  metadataContract: Metadata;
}

export interface IArtifact {
  contractName: string;
  abi: ethers.ContractInterface;
  networks: {
    [id: string]: {
      address: string;
      transactionHash: string;
    };
  };
}

const PUBLIC_NETWORKS = ["mainnet", "kovan", "rinkeby", "ropsten", "goerli"];

export async function load(
  network: string,
  artifacts: string,
  send: boolean,
  gasPrice: BigNumber,
  gasLimit: number,
  confirmations: number
): Promise<IContext> {
  function get(key: string) {
    const fullkey = `${network.toUpperCase()}_${key}`;
    const value = process.env[fullkey];
    if (value === undefined) {
      throw new CLIError(`Please define "${fullkey}" in your .env file.`);
    }
    return value;
  }

  async function getArtifact(key: string) {
    const filename = join(artifacts, key + ".json");
    try {
      return <IArtifact>JSON.parse(await fs.readFile(filename, "utf-8"));
    } catch (e) {
      throw e;
    }
  }

  function getAddress(artifact: IArtifact, chainId: number) {
    const obj = artifact.networks[chainId.toString()];
    if (!obj) {
      throw new CLIError(
        `Cannot find address for ${artifact.contractName}, did you deploy it to ${network}?`
      );
    }
    return obj.address;
  }

  function url(addressOrTx: string) {
    if (PUBLIC_NETWORKS.includes(network)) {
      const type = addressOrTx.length === 42 ? "address" : "tx";
      return `https://${network}.etherscan.io/${type}/${addressOrTx}`;
    }
    return "";
  }

  const privateKey = get("PRIVATE_KEY");
  const endpoint = get("ENDPOINT");

  const provider = new ethers.providers.JsonRpcProvider(endpoint);
  const wallet = new ethers.Wallet(privateKey, provider);
  const { chainId } = await provider.getNetwork();

  const foliaArtifact = await getArtifact("Folia");
  const foliaControllerArtifact = await getArtifact("FoliaController");
  const metadataArtifact = await getArtifact("Metadata");

  const foliaAddress = getAddress(foliaArtifact, chainId);
  const foliaControllerAddress = getAddress(foliaControllerArtifact, chainId);
  const metadataAddress = getAddress(metadataArtifact, chainId);

  const foliaContract = Folia__factory.connect(foliaAddress, wallet);
  const foliaControllerContract = FoliaController__factory.connect(
    foliaControllerAddress,
    wallet
  );
  const metadataContract = Metadata__factory.connect(metadataAddress, wallet);

  return {
    send,
    network,
    endpoint,
    privateKey,
    gasLimit,
    gasPrice,
    confirmations,
    foliaAddress,
    foliaControllerAddress,
    metadataAddress,
    wallet,
    provider,
    url,
    foliaContract,
    foliaControllerContract,
    metadataContract,
  };
}
