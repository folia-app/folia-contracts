pragma solidity ^0.5.0;
/**
* Metadata contract is upgradeable and returns metadata about Token
*/

import "./MetadataUpdate.sol";

contract LuxMetadata is MetadataUpdate {
    constructor(address _deployer, string memory _base) public {
        deployer = _deployer;
        base = _base;
    }
}
