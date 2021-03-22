var Scammer = artifacts.require('./Scammer.sol')
var ReserveAuction = artifacts.require('./ReserveAuction.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {

      let scammer = await deployer.deploy(Scammer, {overwrite: false})

      // Deploy ReserveAuction.sol
      await deployer.deploy(ReserveAuction, scammer.address)
      let reserveAuction = await ReserveAuction.deployed()
      console.log(_ + 'ReserveAuction deployed at: ' + reserveAuction.address)


    } catch (error) {
      console.log(error)
    }
  })
}