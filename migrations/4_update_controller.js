var LeftGalleryController = artifacts.require("./LeftGalleryController.sol");
var LeftGallery = artifacts.require("./LeftGallery.sol");

let _ = "        ";

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    try {
      // Deploy LeftGallery.sol
      let leftGallery = await LeftGallery.deployed();
      console.log(_ + "LeftGallery deployed at: " + leftGallery.address);

      // Deploy LeftGalleryController.sol
      await deployer.deploy(
        LeftGalleryController,
        leftGallery.address,
        accounts[1]
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
