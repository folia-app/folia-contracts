# folia-contracts

## Deploy for local development

```sh
yarn run ganache
yarn run deploy:localhost <artifacts-dir>
```

## Use the CLI

The CLI offers a simple interface to interact with the smart contract.

### Set up your wallet

The `.env` stores information about the private key to use, and the network endpoints. Different networks have different configurations. To distinguish private keys and endpoints prepend the name of the network to the name of the env variable, like in the following example:

```
LOCALHOST_PRIVATE_KEY=0x...
LOCALHOST_ENDPOINT=http://localhost:8545/
RINKEBY_PRIVATE_KEY=0x...
RINKEBY_ENDPOINT=https://rinkeby.infura.io/v3/<your-infura-key>
MAINNET_PRIVATE_KEY=0x...
MAINNET_ENDPOINT=https://mainnet.infura.io/v3/<your-infura-key>
```

### Prepare the contracts artifacts

To communicate with the contracts, the CLI needs to know the ABI and the address of each smart contract. First compile the contracts with `yarn deploy:localhost artifacts`. This will create the directory `artifacts`.

### Check if everything is ready

Run the following command to check your configuration:

```sh
yarn cli config
```

### Add an artwork

Now you are ready to add an artwork to your local network.

```sh
# Add an artwork
yarn cli\
    add-artwork <artistAddress> <editionNumber> <price> [paused]\
    --gas-price=10\
    --confirmations=1\
    --SEND
```

You need to add the ugly `--SEND` flag to send the actual transaction. This because I'm paranoid and I don't want to send transactions to mainnet by accident.

### Other options

Run `yarn cli -h` to see all options.

### add to yr package
```sh
yarn add https://github.com/folia-app/folia-contracts.git
```
### import and instantiate in your code
```js
import { Folia, FoliaController, Metadata } from 'folia-contracts'

var network = 4 // rinkeby

var foliaControllerContract = new global.web3.eth.Contract(
   Folia.abi,
   Folia.networks[network].address
)

var foliaContract = new global.web3.eth.Contract(
   Folia.abi,
   Folia.networks[network].address
)
```

### send and call methods
```js

// foliaControllerContract

console.log(foliaControllerContract.methods)

// sends
await foliaControllerContract.methods.buy(recipient, workId).send({from, value}) // value is in wei
await foliaControllerContract.methods.addArtwork(artist, editions, price, paused).send({from})
await foliaControllerContract.methods.updateArtworkPaused(workId, paused).send({from})
await foliaControllerContract.methods.updateArtworkEditions(workId, editions).send({from})
await foliaControllerContract.methods.updateArtworkPrice(workId, price).send({from})
await foliaControllerContract.methods.updateArtworkArtist(workId, artist).send({from})
await foliaControllerContract.methods.updateAdminSplit(adminSplit).send({from})
await foliaControllerContract.methods.updateAdminWallet(adminWallet).send({from})
await foliaControllerContract.methods.updatePaused(paused).send({from})
await foliaControllerContract.methods.transferOwnership(newOwner).send({from})

// calls
await foliaControllerContract.methods.works().call()
await foliaControllerContract.methods.latestWorkId().call()
await foliaControllerContract.methods.adminWallet().call()
await foliaControllerContract.methods.paused().call()
await foliaControllerContract.methods.folia().call()
await foliaControllerContract.methods.renounceOwnership().call()
await foliaControllerContract.methods.isOwner().call()
await foliaControllerContract.methods.owner().call()


// foliaContract

console.log(foliaContract.methods)

// folia specific sends
await foliaContract.methods.mint(recepient, tokenId).send({from})
await foliaContract.methods.burn(tokenId).send({from})
await foliaContract.methods.updateMetadata(metadata).send({from})
await foliaContract.methods.updateController(controller).send({from})
await foliaContract.methods.addAdmin(admin).send({from})
await foliaContract.methods.removeAdmin(admin).send({from})
await foliaContract.methods.moveEth(to, amount).send({from})
await foliaContract.methods.moveToken(to, amount, token).send({from})

// 721 specific sends
await foliaContract.methods.transferFrom(from, to, tokenId).send({from})
await foliaContract.methods.safeTransferFrom(from, to, tokenId).send({from})
await foliaContract.methods.safeTransferFrom(from, to, tokenId, data).send({from})
await foliaContract.methods.approve(to, tokenId).send({from})
await foliaContract.methods.setApprovalForAll(operator, approved).send({from})

// folia specific calls
await foliaContract.methods.tokenURI(tokenId).call()
await foliaContract.methods.metadata().call()
await foliaContract.methods.controller().call()

// 721 specific calls
await foliaContract.methods.balanceOf(owner).call()
await foliaContract.methods.ownerOf(tokenId).call()
await foliaContract.methods.getApproved(tokenId).call()
await foliaContract.methods.isApprovedForAll(owner, operator).call()
```


