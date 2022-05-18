var DecomposerMetadata = artifacts.require('./DecomposerMetadata.sol')
var Decomposer = artifacts.require('./Decomposer.sol')
var DecomposerController = artifacts.require('./DecomposerController.sol')
var CryptoPunksMarket = artifacts.require('./CryptoPunksMarket.sol')
var IERC165 = artifacts.require('./IERC165.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {
  // console.log({deployer, helper, accounts})
  deployer.then(async () => {
    try {


      // Deploy DecomposerMetadata.sol
      let _DecomposerMetadata = await DecomposerMetadata.deployed()
      console.log(_ + 'DecomposerMetadata deployed at: ' + _DecomposerMetadata.address)

      // Deploy Decomposer.sol
      let _Decomposer = await Decomposer.deployed()
      console.log(_ + 'Decomposer deployed at: ' + _Decomposer.address)


      // Deploy DecomposerController.sol
      let _DecomposerController = await DecomposerController.deployed()
      console.log(_ + 'DecomposerController deployed at: ' + _DecomposerController.address)

      let dotcomseance = '0x24fe466a59a9d072a8fc0a4ad3f8396d91a34399'
      let tokens = [
        301
        //, 301, 204, 2
      ]

      // var tx = await _DecomposerController.addContract(dotcomseance, 88, 0)
      // console.log({tx})
      for (let i = 0; i < tokens.length; i++) {
  
        var tx = await _DecomposerController.buy(accounts[0], dotcomseance, tokens[i], {
          value: '80000000000000000'// 0.08 eth
        })
        console.log({tx})
      }


    } catch (error) {
      console.log(error)
    }
  })
}