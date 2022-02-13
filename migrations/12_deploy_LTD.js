var LTDMetadata = artifacts.require('./LTDMetadata.sol')
var LTD = artifacts.require('./LTD.sol')
var LTDController = artifacts.require('./LTDController.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {
  console.log({accounts})
  deployer.then(async () => {
    try {

      // Deploy LTDMetadata.sol
      await deployer.deploy(LTDMetadata)
      let _LTDMetadata = await LTDMetadata.deployed()
      console.log(_ + 'LTDMetadata deployed at: ' + _LTDMetadata.address)

      // Deploy LTD.sol
      await deployer.deploy(LTD, _LTDMetadata.address)
      let _LTD = await LTD.deployed()
      console.log(_ + 'LTD deployed at: ' + _LTD.address)


      // Add admin to LTD
      await _LTD.addAdmin(accounts[1])
      console.log(_ + `Admin ${accounts[1]} added to LTD`)

      // Deploy LTDController.sol
      await deployer.deploy(LTDController, _LTD.address, accounts[1])
      let _LTDController = await LTDController.deployed()
      console.log(_ + 'LTDController deployed at: ' + _LTDController.address)

      await _LTD.updateController(_LTDController.address)
      console.log(_ + 'LTDController updated to ' + _LTDController.address)


    } catch (error) {
      console.log(error)
    }
  })
}