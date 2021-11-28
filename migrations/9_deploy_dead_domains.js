var DeadDotComSeanceMetadata = artifacts.require('./DeadDotComSeanceMetadata.sol')
var DeadDotComSeance = artifacts.require('./DeadDotComSeance.sol')
var DeadDotComSeanceController = artifacts.require('./DeadDotComSeanceController.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {
  console.log({accounts})
  deployer.then(async () => {
    try {

      // Deploy DeadDotComSeanceMetadata.sol
      await deployer.deploy(DeadDotComSeanceMetadata)
      let deadDotComSeanceMetadata = await DeadDotComSeanceMetadata.deployed()
      console.log(_ + 'DeadDotComSeanceMetadata deployed at: ' + deadDotComSeanceMetadata.address)

      // Deploy DeadDotComSeance.sol
      await deployer.deploy(DeadDotComSeance, deadDotComSeanceMetadata.address)
      let deadDotComSeance = await DeadDotComSeance.deployed()
      console.log(_ + 'DeadDotComSeance deployed at: ' + deadDotComSeance.address)


      // Add admin to DeadDotComSeance
      await deadDotComSeance.addAdmin(accounts[1])
      console.log(_ + `Admin ${accounts[1]} added to DeadDotComSeance`)

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