pragma solidity ^0.5.0;
/**
 * The Controller is an upgradeable endpoint for controlling Folia.sol
 */

import "./Shield.sol";
// import "./EXODUS2.sol";
// import "./X2.sol";

import "./IERC721.sol";

import "./SafeMath.sol";
import "./Ownable.sol";
import "./ReentrancyGuard.sol";

contract ShieldController is Ownable, ReentrancyGuard {

    using SafeMath for uint256;
    Shield public shield;
    IERC721 public exodus2;
    IERC721 public x2;
    bool public paused;
    mapping(uint256=>bool) public redeemed;

    modifier notPaused() {
        require(!paused, "Must not be paused");
        _;
    }

    constructor(
        Shield _shield,
        IERC721 _x2,
        IERC721 _exodus2
    ) public {
        shield = _shield;
        x2 = _x2;
        exodus2 = _exodus2;
    }

    function updatePaused(bool _paused) public onlyOwner {
        paused = _paused;
    }

    function createShield(uint256 tokenId) public notPaused {
        require(!redeemed[tokenId], "Already redeemed");
        require(tokenId <= 18, "Invalid token ID");
        require(x2.ownerOf(tokenId) == msg.sender && exodus2.ownerOf(tokenId) == msg.sender, "Need to own both tokens");
        redeemed[tokenId] = true;
        shield.mint(msg.sender, tokenId);
    }
}
