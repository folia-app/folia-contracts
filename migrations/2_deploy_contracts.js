var Metadata = artifacts.require("./Metadata.sol");
var LeftGallery = artifacts.require("./LeftGallery.sol");
var LeftGalleryController = artifacts.require("./LeftGalleryController.sol");

let _ = "        ";

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    try {
      // Deploy Metadata.sol
      await deployer.deploy(Metadata);
      let metadata = await Metadata.deployed();
      console.log(_ + "Metadata deployed at: " + metadata.address);

      // Deploy LeftGallery.sol
      await deployer.deploy(LeftGallery, "LeftGallery", "LG", metadata.address);
      let leftGallery = await LeftGallery.deployed();
      console.log(_ + "LeftGallery deployed at: " + leftGallery.address);

      // Add admin to LeftGallery
      //await leftGallery.addAdmin(accounts[0]);
      //console.log(_ + `Admin ${accounts[0]} added to LeftGallery`);

      // Add admin to LeftGallery
      await leftGallery.addAdmin("0xD66A411Ecb8058aEaDDEA689745459ECfaaDa80d");
      console.log(
        _ +
          `Admin 0xD66A411Ecb8058aEaDDEA689745459ECfaaDa80d added to LeftGallery`
      );

      // Deploy LeftGalleryController.sol
      await deployer.deploy(
        LeftGalleryController,
        leftGallery.address,
        accounts[0]
      );
      let leftGalleryController = await LeftGalleryController.deployed();
      console.log(
        _ +
          "LeftGalleryController deployed at: " +
          leftGalleryController.address
      );

      await leftGallery.updateController(leftGalleryController.address);
      console.log(
        _ + "LeftGalleryController updated to " + leftGalleryController.address
      );
    } catch (error) {
      console.log(error);
    }
  });
};
