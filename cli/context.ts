import { BigNumber, ethers } from "ethers";
import { join } from "path";
import { promises as fs } from "fs";
import {
  LeftGallery__factory,
  LeftGalleryController__factory,
  Metadata__factory,
  LeftGallery,
  LeftGalleryController,
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
  leftGalleryAddress: string;
  leftGalleryControllerAddress: string;
  metadataAddress: string;
  wallet: ethers.Wallet;
  provider: ethers.providers.Provider;
  leftGalleryContract: LeftGallery;
  leftGalleryControllerContract: LeftGalleryController;
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

  const leftGalleryArtifact = await getArtifact("LeftGallery");
  const leftGalleryControllerArtifact = await getArtifact(
    "LeftGalleryController"
  );
  const metadataArtifact = await getArtifact("Metadata");

  const leftGalleryAddress = getAddress(leftGalleryArtifact, chainId);
  const leftGalleryControllerAddress = getAddress(
    leftGalleryControllerArtifact,
    chainId
  );
  const metadataAddress = getAddress(metadataArtifact, chainId);

  const leftGalleryContract = LeftGallery__factory.connect(
    leftGalleryAddress,
    wallet
  );
  const leftGalleryControllerContract = LeftGalleryController__factory.connect(
    leftGalleryControllerAddress,
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
    leftGalleryAddress,
    leftGalleryControllerAddress,
    metadataAddress,
    wallet,
    provider,
    url,
    leftGalleryContract,
    leftGalleryControllerContract,
    metadataContract,
  };
}
