pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestToken is ERC721("token", "symbol") {
    function mint(address recepient, uint256 tokenId) external {
        _mint(recepient, tokenId);
    }
}