var ShadowMetadata = artifacts.require('./ShadowMetadata.sol')
var Shadow = artifacts.require('./Shadow.sol')
var SimpleShadowController = artifacts.require('./SimpleShadowController.sol')

let _ = '        '

testing = true

module.exports = (deployer, helper, accounts) => {
  // console.log({deployer, helper, accounts})
  deployer.then(async () => {
    try {

      tombcouncil = testing ? accounts[0] : '0xcC1775Ea6D7F62b4DCA8FAF075F864d3e15Dd0F0'

      // Deploy ShadowMetadata.sol
      await deployer.deploy(ShadowMetadata, tombcouncil, "")
      let shadowMetadata = await ShadowMetadata.deployed()
      console.log(_ + 'ShadowMetadata deployed at: ' + shadowMetadata.address)

      // Deploy Shadow.sol
      await deployer.deploy(Shadow, tombcouncil, shadowMetadata.address)
      let shadow = await Shadow.deployed()
      console.log(_ + 'Shadow deployed at: ' + shadow.address + ` by ${accounts[0]}`)

      // Deploy SimpleShadowController.sol
      await deployer.deploy(SimpleShadowController)
      let simpleShadowController = await SimpleShadowController.deployed()
      console.log(_ + 'SimpleShadowController deployed at: ' + simpleShadowController.address)

      await shadow.updateController(simpleShadowController.address)
      console.log(_ + 'ShadowController updated to ' + simpleShadowController.address)

      if (testing) {

        tx = await shadow.init();
        console.log(_ + `Minted all Shadow tokens`)

        totalSupply = await shadow.totalSupply()
        if (totalSupply == 36) {
          console.log(_+ `Shadow has ${totalSupply} tokens`)
        } else {
          console.error(_ + `Shadow should have 36 tokens but has ${totalSupply} instead`)
        }

        tokenURI = await shadow.tokenURI(1);
        console.log(_ + `tokenURI = ${tokenURI}`)

        tx = await shadowMetadata.updateBase('foo')
        console.log(_ + `updated tokenURI base to "foo"`)

        tokenURI = await shadow.tokenURI(1);
        console.log(_ + `tokenURI = ${tokenURI}`)

        firstOwner = await shadow.ownerOf(1)
        console.log(_ + `owner of first shadow is ${firstOwner}`)

        tx = await shadow.transferFrom(accounts[0], accounts[1], 1);
        console.log(_ + `first token transferred between ${accounts[0]} and ${accounts[1]}`)

        newOwner = await shadow.ownerOf(1)
        console.log(_ + `new owner of token 1 is ${newOwner}`)

        tx = await simpleShadowController.updatePaused(true)
        console.log(_ + `simpleShadowController updated to paused`)

        locked = await simpleShadowController.isLocked(accounts[1], accounts[0], 1)
        console.log(_ + `simpleShadowController locked is currently ${locked}`)

        tx = await shadow.transferFrom(accounts[1], accounts[0], 1);
        newNewOwner = await shadow.ownerOf(1)

        if (newNewOwner != newOwner) {
          console.error(_ + `token should have failed on transfer and not be owned by ${newNewOwner}`)
        } else {
          console.log(_ + `transfer failed because lock is true`)
        }

        // Deploy SimpleShadowController.sol again
        await deployer.deploy(SimpleShadowController)
        simpleShadowController = await SimpleShadowController.deployed()
        console.log(_ + 'SimpleShadowController deployed again at: ' + simpleShadowController.address)

        await shadow.updateController(simpleShadowController.address)
        console.log(_ + 'ShadowController updated to ' + simpleShadowController.address)

        tx = await shadow.transferFrom(accounts[1], accounts[0], 1, {from:accounts[1]});
        console.log(_ + `first token succeeded to transfer back because controller was updated`)
      }

    } catch (error) {
      console.log({error})
    }
  })
}