var Metadata = artifacts.require("./Metadata.sol");
var Scammer = artifacts.require("./Scammer.sol");
var ScammerController = artifacts.require("./ScammerController.sol");

let _ = "        ";

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    try {
      // Deploy Metadata.sol
      await deployer.deploy(Metadata);
      let metadata = await Metadata.deployed();
      console.log(_ + "Metadata deployed at: " + metadata.address);

      // Deploy Scammer.sol
      await deployer.deploy(Scammer, "Scammer", "FLA", metadata.address);
      let scammer = await Scammer.deployed();
      console.log(_ + "Scammer deployed at: " + scammer.address);

      // Add admin to Scammer
      await scammer.addAdmin(accounts[1]);
      console.log(_ + `Admin ${accounts[1]} added to Scammer`);

      // Deploy ScammerController.sol
      await deployer.deploy(
        ScammerController,
        scammer.address,
        accounts[1],
        accounts[2],
        accounts.slice(3, 5)
      );
      let scammerController = await ScammerController.deployed();
      console.log(
        _ + "ScammerController deployed at: " + scammerController.address
      );

      await scammer.updateController(scammerController.address);
      console.log(
        _ + "ScammerController updated to " + scammerController.address
      );
    } catch (error) {
      console.log(error);
    }
  });
};
