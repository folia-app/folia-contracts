var Metadata = artifacts.require('./Metadata.sol')
var Folia = artifacts.require('./Folia.sol')
var FoliaController = artifacts.require('./FoliaController.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {

      // Deploy Metadata.sol
      await deployer.deploy(Metadata)
      let metadata = await Metadata.deployed()
      console.log(_ + 'Metadata deployed at: ' + metadata.address)

      // Deploy Folia.sol
      await deployer.deploy(Folia, 'Folia', 'FLA', metadata.address)
      let folia = await Folia.deployed()
      console.log(_ + 'Folia deployed at: ' + folia.address)

      // Add admin to Folia
      await folia.addAdmin(accounts[1])
      console.log(_ + `Admin ${accounts[1]} added to Folia`)

      // Deploy FoliaController.sol
      await deployer.deploy(FoliaController, folia.address, accounts[1])
      let foliaController = await FoliaController.deployed()
      console.log(_ + 'FoliaController deployed at: ' + foliaController.address)

      await folia.updateController(foliaController.address)
      console.log(_ + 'FoliaController updated to ' + foliaController.address)


    } catch (error) {
      console.log(error)
    }
  })
}