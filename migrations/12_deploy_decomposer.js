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

      // Deploy CryptoPunks if Rinkeby
      if (deployer.network == 'rinkeby') {
        await deployer.deploy(CryptoPunksMarket)
        let _CryptoPunksMarket = await CryptoPunksMarket.deployed()
        console.log(_ + 'CryptoPunksMarket deployed at: ' + _CryptoPunksMarket.address)

        await _CryptoPunksMarket.setInitialOwners(['0xFa398d672936Dcf428116F687244034961545D91'], [1]);
      } else {
        let addresses = [
          // "0xB77F0b25aF126FCE0ea41e5696F1E5e9102E1D77",
          // "0x123b30E25973FeCd8354dd5f41Cc45A3065eF88C",
          // "0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270",
          // "0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270",
          // "0x842D8B7B08C154ADc36A4f1186A0f401a10518EA",
          // "0xDFAcD840f462C27b0127FC76b63e7925bEd0F9D5",
          // "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
          // "0x8d04a8c79cEB0889Bdd12acdF3Fa9D207eD3Ff63",
          // "0xba30E5F9Bb24caa003E9f2f0497Ad287FDF95623",
          // "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
          // "0xfcB1315C4273954F74Cb16D5b663DBF479EEC62e",
          // "0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a",
          // "0x91Fba69Ce5071Cf9e828999a0F6006A7F7E2a959",
          // "0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B",
          // "0x1A92f7381B9F03921564a437210bB9396471050C",
          // "0xc92cedDfb8dd984A89fb494c376f9A48b999aAFc",
          // "0x1CB1A5e65610AEFF2551A50f76a87a7d3fB649C6",
          // // "0xBACe7E22f06554339911A03B8e0aE28203Da9598",
          // // "0xF7a6E15dfD5cdD9ef12711Bd757a9b6021ABf643",
          // "0x1981CC36b59cffdd24B01CC5d698daa75e367e04",
          // "0x5180db8F5c931aaE63c74266b211F580155ecac8",
          // // "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d", crypto-kitties
          // "0x57a204AA1042f6E66DD7730813f4024114d74f37",
          // "0xc1Caf0C19A8AC28c41Fe59bA6c754e4b9bd54dE9",
          // "0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d",
          // "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e",
          // "0x6CA044FB1cD505c1dB4eF7332e73a236aD6cb71C",
          // "0x4721D66937B16274faC603509E9D61C5372Ff220",
          // "0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270",
          // "0x90cfCE78f5ED32f9490fd265D16c77a8b5320Bd4",
          // "0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270",
          // "0xC2C747E0F7004F9E8817Db2ca4997657a7746928",
          // "0x0c2E57EFddbA8c768147D1fdF9176a0A6EBd5d83",
          // "0x9d413B9434c20C73f509505F7fbC6FC591bbf04A",
          // "0x8943C7bAC1914C9A7ABa750Bf2B6B09Fd21037E0",
          // "0x026224A2940bFE258D0dbE947919B62fE321F042",
          // "0x4b3406a41399c7FD2BA65cbC93697Ad9E7eA61e5",
          // "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
          // "0xF7143Ba42d40EAeB49b88DaC0067e54Af042E963",
          // "0xc3f733ca98E0daD0386979Eb96fb1722A1A05E69",
          // "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
          // "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
          // "0x4f89Cd0CAE1e54D98db6a80150a824a533502EEa",
          // "0x67D9417C9C3c250f61A83C7e8658daC487B56B09",
          // "0x050dc61dFB867E0fE3Cf2948362b6c0F3fAF790b",
          // "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
          // "0x51Ae5e2533854495f6c587865Af64119db8F59b4",
          // "0x29b7315fc83172CFcb45c2Fb415E91A265fb73f2",
          // "0x8CD3cEA52a45f30Ed7c93a63FB2b5C13B453d5A1",
          // "0x3Fe1a4c1481c8351E91B64D5c398b159dE07cbc5",
          // "0xF4ee95274741437636e748DdAc70818B4ED7d043",
          // "0x5CC5B05a8A13E3fBDB0BB9FcCd98D38e50F90c38",
          // "0x11450058d796B02EB53e65374be59cFf65d3FE7f",
          // "0x7f7685b4CC34BD19E2B712D8a89f34D219E76c35",
          // "0xe785E82358879F061BC3dcAC6f0444462D4b5330",
          // "0xB67812ce508b9fC190740871032237C24b6896A0",
          // "0xd0e7Bc3F1EFc5f098534Bce73589835b8273b9a0",
          // "0x6f9d53BA6c16fcBE66695E860e72a92581b58Aed",
        ]
        for (let i = 0; i < addresses.length; i++) {
          let address = addresses[i]
          let ierc165 = await IERC165.at(address)
          let supported = await ierc165.supportsInterface("0x80ac58cd")
          console.log(`address ${address} supported: ${supported}`)
        }
      }

      // Deploy DecomposerMetadata.sol
      // await deployer.deploy(DecomposerMetadata)
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