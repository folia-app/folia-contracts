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
      var numberOfDotComs = 10
      var dotComPrice = web3utils.toWei("1", 'ether')
      var ganPrice = web3utils.toWei("0.1", 'ether')

      await deadDotComSeanceController.addArtwork(simon, numberOfDotComs, dotComPrice.toString(), false, 1)

      var editionMatrix = [
        12, // 1
        12, // 2
        12, // 3
        12, // 4
        12, // 5
        12, // 6
        12, // 7
        12, // 8
        12, // 9
        12  // 10
      ]

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