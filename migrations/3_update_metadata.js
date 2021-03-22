var Metadata = artifacts.require('./Metadata.sol')
var Scammer = artifacts.require('./Scammer.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
      // Deploy Metadata.sol
      await deployer.deploy(Metadata, {replace: true})
      let metadata = await Metadata.deployed()
      console.log(_ + 'Metadata deployed at: ' + metadata.address)

      // Deploy Scammer.sol
      // await deployer.deploy(Scammer, 'Scammer Name', 'Scammer Symbol', metadata.address)
      let scammer = await Scammer.deployed()
      console.log(_ + 'Scammer deployed at: ' + scammer.address)

      await scammer.updateMetadata(metadata.address)
      console.log(_ + 'Scammer metadta updated to ' + metadata.address)

    } catch (error) {
      console.log(error)
    }
  })
}