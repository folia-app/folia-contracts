var DeadDotComSeanceController = artifacts.require('./DeadDotComSeanceController.sol')
var DeadDotComSeance = artifacts.require('./DeadDotComSeance.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
     // Deploy DeadDotComSeance.sol
      let deadDotComSeance = await DeadDotComSeance.deployed()
      console.log(_ + 'DeadDotComSeance deployed at: ' + deadDotComSeance.address)

      // Deploy DeadDotComSeanceController.sol
      await deployer.deploy(DeadDotComSeanceController, deadDotComSeance.address, accounts[1])
      let deadDotComSeanceController = await DeadDotComSeanceController.deployed()
      console.log(_ + 'DeadDotComSeanceController deployed at: ' + deadDotComSeanceController.address)

      await deadDotComSeance.updateController(deadDotComSeanceController.address)
      console.log(_ + 'DeadDotComSeanceController updated to ' + deadDotComSeanceController.address)

    } catch (error) {
      console.log(error)
    }
  })
}