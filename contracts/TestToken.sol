pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";

contract TestToken is ERC721Full("token", "symbol") {
    function mint(address recepient, uint256 tokenId) external {
        _mint(recepient, tokenId);
    }
}