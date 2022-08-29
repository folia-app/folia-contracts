pragma solidity ^0.5.0;
/**
 * The Controller is an upgradeable endpoint for controlling Folia.sol
 */

import "./Lux.sol";
import "./SafeMath.sol";
import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./IERC721.sol";
import "./IERC165.sol";

contract LuxController is Ownable, ReentrancyGuard {

    using SafeMath for uint256;
    Lux public lux;

    uint256 public adminSplit = 20;
    address payable public adminWallet;
    address payable public artistWallet;
    bool public paused;

    uint256[] public tokenIntervals = [
      24 * 60 * 60, // every 24 hours
      7 * 24 * 60 * 60, // every 7 days
      30.436875 * 24 * 60 * 60, // every 1 month
      2 * 30.436875 * 24 * 60 * 60, // every 2 months
      3 * 30.436875 * 24 * 60 * 60 // every 3 months
    ];

    uint256[] public tokenPriceIntervals = [
      1_000_000_000_000_000_000, // every 24 hours
      1_000_000_000_000_000, // every 7 days
      1_000_000_000_000, // every 1 month
      1_000_000_000, // every 2 months
      1_000_000 // every 3 months
    ];

    bool[] public claimed = [];

    uint256 contractStart;

    modifier notPaused() {
        require(!paused, "Must not be paused");
        _;
    }

    constructor(
        Lux _lux,
        address payable _adminWallet
    ) public {
        lux = _lux;
        adminWallet = _adminWallet;
        contractStart = now;
    }

    function claim(uint256 interval) public payable {
      require(interval < tokenPriceIntervals.length, "no token with that interval");
      uint256 currentTime = now;
      uint256 diff = currentTime.sub(contractStart);
      uint256 modulo = diff.mod(tokenIntervals[interval]);
      if (modulo == 0) {
        modulo = 1;
      }
      uint256 price = modulo.mul(tokenPriceIntervals[interval]);
      require(msg.value >= price, "didn't include enough eth");
      require(claimed[interval] == false, "already claimed");
      claimed[interval] = true;
      lux.mint(msg.sender, interval);
    }

    function updateArtistWallet(address payable _artistWallet) public onlyOwner {
      artistWallet = _artistWallet;
    }

    function updateAdminSplit(uint256 _adminSplit) public onlyOwner {
        require(_adminSplit <= 100, "SPLIT_MUST_BE_LTE_100");
        adminSplit = _adminSplit;
    }

    function updateAdminWallet(address payable _adminWallet) public onlyOwner {
        adminWallet = _adminWallet;
    }

    function updatePaused(bool _paused) public onlyOwner {
        paused = _paused;
    }
}
