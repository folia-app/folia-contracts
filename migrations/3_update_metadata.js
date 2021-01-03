var Metadata = artifacts.require('./Metadata.sol')
var Folia = artifacts.require('./Folia.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
      // Deploy Metadata.sol
      await deployer.deploy(Metadata, {replace: true})
      let metadata = await Metadata.deployed()
      console.log(_ + 'Metadata deployed at: ' + metadata.address)

     // Deploy Folia.sol
      // await deployer.deploy(Folia, 'Folia Name', 'Folia Symbol', metadata.address)
      let token = await Folia.deployed()
      console.log(_ + 'Folia deployed at: ' + token.address)

      await token.updateMetadata(metadata.address)
      console.log(_ + 'Folia metadta updated to ' + metadata.address)

    } catch (error) {
      console.log(error)
    }
  })
}