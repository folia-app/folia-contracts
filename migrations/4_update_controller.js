var FoliaController = artifacts.require('./FoliaController.sol')
var FoliaControllerV2 = artifacts.require('./FoliaControllerV2.sol')
var Folia = artifacts.require('./Folia.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
     // Deploy Folia.sol
      let folia = await Folia.deployed()
      console.log(_ + 'Folia deployed at: ' + folia.address)

      // Deploy FoliaController.sol
      let foliaController = await FoliaController.deployed()
      console.log(_ + 'FoliaController deployed at: ' + foliaController.address)

      // Deploy FoliaControllerV2.sol
      await deployer.deploy(FoliaControllerV2, folia.address, foliaController.address, accounts[1])
      let foliaControllerV2 = await FoliaControllerV2.deployed()
      console.log(_ + 'FoliaControllerV2 deployed at: ' + foliaControllerV2.address)

      await folia.updateController(foliaControllerV2.address)
      console.log(_ + 'FoliaController updated to ' + foliaControllerV2.address)

    } catch (error) {
      console.log(error)
    }
  })
}