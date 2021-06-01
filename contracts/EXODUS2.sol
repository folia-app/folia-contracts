pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "./helpers/strings.sol";

contract EXODUS2 is ERC721Full("EXODUS 2", "EX2") {
    using strings for *;
    string[] public poems;
    constructor() public {
        for (uint256 i = 1; i < 20; i++) {
            _mint(msg.sender, i);
        }
    }

    function addPoem(string memory newWord) public {
        require(poems.length < 19, "poems populated");
        poems.push(newWord);
    }

    function tokenURI(uint _tokenId) external view returns (string memory _infoUrl) {
        string memory base = "https://exodus_ii.folia.app/v1/metadata/";
        string memory id = uint2str(_tokenId);
        return base.toSlice().concat(id.toSlice());
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