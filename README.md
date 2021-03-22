# scammer-contracts

Forked from [Folia.app](github.com/folia-app/folia-contracts)

### add to yr package
```sh
yarn add github.com/scammer-market/scammer-contracts
```
### import and instantiate in your code
```js
import { Scammer, ScammerController, Metadata } from 'scammer-contracts'

var network = 4 // rinkeby

var scammerControllerContract = new global.web3.eth.Contract(
   Scammer.abi,
   Scammer.networks[network].addresss
)

var scammerContract = new global.web3.eth.Contract(
   Scammer.abi,
   Scammer.networks[network].address
)
```

### send and call methods
```js

// scammerControllerContract

console.log(scammerControllerContract.methods)

// sends
await scammerControllerContract.methods.buy(recipient, workId).send({from, value}) // value is in wei
await scammerControllerContract.methods.addArtwork(artist, editions, price, paused).send({from})
await scammerControllerContract.methods.updateArtworkPaused(workId, paused).send({from})
await scammerControllerContract.methods.updateArtworkEditions(workId, editions).send({from})
await scammerControllerContract.methods.updateArtworkPrice(workId, price).send({from})
await scammerControllerContract.methods.updateArtworkArtist(workId, artist).send({from})
await scammerControllerContract.methods.updateAdminSplit(adminSplit).send({from})
await scammerControllerContract.methods.updateAdminWallet(adminWallet).send({from})
await scammerControllerContract.methods.updatePaused(paused).send({from})
await scammerControllerContract.methods.transferOwnership(newOwner).send({from})

// calls
await scammerControllerContract.methods.works().call()
await scammerControllerContract.methods.latestWorkId().call()
await scammerControllerContract.methods.adminWallet().call()
await scammerControllerContract.methods.paused().call()
await scammerControllerContract.methods.scammer().call()
await scammerControllerContract.methods.renounceOwnership().call()
await scammerControllerContract.methods.isOwner().call()
await scammerControllerContract.methods.owner().call()


// scammerContract

console.log(scammerContract.methods)

// scammer specific sends
await scammerContract.methods.mint(recepient, tokenId).send({from})
await scammerContract.methods.burn(tokenId).send({from})
await scammerContract.methods.updateMetadata(metadata).send({from})
await scammerContract.methods.updateController(controller).send({from})
await scammerContract.methods.addAdmin(admin).send({from})
await scammerContract.methods.removeAdmin(admin).send({from})
await scammerContract.methods.moveEth(to, amount).send({from})
await scammerContract.methods.moveToken(to, amount, token).send({from})

// 721 specific sends
await scammerContract.methods.transferFrom(from, to, tokenId).send({from})
await scammerContract.methods.safeTransferFrom(from, to, tokenId).send({from})
await scammerContract.methods.safeTransferFrom(from, to, tokenId, data).send({from})
await scammerContract.methods.approve(to, tokenId).send({from})
await scammerContract.methods.setApprovalForAll(operator, approved).send({from})

// scammer specific calls
await scammerContract.methods.tokenURI(tokenId).call()
await scammerContract.methods.metadata().call()
await scammerContract.methods.controller().call()

// 721 specific calls
await scammerContract.methods.balanceOf(owner).call()
await scammerContract.methods.ownerOf(tokenId).call()
await scammerContract.methods.getApproved(tokenId).call()
await scammerContract.methods.isApprovedForAll(owner, operator).call()
```


