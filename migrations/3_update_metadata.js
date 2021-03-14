var Metadata = artifacts.require("./Metadata.sol");
var LeftGallery = artifacts.require("./LeftGallery.sol");

let _ = "        ";

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    try {
      // Deploy Metadata.sol
      await deployer.deploy(Metadata, { replace: true });
      let metadata = await Metadata.deployed();
      console.log(_ + "Metadata deployed at: " + metadata.address);

      // Deploy LeftGallery.sol
      // await deployer.deploy(LeftGallery, 'LeftGallery Name', 'LeftGallery Symbol', metadata.address)
      let leftGallery = await LeftGallery.deployed();
      console.log(_ + "LeftGallery deployed at: " + leftGallery.address);

      await leftGallery.updateMetadata(metadata.address);
      console.log(_ + "LeftGallery metadata updated to " + metadata.address);
    } catch (error) {
      console.log(error);
    }
  });
};
