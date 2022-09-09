pragma solidity ^0.5.0;
/**
 * The Controller is an upgradeable endpoint for controlling Folia.sol
 */

import "./Lux.sol";
import "./LuxERC20.sol";
import "./Ownable.sol";
import "./SafeMath.sol";
import "./ReentrancyGuard.sol";
import "./IERC721.sol";
import "./IERC165.sol";

contract LuxController is Ownable, ReentrancyGuard {

    using SafeMath for uint256;
    Lux public lux;
    LuxERC20 public luxERC20;

    uint256 public adminSplit = 20;
    address payable public adminWallet;
    address payable public artistWallet;
    bool public paused;

    uint256 constant DAY = 24 * 60 * 60;
    uint256 constant WEEK = 7 * DAY;
    uint256 constant MONTH = 30 * DAY;

    uint256[] public tokenIntervals = [
      DAY, // every 24 hours
      WEEK, // every 7 days
      MONTH, // every 1 month
      2 * MONTH, // every 2 months
      3 * MONTH // every 3 months
    ];

    uint256[] public tokenPriceIntervals = [
      102_000_000_000_000_000_000, // minimum 102 Eth
      73_000_000_000_000_000_000, // minimum 73 Eth
      42_000_000_000_000_000_000, // minimum 42 Eth
      12_000_000_000_000_000_000, // minimum 12 Eth
      2_000_000_000_000_000_000 // minimum 2 Eth
    ];

    bool[] public claimed;

    uint256 contractStart;

    modifier notPaused() {
        require(!paused, "Must not be paused");
        _;
    }

    constructor(
        Lux _lux,
        LuxERC20 _luxERC20,
        address payable _adminWallet
    ) public {
        lux = _lux;
        luxERC20 = _luxERC20;
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
      uint256 diffInHours = diff.mul(10^18).div(60).div(60); // add 18 decimals then convert seconds / 60 = minutes / 60 = hours
      luxERC20.mint(msg.sender, diffInHours);
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
