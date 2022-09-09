pragma solidity ^0.5.0;
/**
* Metadata contract is upgradeable and returns metadata about Token
*/

import "./strings.sol";

contract MetadataUpdate {
    using strings for *;

    string public base;
    address public deployer;

    function tokenURI(uint _tokenId) public view returns (string memory _infoUrl) {
        string memory id = uint2str(_tokenId);
        return base.toSlice().concat(id.toSlice()).toSlice().concat(".json".toSlice());
    }
    function updateBase(string memory _base) public {
        require(deployer == msg.sender, "only deployer can update");
        base = _base;
    }
    function uint2str(uint i) internal pure returns (string memory) {
        if (i == 0) return "0";
        uint j = i;
        uint length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
        while (i != 0) {
            uint _uint = 48 + i % 10;
            bstr[k--] = toBytes(_uint)[31];
            i /= 10;
        }
        return string(bstr);
    }
    function toBytes(uint256 x) public pure returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
    }
}

