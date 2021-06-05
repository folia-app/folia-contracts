var EXODUS2 = artifacts.require('./EXODUS2.sol')
var ReserveAuction = artifacts.require('./ReserveAuction.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {

      const foliaSafe = '0x397c2C9c2841bcC396ecAEdBc00cD2CFd07de917'
      let exodus2 = await deployer.deploy(EXODUS2, {overwrite: false})

      // Deploy ReserveAuction.sol
      await deployer.deploy(ReserveAuction, exodus2.address, foliaSafe)
      let reserveAuction = await ReserveAuction.deployed()
      console.log(_ + 'ReserveAuction deployed at: ' + reserveAuction.address)

    } catch (error) {
      console.log(error)
    }
  })
}