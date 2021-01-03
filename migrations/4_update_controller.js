var FoliaController = artifacts.require('./FoliaController.sol')
var Folia = artifacts.require('./Folia.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
     // Deploy Folia.sol
      let folia = await Folia.deployed()
      console.log(_ + 'Folia deployed at: ' + folia.address)

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