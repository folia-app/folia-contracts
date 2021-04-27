pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;
/**
 * The FoliaControllerV2 is an upgradeable endpoint for controlling Folia.sol
 */

import "./Folia.sol";
import "./FoliaController.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract FoliaControllerV2 is Ownable {

    event newWork(uint256 workId, address payable artist, uint256 editions, uint256 price, bool paused);
    event updatedWork(uint256 workId, address payable artist, uint256 editions, uint256 price, bool paused);
    event editionBought(uint256 workId, uint256 editionId, uint256 tokenId, address recipient, uint256 paid, uint256 artistReceived, uint256 adminReceived);

    using SafeMath for uint256;

    enum SaleType {noID, ID}

    uint256 constant MAX_EDITIONS = 1000000;
    uint256 public latestWorkId = 9;

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

    uint256 public adminSplit = 15;

    address payable public adminWallet;
    bool public paused;
    Folia public folia;
    FoliaController public foliaController;

    modifier notPaused() {
        require(!paused, "Must not be paused");
        _;
    }

    constructor(
        Folia _folia,
        FoliaController _foliaController,
        address payable _adminWallet
    ) public {
        folia = _folia;
        foliaController = _foliaController;
        adminWallet = _adminWallet;
    }

    function works(uint256 workId) public view returns (bool exists, bool paused, SaleType saleType, uint256 editions, uint256 printed, uint256 price, address payable artist) {
      if (workId >= foliaController.latestWorkId()) {
        return (_works[workId].exists, _works[workId].paused, _works[workId].saleType, _works[workId].editions, _works[workId].printed, _works[workId].price, _works[workId].artist);
      } else {
        (bool _exists, bool _paused, uint256 _editions, uint256 _printed, uint256 _price, address payable _artist) = foliaController.works(workId);
        return (_exists, _paused, SaleType.noID, _editions, _printed, _price, _artist);
      }
    }

    function addArtwork(address payable artist, uint256 editions, uint256 price, bool _paused, SaleType saleType) public onlyOwner {
        require(editions < MAX_EDITIONS, "MAX_EDITIONS_EXCEEDED");

        latestWorkId += 1;

        _works[latestWorkId] = Work({
          exists: true,
          paused: _paused,
          saleType: saleType,
          editions: editions,
          printed: 0,
          price: price,
          artist: artist
        });

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

    function buyByID(address recipient, uint256 workId, uint256 editionId) public payable notPaused returns(bool) {
        Work storage work = _works[workId];
        require(!work.paused, "WORK_NOT_YET_FOR_SALE");
        require(work.saleType == SaleType.ID, "WRONG_SALE_TYPE");
        require(work.exists, "WORK_DOES_NOT_EXIST");

        require(work.editions >= editionId && editionId > 0, "OUTSIDE_RANGE_OF_EDITIONS");
        uint256 tokenId = workId.mul(MAX_EDITIONS).add(editionId);

        require(msg.value == work.price, "DID_NOT_SEND_PRICE");

        work.printed += 1;
        folia.mint(recipient, tokenId);
        
        uint256 adminReceives = msg.value.mul(adminSplit).div(100);
        uint256 artistReceives = msg.value.sub(adminReceives);

        adminWallet.transfer(adminReceives);
        work.artist.transfer(artistReceives);

        emit editionBought(workId, editionId, tokenId, recipient,  work.price, artistReceives, adminReceives);
    }

    function buy(address recipient, uint256 workId) public payable notPaused returns (bool) {
        Work storage work = _works[workId];
        require(!work.paused, "WORK_NOT_YET_FOR_SALE");
        require(work.saleType == SaleType.noID, "WRONG_SALE_TYPE");
        require(work.exists, "WORK_DOES_NOT_EXIST");
        require(work.editions > work.printed, "EDITIONS_EXCEEDED");
        require(msg.value == work.price, "DID_NOT_SEND_PRICE");

        uint256 editionId = work.printed.add(1);
        work.printed = editionId;
        
        uint256 tokenId = workId.mul(MAX_EDITIONS).add(editionId);

        folia.mint(recipient, tokenId);
        
        uint256 adminReceives = msg.value.mul(adminSplit).div(100);
        uint256 artistReceives = msg.value.sub(adminReceives);

        adminWallet.transfer(adminReceives);
        work.artist.transfer(artistReceives);

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
