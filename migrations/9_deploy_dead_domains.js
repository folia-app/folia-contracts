var DotComSeanceMetadata = artifacts.require('./DotComSeanceMetadata.sol')
var DotComSeance = artifacts.require('./DotComSeance.sol')
var DotComSeanceController = artifacts.require('./DotComSeanceController.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {
  console.log({accounts})
  deployer.then(async () => {
    try {

      // Deploy DotComSeanceMetadata.sol
      // await deployer.deploy(DotComSeanceMetadata)
      let dotComSeanceMetadata = await DotComSeanceMetadata.deployed()
      console.log(_ + 'DotComSeanceMetadata deployed at: ' + dotComSeanceMetadata.address)

      // Deploy DotComSeance.sol
      await deployer.deploy(DotComSeance, dotComSeanceMetadata.address, {
        nonce: 305
      })
      let dotComSeance = await DotComSeance.deployed()
      console.log(_ + 'DotComSeance deployed at: ' + dotComSeance.address)


      // Add admin to DotComSeance
      await dotComSeance.addAdmin(accounts[1])
      console.log(_ + `Admin ${accounts[1]} added to DotComSeance`)

      // Deploy DotComSeanceController.sol
      await deployer.deploy(DotComSeanceController, dotComSeance.address, accounts[1])
      let dotComSeanceController = await DotComSeanceController.deployed()
      console.log(_ + 'DotComSeanceController deployed at: ' + dotComSeanceController.address)

      await dotComSeance.updateController(dotComSeanceController.address)
      console.log(_ + 'DotComSeanceController updated to ' + dotComSeanceController.address)


    } catch (error) {
      console.log(error)
    }
  })
}