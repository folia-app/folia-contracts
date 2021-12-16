var DotComSeanceController = artifacts.require('./DotComSeanceController.sol')
var DotComSeance = artifacts.require('./DotComSeance.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
     // Deploy DotComSeance.sol
      let dotComSeance = await DotComSeance.deployed()
      console.log(_ + 'DotComSeance deployed at: ' + dotComSeance.address)

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