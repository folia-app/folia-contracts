var DecomposerMetadata = artifacts.require('./DecomposerMetadata.sol')
var Decomposer = artifacts.require('./Decomposer.sol')
var DecomposerController = artifacts.require('./DecomposerController.sol')
var CryptoPunksMarket = artifacts.require('./CryptoPunksMarket.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {
  // console.log({deployer, helper, accounts})
  deployer.then(async () => {
    try {

      // Deploy CryptoPunks if Rinkeby
      if (deployer.network == 'rinkeby') {
        await deployer.deploy(CryptoPunksMarket)
        let _CryptoPunksMarket = await CryptoPunksMarket.deployed()
        console.log(_ + 'CryptoPunksMarket deployed at: ' + _CryptoPunksMarket.address)

        await _CryptoPunksMarket.setInitialOwners(['0xFa398d672936Dcf428116F687244034961545D91'], [1]);
      }

      // Deploy DecomposerMetadata.sol
      await deployer.deploy(DecomposerMetadata)
      let _DecomposerMetadata = await DecomposerMetadata.deployed()
      console.log(_ + 'DecomposerMetadata deployed at: ' + _DecomposerMetadata.address)

      // Deploy Decomposer.sol
      await deployer.deploy(Decomposer, _DecomposerMetadata.address)
      let _Decomposer = await Decomposer.deployed()
      console.log(_ + 'Decomposer deployed at: ' + _Decomposer.address)


      // Add admin to Decomposer
      await _Decomposer.addAdmin(accounts[1])
      console.log(_ + `Admin ${accounts[1]} added to Decomposer`)

      // Deploy DecomposerController.sol
      await deployer.deploy(DecomposerController, _Decomposer.address, accounts[1])
      let _DecomposerController = await DecomposerController.deployed()
      console.log(_ + 'DecomposerController deployed at: ' + _DecomposerController.address)

      await _Decomposer.updateController(_DecomposerController.address)
      console.log(_ + 'DecomposerController updated to ' + _DecomposerController.address)


    } catch (error) {
      console.log(error)
    }
  })
}