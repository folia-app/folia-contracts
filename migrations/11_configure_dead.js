var DotComSeanceController = artifacts.require('./DotComSeanceController.sol')
var DotComSeance = artifacts.require('./DotComSeance.sol')
var web3utils = require('web3-utils')
let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
     // Deploy DotComSeance.sol
      let dotComSeance = await DotComSeance.deployed()
      console.log(_ + 'DotComSeance deployed at: ' + dotComSeance.address)

      // Deploy DotComSeanceController.sol
      let dotComSeanceController = await DotComSeanceController.deployed()
      console.log(_ + 'DotComSeanceController deployed at: ' + dotComSeanceController.address)

      // await dotComSeanceController.updatePaused(true)
      var simon = "0x3f93dfd9a05027b26997ebced1762fee0e1058c0"


      // guille piecs are work id 0 (edition/tokenID 1-21)
      // the gans are all workId + editionID (where work id corresponds to the guille pieces)
      
      //       work id 0 = guille editions (1-21)
      var workEditionMatrix = [
        0,  // work id 1  petsdotcom.eth editions (n/a)
        15, // work id 2  alladvantage.eth editions (201-215)
        20, // work id 3  bidland.eth editions (301-320)
        20, // work id 4  bizbuyer.eth editions (401-420)
        21, // work id 5  capacityweb.eth editions (501-521)
        26, // work id 6  cashwars.eth editions (601-626)
        22, // work id 7  ecircles.eth editions (701-722)
        28, // work id 8  efanshop.eth editions (801-828)
        16, // work id 9  ehobbies.eth editions (901-916)
        19, // work id 10 elaw.eth editions (1001-1019)
        29, // work id 11 exchangepath.eth editions (1101-1129)
        15, // work id 12 financialprinter.eth editions (1201-1215)
        29, // work id 13 funbug.eth editions (1301-1329)
        32, // work id 14 heavenlydoor.eth editions (1401-1432)
        40, // work id 15 iharvest.eth editions (1501-1540)
        17, // work id 16 mrswap.eth editions (1601-1617)
        25, // work id 17 netmorf.eth editions (1701-1725)
        22, // work id 18 popularpower.eth editions (1801-1822)
        24, // work id 19 stickynetworks.eth editions (1901-1924)
        16, // work id 20 thirdvoice.eth editions (2001-2016)
        54, // work id 21 wingspanbank.eth editions (2101-2154)
      ]

      var numberOfDotComs = workEditionMatrix.length
      var dotComPrice = web3utils.toWei("1", 'ether')
      var ganPrice = web3utils.toWei("0.1", 'ether')
      var tx
      console.log(`Add artwork 0`)
      tx = await dotComSeanceController.addArtwork(simon, numberOfDotComs, dotComPrice.toString(), false, 1) // work id 0
      console.log({tx})
    

      for (var i = 0; i < numberOfDotComs; i++) {
        console.log(`Add artwork ${i + 1}`)
        tx = await dotComSeanceController.addArtwork(simon, workEditionMatrix[i], ganPrice.toString(), false, 0) // work ids 1-21
        console.log({tx})
      }
      console.log('buy first piece')
      tx = await dotComSeanceController.buyByID(accounts[1], 0, 1, {value: web3utils.toWei("1", 'ether')})
      console.log({tx})

      console.log('update pause')
      tx = await dotComSeanceController.updatePaused(true)
      console.log({tx})

    } catch (error) {
      console.log(error)
    }
  })
}