var Folia = artifacts.require('./Folia.sol')
var FoliaAuction = artifacts.require('./FoliaAuction.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {

      const foliaSafe = '0x397c2C9c2841bcC396ecAEdBc00cD2CFd07de917'
      let folia = await deployer.deploy(Folia, {overwrite: false})

      // Deploy FoliaAuction.sol
      await deployer.deploy(FoliaAuction, folia.address, foliaSafe)
      let foliaAuction = await FoliaAuction.deployed()
      console.log(_ + 'FoliaAuction deployed at: ' + foliaAuction.address)

    } catch (error) {
      console.log(error)
    }
  })
}