var Folia = artifacts.require('./Folia.sol')
var ReserveAuction = artifacts.require('./ReserveAuction.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {

      const foliaSafe = '0x397c2C9c2841bcC396ecAEdBc00cD2CFd07de917'

      let folia = await deployer.deploy(Folia, {overwrite: false})

      // Deploy ReserveAuction.sol
      await deployer.deploy(ReserveAuction, folia.address, foliaSafe)
      let reserveAuction = await ReserveAuction.deployed()
      console.log(_ + 'ReserveAuction deployed at: ' + reserveAuction.address)


    } catch (error) {
      console.log(error)
    }
  })
}