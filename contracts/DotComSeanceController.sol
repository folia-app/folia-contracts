pragma solidity ^0.5.0;
/**
 * The FoliaControllerV2 is an upgradeable endpoint for controlling Folia.sol
 */

import "./DotComSeance.sol";
import "./SafeMath.sol";
import "./Ownable.sol";
import "./ReentrancyGuard.sol";

contract DotComSeanceController is Ownable, ReentrancyGuard {

    event newWork(uint256 workId, address payable artist, uint256 editions, uint256 price, bool _paused);
    event updatedWork(uint256 workId, address payable artist, uint256 editions, uint256 price, bool _paused);
    event editionBought(uint256 workId, uint256 editionId, uint256 tokenId, address recipient, uint256 paid, uint256 artistReceived, uint256 adminReceived);

    using SafeMath for uint256;

    enum SaleType {noID, ID}

    uint256 constant MAX_EDITIONS = 100;
    uint256 public latestWorkId = 0;


    mapping (uint256 => Work) public _works;
    struct Work {
        bool exists;
        bool paused;
        SaleType saleType;
        uint256 editions;
        uint256 printed;
        uint256 price;
        address payable artist;
    }

    DotComSeance public dotComSeance;

    uint256 public adminSplit = 20;
    address payable public adminWallet;
    bool public paused;

    modifier notPaused() {
        require(!paused, "Must not be paused");
        _;
    }

    constructor(
        DotComSeance _dotComSeance,
        address payable _adminWallet
    ) public {
        dotComSeance = _dotComSeance;
        adminWallet = _adminWallet;
    }

    function addArtwork(address payable artist, uint256 editions, uint256 price, bool _paused, SaleType saleType) public onlyOwner {
        require(editions < MAX_EDITIONS, "MAX_EDITIONS_EXCEEDED");


        _works[latestWorkId] = Work({
          exists: true,
          paused: _paused,
          saleType: saleType,
          editions: editions,
          printed: 0,
          price: price,
          artist: artist
        });

        latestWorkId += 1;

        emit newWork(latestWorkId, artist, editions, price, _paused);
    }

    function updateArtworkPaused(uint256 workId, bool _paused) public onlyOwner {
        Work storage work = _works[workId];
        require(work.exists, "WORK_DOES_NOT_EXIST");
        work.paused = _paused;
        emit updatedWork(workId, work.artist, work.editions, work.price, work.paused);
    }

    function updateArtworkEditions(uint256 workId, uint256 _editions) public onlyOwner {
        Work storage work = _works[workId];
        require(work.exists, "WORK_DOES_NOT_EXIST");
        require(work.printed < _editions, "WORK_EXCEEDS_EDITIONS");
        work.editions = _editions;
        emit updatedWork(workId, work.artist, work.editions, work.price, work.paused);
    }

    function updateArtworkPrice(uint256 workId, uint256 _price) public onlyOwner {
        Work storage work = _works[workId];
        require(work.exists, "WORK_DOES_NOT_EXIST");
        work.price = _price;
        emit updatedWork(workId, work.artist, work.editions, work.price, work.paused);
    }

    function updateArtworkArtist(uint256 workId, address payable _artist) public onlyOwner {
        Work storage work = _works[workId];
        require(work.exists, "WORK_DOES_NOT_EXIST");
        work.artist = _artist;
        emit updatedWork(workId, work.artist, work.editions, work.price, work.paused);
    }

    function buyByID(address recipient, uint256 workId, uint256 editionId) public payable notPaused nonReentrant returns(bool) {
        Work storage work = _works[workId];
        require(!work.paused, "WORK_NOT_YET_FOR_SALE");
        require(work.saleType == SaleType.ID, "WRONG_SALE_TYPE");
        require(work.exists, "WORK_DOES_NOT_EXIST");

        require(work.editions >= editionId && editionId > 0, "OUTSIDE_RANGE_OF_EDITIONS");
        uint256 tokenId = workId.mul(MAX_EDITIONS).add(editionId);

        require(msg.value == work.price, "DID_NOT_SEND_PRICE");

        work.printed += 1;
        dotComSeance.mint(recipient, tokenId);
        
        uint256 adminReceives = msg.value.mul(adminSplit).div(100);
        uint256 artistReceives = msg.value.sub(adminReceives);

        (bool success, ) = adminWallet.call.value(adminReceives)("");
        require(success, "admin failed to receive");

        (success, ) = work.artist.call.value(artistReceives)("");
        require(success, "artist failed to receive");

        emit editionBought(workId, editionId, tokenId, recipient,  work.price, artistReceives, adminReceives);
    }

    function buy(address recipient, uint256 workId) public payable notPaused nonReentrant returns (bool) {
        Work storage work = _works[workId];
        require(!work.paused, "WORK_NOT_YET_FOR_SALE");
        require(work.saleType == SaleType.noID, "WRONG_SALE_TYPE");
        require(work.exists, "WORK_DOES_NOT_EXIST");
        require(work.editions > work.printed, "EDITIONS_EXCEEDED");
        require(msg.value == work.price, "DID_NOT_SEND_PRICE");

        uint256 editionId = work.printed.add(1);
        work.printed = editionId;
        
        uint256 tokenId = workId.mul(MAX_EDITIONS).add(editionId);

        dotComSeance.mint(recipient, tokenId);
        
        uint256 adminReceives = msg.value.mul(adminSplit).div(100);
        uint256 artistReceives = msg.value.sub(adminReceives);

        (bool success, ) = adminWallet.call.value(adminReceives)("");
        require(success, "admin failed to receive");
        
        (success, ) = work.artist.call.value(artistReceives)("");
        require(success, "artist failed to receive");

        emit editionBought(workId, editionId, tokenId, recipient,  work.price, artistReceives, adminReceives);
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
