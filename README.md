# folia-contracts

### add to yr package
```sh
yarn add github.com/folia-app/folia-contracts
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

## Notes

`Folia.sol`, `Metadata.sol`, `ReserveAuction.sol` and `FoliaController.sol` were compiled with v0.5.0 with optimizations off.

`FoliaControllerV2.sol` was compiled with v0.5.0 with optimizations at `2000000`.