var DeadDotComSeanceController = artifacts.require('./DeadDotComSeanceController.sol')
var DeadDotComSeance = artifacts.require('./DeadDotComSeance.sol')
var web3utils = require('web3-utils')
let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
     // Deploy DeadDotComSeance.sol
      let deadDotComSeance = await DeadDotComSeance.deployed()
      console.log(_ + 'DeadDotComSeance deployed at: ' + deadDotComSeance.address)

      // Deploy DeadDotComSeanceController.sol
      let deadDotComSeanceController = await DeadDotComSeanceController.deployed()
      console.log(_ + 'DeadDotComSeanceController deployed at: ' + deadDotComSeanceController.address)

      await deadDotComSeanceController.updatePaused(true)
      var simon = "0x3f93dfd9a05027b26997ebced1762fee0e1058c0"
        // dot comes are work id 0 (edition 1-10)
      // each gan corresponds to the edition of work id 0
      // work id 0 = dotcoms
      // work id 1 = dotcom 1
      // work id 2 = dotcom 2
      var editionMatrix = [
        0, // 0 pets.com
        15, // 1 alladvantage.com
        20, // 2 bidland.com
        20, // 3 bizbuyer.com
        22, // 4 capacityweb.com
        26, // 5 cashwars.com
        22, // 6 ecircles.com
        28, // 7 efanshop.com
        16, // 8 ehobbies.com
        19, // 9 elaw.com
        29, // 10 exchangepath.com
        15, // 11 financialprinter.com
        29, // 12 funbug.com
        32, // 13 heavenlydoor.com
        40, // 14 iharvest.com
        17, // 15 misterswap.com
        25, // 16 netmorf.com
        22, // 17 popularpower.com
        24, // 18 stickynetworks.com 
        16, // 19 thirdvoice.com
        54, // 20 wingspanbank.com
      ]
      var numberOfDotComs = editionMatrix.length
      var dotComPrice = web3utils.toWei("1", 'ether')
      var ganPrice = web3utils.toWei("0.1", 'ether')

      await deadDotComSeanceController.addArtwork(simon, numberOfDotComs, dotComPrice.toString(), false, 1)

    

      for (var i = 0; i < numberOfDotComs; i++) {
        await deadDotComSeanceController.addArtwork(simon, editionMatrix[i], ganPrice.toString(), false, 0)
      }

      await deadDotComSeanceController.updatePaused(false)
      await deadDotComSeanceController.buyByID(accounts[0], 0, 1, {value: web3utils.toWei("1", 'ether')})
      await deadDotComSeanceController.updatePaused(true)


    } catch (error) {
      console.log(error)
    }
  })
}