pragma solidity ^0.5.0;
/**
 * The FoliaControllerV2 is an upgradeable endpoint for controlling Folia.sol
 */

import "./LTD.sol";
import "./SafeMath.sol";
import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./IERC721.sol";
import "./IERC165.sol";

contract LTDController is Ownable, ReentrancyGuard {

    using SafeMath for uint256;

    event newContract(address contractAddress, uint256 maxEditions);
    event deletedContract(address contractAddress);
    event editionBought(address contractAddress, uint256 tokenId, uint256 newTokenId);
    uint256 public price = 8 * (10**16); // 0.08 Eth
    uint256 public totalMax = 888;
    mapping(address => uint256) public editionsLeft;

    LTD public lightestToDarkest;

    uint256 public adminSplit = 20;
    address payable public adminWallet;
    address payable public artistWallet;
    bool public paused;

    modifier notPaused() {
        require(!paused, "Must not be paused");
        _;
    }

    constructor(
        LTD _lightestToDarkest,
        address payable _adminWallet
    ) public {
        lightestToDarkest = _lightestToDarkest;
        adminWallet = _adminWallet;
    }

    // can be re-used as an "updateContractEditionSize"
    function addContract(address contractAddress, uint256 maxEditions) public onlyOwner {
      require(IERC165(contractAddress).supportsInterface(0x80ac58cd), "Not an ERC721");
      editionsLeft[contractAddress] = maxEditions;
      emit newContract(contractAddress, maxEditions);
    }
    
    function removeContract(address contractAddress) public onlyOwner {
      delete editionsLeft[contractAddress];
      emit deletedContract(contractAddress);
    }

    function updateArtworkPrice(uint256 _price) public onlyOwner {
      price = _price;
    }

    function updateArtistWallet(address payable _artistWallet) public onlyOwner {
      artistWallet = _artistWallet;
    }

    function updateTotalMax(uint256 _totalMax) public onlyOwner {
      totalMax = _totalMax;
    }

    function buy(address recipient, address contractAddress, uint256 tokenId) public payable notPaused nonReentrant returns(bool) {
        require(editionsLeft[contractAddress] != 0, "Wrong Contract or No Editions Left");
        editionsLeft[contractAddress] -= 1;

        require(msg.value == price, "Wrong price paid");
        require(IERC721(contractAddress).ownerOf(tokenId) == msg.sender, "Can't mint a token you don't own");

        uint256 newTokenId = uint256(keccak256(abi.encodePacked(contractAddress, tokenId)));
        lightestToDarkest.mint(recipient, newTokenId);

        uint256 adminReceives = msg.value.mul(adminSplit).div(100);
        uint256 artistReceives = msg.value.sub(adminReceives);

        (bool success, ) = adminWallet.call.value(adminReceives)("");
        require(success, "admin failed to receive");

        (success, ) = artistWallet.call.value(artistReceives)("");
        require(success, "artist failed to receive");

        emit editionBought(contractAddress, tokenId, newTokenId);
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
