var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, helper, accounts) {
  deployer.deploy(Migrations);
};
