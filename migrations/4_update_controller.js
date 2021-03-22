var ScammerController = artifacts.require('./ScammerController.sol')
var Scammer = artifacts.require('./Scammer.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
     // Deploy Scammer.sol
      let scammer = await Scammer.deployed()
      console.log(_ + 'Scammer deployed at: ' + scammer.address)

      // Deploy ScammerController.sol
      await deployer.deploy(ScammerController, scammer.address, accounts[1])
      let scammerController = await ScammerController.deployed()
      console.log(_ + 'ScammerController deployed at: ' + scammerController.address)

      await scammer.updateController(foliaController.address)
      console.log(_ + 'ScammerController updated to ' + scammerController.address)

    } catch (error) {
      console.log(error)
    }
  })
}