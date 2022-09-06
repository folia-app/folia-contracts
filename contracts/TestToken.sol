pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract TestToken is ERC721Full("token", "symbol") {
    function mint(address recipient, uint256 tokenId) external {
        _mint(recipient, tokenId);
    }
}