pragma solidity ^0.5.0;

import "./IERC721.sol";
import "./Ownable.sol";
import "./ReentrancyGuard.sol";

contract BlackHole is Ownable, ReentrancyGuard {

  uint256 TICKET_PRICE = 10_000_000_000_000_000; // 0.01 Eth
  uint256 totalIn;
  address payable lastIn;
  uint256 sinceLast;
  uint256 window = 6 * 60 * 60; // 6 hours in seconds
  mapping(address=>bool) whitelist;


  // add initial NFTs to whitelist
  constructor(address[] memory contracts) public {
    for (uint256 i; i < contracts.length; i++) {
      whitelist[contracts[i]] = true;
    }
  }

  // admin only function to add more contracts to the whitelist
  function addToWhiteList(address _contract) public onlyOwner {
    whitelist[_contract] = true;
  }

  // admin only function to remove contracts from the whitelist
  function removeFromWhitelist(address _contract) public onlyOwner {
    whitelist[_contract] = false;
  }

  // how many NFTs you have in total from the registry
  function votes(address[] memory contracts) public view returns (uint256 tally){
    for (uint256 i; i < contracts.length; i++) {
      require(whitelist[contracts[i]], "Contract not in whitelist");
      tally += IERC721(contracts[i]).balanceOf(msg.sender);
    }
  }

  // buy a ticket if you donate a whitelisted NFT and pay the TICKET_PRICE of 0.01 Eth
  function buyTicket(address _contract, uint256 _tokenId) payable public nonReentrant {
    require(msg.value == TICKET_PRICE, "Must pay ticket price");
    require(whitelist[_contract], "Contract not in whitelist");
    require(IERC721(_contract).ownerOf(_tokenId) == msg.sender, "Must send an NFT you own");
    totalIn += msg.value;
    lastIn = msg.sender;
    sinceLast = now;
    IERC721(_contract).transferFrom(msg.sender, address(this), _tokenId);
    require(IERC721(_contract).ownerOf(_tokenId) == address(this), "NFT transfer failed");
  }

  // claim your win if you were the last person to buy a ticket before the timer expired
  function claimFunds() public nonReentrant {
    require(sinceLast != 0, "Not started");
    require(msg.sender == lastIn, "Not you");
    require(now > sinceLast + window, "Not yet");
    delete(lastIn);
    delete(sinceLast);
    delete(totalIn);
    require(msg.sender.send(address(this).balance), "Failed to send you money"); 
  }


}
