pragma solidity ^0.5.0;

/**
 * The FoliaController is an upgradeable endpoint for controlling Folia.sol
 */

import "./Folia.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract FoliaController is Ownable {

    event newWork(uint256 workId, address payable artist, uint256 editions, uint256 price, bool paused);
    event updatedWork(uint256 workId, address payable artist, uint256 editions, uint256 price, bool paused);
    event editionBought(uint256 workId, uint256 editionId, uint256 tokenId, address recipient, uint256 paid, uint256 artistReceived, uint256 adminReceived);

    using SafeMath for uint256;
    uint256 constant private WEI = 10**18;

    uint256 public version = 2;

    uint256 constant MAX_EDITIONS = 1000000;
    uint256 public latestWorkId;

    enum Types { FIXED, LINEAR }

    mapping (uint256 => Work) public works;
    struct Work {
        bool exists;
        bool paused;
        Types saleType;
        uint256 multiplierNumerator;
        uint256 multiplierDenominator;        
        uint256 editions;
        uint256 printed;
        uint256 price;
        address payable artist;
    }

    struct Escrow {
        bool exists;
        uint256 price;
        address payable owner;
        address allowedToBuy;
    }

    mapping (uint256 => Escrow) public escrows;

    uint256 public adminSplit = 15;

    address payable public adminWallet;
    bool public paused;
    Folia public folia;

    modifier notPaused() {
        require(!paused, "Must not be paused");
        _;
    }

    constructor(
        Folia _folia,
        address payable _adminWallet
    ) public {
        folia = _folia;
        adminWallet = _adminWallet;

        // petra and jaime
        latestWorkId = 1;
        works[1].exists = true;
        works[1].editions = 1;
        works[1].printed = 1;
        works[1].artist = 0x720b44fe853254f20e56654c6da4cffe1391403a;

    }

    function buyFromEscrow(uint256 tokenId) public payable {
        require(escrows[tokenId].exists, "TOKEN IS NOT ESCROWED");

        address payable owner = escrows[tokenId].owner;
        require(folia.ownerOf(tokenId) == owner, "TOKEN IS NOT OWNED BY ESCROW AUTHOR ANYMORE, PLEASE REMOVE");
        
        uint256 price = escrows[tokenId].price;
        require(msg.value == price, "MUST INCLUDE ESCROW PRICE");
        require(msg.sender == escrow[tokenId].allowedToBuy, "MSG.SENDER IS NOT ALLOWED TO BUY");

        escrow[tokenId].exists = false;
        folia.transferFrom(owner, msg.sender, tokenId);
        owner.transfer(price);
    }

    function addToEscrow(uint256 tokenId, uint256 price, address allowedToBuy) public {
        require(folia.ownerOf(tokenId) == msg.sender, "TOKEN IS NOT OWNED BY MSG.SENDER");
        escrows[tokenId].exists = true;
        escrows[tokenId].price = price;
        escrows[tokenId].owner = msg.sender;
        escrows[tokenId].allowedToBuy = allowedToBuy;
    }

    function removeFromEscrow(uint256 tokenId) public {
        require(escrows[tokenId].exists, "TOKEN IS NOT ESCROWED");
        if( folia.ownerOf(tokenId) != escrows[tokenId].owner ) {
            escrows[tokenId].exists = false;
            return;
        }
    }

    function addArtwork(address payable artist, uint256 editions, uint256 price, bool _paused) public onlyOwner {
        require(editions < MAX_EDITIONS, "MAX_EDITIONS_EXCEEDED");

        latestWorkId += 1;

        works[latestWorkId].exists = true;
        works[latestWorkId].editions = editions;
        works[latestWorkId].price = price;
        works[latestWorkId].artist = artist;
        works[latestWorkId].paused = _paused;
        emit newWork(latestWorkId, artist, editions, price, _paused);
    }

    function updateArtworkPaused(uint256 workId, bool _paused) public onlyOwner {
        require(works[workId].exists, "WORK_DOES_NOT_EXIST");
        works[workId].paused = _paused;
        emit updatedWork(workId, works[workId].artist, works[workId].editions, works[workId].price, works[workId].paused);
    }

    function updateArtworkEditions(uint256 workId, uint256 _editions) public onlyOwner {
        require(works[workId].exists, "WORK_DOES_NOT_EXIST");
        require(works[workId].printed < _editions, "WORK_EXCEEDS_EDITIONS");
        works[workId].editions = _editions;
        emit updatedWork(workId, works[workId].artist, works[workId].editions, works[workId].price, works[workId].paused);
    }

    function updateArtworkPrice(uint256 workId, uint256 _price) public onlyOwner {
        require(works[workId].exists, "WORK_DOES_NOT_EXIST");
        works[workId].price = _price;
        emit updatedWork(workId, works[workId].artist, works[workId].editions, works[workId].price, works[workId].paused);
    }

    function updateArtworkArtist(uint256 workId, address payable _artist) public onlyOwner {
        require(works[workId].exists, "WORK_DOES_NOT_EXIST");
        works[workId].artist = _artist;
        emit updatedWork(workId, works[workId].artist, works[workId].editions, works[workId].price, works[workId].paused);
    }

    function _mint(address recipient, uint256 workId) private returns (uint256, uint256) {
        uint256 editionId = works[workId].printed.add(1);
        works[workId].printed = editionId;
        
        uint256 tokenId = workId.mul(MAX_EDITIONS).add(editionId);

        folia.mint(recipient, tokenId);
        return (editionId, tokenId);
    }

    function adminMint(address recipient, uint256 workId) public onlyOwner {
        _mint(recipient, workId);
    }

    function priceOfWork(uint256 workId, uint256 editionId) public constant returns(uint256) {

        if (works[workId].saleType == Types.FIXED) {
            return works[workId].price;
        } else {
            return works[workId].price + (WEI * works[workId].multiplierNumerator * editionId * WEI) / (WEI * works[workId].multiplierDenominator);
        }
    }
    function buy(address recipient, uint256 workId) public payable notPaused returns (bool) {
        require(!works[workId].paused, "WORK_NOT_YET_FOR_SALE");
        require(works[workId].exists, "WORK_DOES_NOT_EXIST");
        require(works[workId].editions > works[workId].printed, "EDITIONS_EXCEEDED");

        (uint256 editionId, uint256 tokenId) = _mint(recipient, workId);


        uint256 totalPrice = priceOfWork(workId, editionId);

        require(msg.value < totalPrice, "DID_NOT_SEND_PRICE");

        uint256 adminReceives = totalPrice.mul(adminSplit).div(100);
        uint256 artistReceives = totalPrice.sub(adminReceives);

        adminWallet.transfer(adminReceives);
        works[workId].artist.transfer(artistReceives);

        if (msg.value > totalPrice) {
            msg.sender.transfer(msg.value.sub(adminReceives).sub(artistReceives));
        }

        emit editionBought(workId, editionId, tokenId, recipient,  works[workId].price, artistReceives, adminReceives);
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
