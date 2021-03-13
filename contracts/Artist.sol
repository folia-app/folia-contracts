pragma solidity ^0.5.0;

import "./Folia.sol";

contract Artist is Ownable {
    mapping(uint256 => bool) public works;
    address public artist;
    Folia folia;
    constructor(address _folia, address _artist, uint256[] _works) {
      folia = _folia;
      artist = _artist;
      for (uint i = 0; i < _works.length; i++) {
        works[_works[i]] = true;
      }
    }

    modifier onlyArtist() {
      require(msg.sender == artist, "Not Artist");
      _;
    }

    function mint(uint256 tokenId) public onlyArtist {
      require(!works[tokenId], "Artist can't mint that work");
      folia.mint(tokenId);
    }
}