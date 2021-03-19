import fs from 'fs-extra';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { FoliaFactory } from '../typechain/FoliaFactory';
import { FoliaControllerFactory } from '../typechain/FoliaControllerFactory';
import { MetadataFactory } from '../typechain/MetadataFactory';
import { ReserveAuctionFactory } from '../typechain/ReserveAuctionFactory';
import { BigNumber } from '@ethersproject/bignumber';
// import {utils} from 'ethers'

async function start() {
  const args = require('minimist')(process.argv.slice(2));

  if (!args.chainId) {
    throw new Error('--chainId chain ID is required');
  }
  const path = `${process.cwd()}/.env${
    args.chainId === 1 ? '.prod' : args.chainId === 4 ? '.dev' : '.local'
  }`;
  await require('dotenv').config({ path });

  const provider = new JsonRpcProvider(process.env.RPC_ENDPOINT);

  console.log(`${process.env.PRIVATE_KEY}`)
  const walletFomMnemonicAt0 = Wallet.fromMnemonic(`${process.env.PRIVATE_KEY}`);
  const wallet = walletFomMnemonicAt0.connect(provider)

  const walletFomMnemonicAt1 = Wallet.fromMnemonic(`${process.env.PRIVATE_KEY}`, "m/44'/60'/0'/0/1")
  const wallet1 = walletFomMnemonicAt1.connect(provider)

  const sharedAddressPath = `${process.cwd()}/addresses/${args.chainId}.json`;
  // @ts-ignore
  const addressBook = JSON.parse(await fs.readFileSync(sharedAddressPath));
  let folia
  let foliaController
  let metadata
  let reserveAuction

  if (addressBook.Metadata) {
    metadata = await MetadataFactory.connect(addressBook.Metadata, wallet)
    console.log(`Using Metadata deployed at ${addressBook.Metadata}`)
  } else {
    console.log('Deploying Metadata...');
    const metadata = await new MetadataFactory(wallet).deploy();
    console.log('Deploy TX: ', metadata.deployTransaction.hash);
    await metadata.deployed();
    console.log('Metadata deployed at ', metadata.address);
    addressBook.Metadata = metadata.address;  
  }


  if (addressBook.Folia) {
    folia = await FoliaFactory.connect(addressBook.Folia, wallet)
    console.log(`Using Folia deployed at ${addressBook.Folia}`)
  } else {
    console.log('Deploying Folia...');
    folia = await new FoliaFactory(wallet).deploy(
      'Folia', 'FLA', addressBook.Metadata
    );
    console.log(`Deploy TX: ${folia.deployTransaction.hash}`);
    await folia.deployed();
    console.log(`Folia deployed at ${folia.address}`);
    addressBook.Folia = folia.address;


    // Add admin to Folia
    await folia.addAdmin(wallet1.address)
    console.log(`Admin ${wallet1.address} added to Folia`)

  }


  if (addressBook.FoliaController) {
    foliaController = await FoliaControllerFactory.connect(addressBook.FoliaController, wallet)
    console.log(`Using FoliaController deployed at ${addressBook.FoliaController}`)
  } else {

    const balance = await wallet.getBalance()
    console.log(balance, balance.toString())
    
    console.log('Deploying FoliaController...');
    const foliaControllerDeploy = await new FoliaControllerFactory(wallet).deploy(folia.address, wallet1.address);
    console.log(`Deploy TX: ${foliaControllerDeploy.deployTransaction.hash}`);
    await foliaControllerDeploy.deployed();
    console.log(`foliaController deployed at ${foliaControllerDeploy.address}`);
    addressBook.FoliaController = foliaControllerDeploy.address;

   await folia.updateController(foliaControllerDeploy.address)
   console.log('FoliaController updated to ' + foliaControllerDeploy.address)
  }

  if (addressBook.ReserveAuction) {
    reserveAuction = await ReserveAuctionFactory.connect(addressBook.ReserveAuction, wallet)
    console.log(`Using ReserveAuction deployed at ${addressBook.ReserveAuction}`)
  } else {
    console.log('Deploying ReserveAuction...');
    console.log(folia.address)
    try {
      const reserveAuction = await new ReserveAuctionFactory(wallet).deploy(folia.address, {
        // gasLimit: 3000000,
        gasPrice: 10000000000 // 10 Gwei
      });
      console.log(`Deploy TX: ${reserveAuction.deployTransaction.hash}`);
      await reserveAuction.deployed();
      console.log(`reserveAuction deployed at ${reserveAuction.address}`);
      addressBook.ReserveAuction = reserveAuction.address;
    } catch (error) {
      console.log('hmm')
    }
  }

  await fs.writeFile(sharedAddressPath, JSON.stringify(addressBook, null, 2));
  console.log(`Contracts deployed and configured.`);
}

start().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
