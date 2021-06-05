var EXODUS2 = artifacts.require('./EXODUS2.sol')
var ReserveAuction = artifacts.require('./ReserveAuction.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {

      const foliaSafe = '0x397c2C9c2841bcC396ecAEdBc00cD2CFd07de917'
      let exodus2 = await deployer.deploy(EXODUS2, {overwrite: false})
      let reserveAuction = await deployer.deploy(ReserveAuction, {overwrite: false})

      let nftAddress = await reserveAuction.nftAddress()
      if (nftAddress.toLowerCase() !== exodus2.address.toLowerCase()) {
        await reserveAuction.updateNftAddress(exodus2.address)
        console.log(`Updated NFT Address in reserveAuction to exodus (${exodus2.address})`)
      }

      let bidStartTimes = [
        1622939066, //0
        1622948696, //1
        1622958327, //2
        1622977588, //3
        1623016110, //4
        1623093155, //5
        1623247245, //6
        1623555425, //7
        1624171784, //8
        1625404503, //9
        1627869941, //10
        1632800816, //11
        1642662566, //12
        1662386066, //13
        1701833066, //14
        1780727066, //15
        1938515066, //16
        2254091066, //17
        2885243066 //18
      ]

      let totalSupply = await exodus2.totalSupply()
      if (totalSupply.toString() !== bidStartTimes.length.toString()) {
        console.error(`totalSupply (${totalSupply}) is not ${bidStartTimes.length}`)
        return
      }

      for (var i = 0; i < bidStartTimes.length; i++) {
        let tokenId = i+1
        let owner = await exodus2.ownerOf(tokenId)
        if (owner.toLowerCase() !== accounts[0].toLowerCase()) {
          console.log(`SKIPPING: owner (${owner}) is not accounts[0] (${accounts[0]})`)
          continue
        }
        let approved = await exodus2.getApproved(tokenId)
        if (approved.toLowerCase() !== reserveAuction.address) {
          await exodus2.approve(reserveAuction.address, tokenId)
          console.log(`approved ${tokenId} to be transferred by reserveAuction (${reserveAuction.address})`)
        }

        let bidStartTime = bidStartTimes[i]

        await reserveAuction.createAuction(
          false, //bool paused,
          tokenId, //uint256 tokenId,
          24 * 60 * 60, //uint256 duration,
          bidStartTime, //uint256 firstBidTime,
          0, // uint256 reservePrice,
          15, //uint256 adminSplit, // percentage
          accounts[1] // address payable proceedsRecipient TODO: change this before mainnet
        )
        console.log(`made auction ${i} for tokenID ${tokenId} with bidStartTime ${bidStartTime}`)

      }

    } catch (error) {
      console.log(error)
    }
  })
}
