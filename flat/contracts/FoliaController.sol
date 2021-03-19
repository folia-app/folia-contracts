// File: contracts/FoliaController.sol

// pragma solidity ^0.5.0;

// /**
//  * The FoliaController is an upgradeable endpoint for controlling Folia.sol
//  */

// import "./Folia.sol";
// import "openzeppelin-solidity/contracts/math/SafeMath.sol";
// import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

// contract FoliaController is Ownable {

//     event newWork(uint256 workId, address payable artist, uint256 editions, uint256 price, bool paused);
//     event updatedWork(uint256 workId, address payable artist, uint256 editions, uint256 price, bool paused);
//     event editionBought(uint256 workId, uint256 editionId, uint256 tokenId, address recipient, uint256 paid, uint256 artistReceived, uint256 adminReceived);

//     using SafeMath for uint256;

//     uint256 constant MAX_EDITIONS = 1000000;
//     uint256 public latestWorkId;

//     mapping (uint256 => Work) public works;
//     struct Work {
//         bool exists;
//         bool paused;
//         uint256 editions;
//         uint256 printed;
//         uint256 price;
//         address payable artist;
//     }

//     uint256 public adminSplit = 15;

//     address payable public adminWallet;
//     bool public paused;
//     Folia public folia;

//     modifier notPaused() {
//         require(!paused, "Must not be paused");
//         _;
//     }

//     constructor(
//         Folia _folia,
//         address payable _adminWallet
//     ) public {
//         folia = _folia;
//         adminWallet = _adminWallet;
//     }

//     function addArtwork(address payable artist, uint256 editions, uint256 price, bool _paused) public onlyOwner {
//         require(editions < MAX_EDITIONS, "MAX_EDITIONS_EXCEEDED");

//         latestWorkId += 1;

//         works[latestWorkId].exists = true;
//         works[latestWorkId].editions = editions;
//         works[latestWorkId].price = price;
//         works[latestWorkId].artist = artist;
//         works[latestWorkId].paused = _paused;
//         emit newWork(latestWorkId, artist, editions, price, _paused);
//     }

//     function updateArtworkPaused(uint256 workId, bool _paused) public onlyOwner {
//         require(works[workId].exists, "WORK_DOES_NOT_EXIST");
//         works[workId].paused = _paused;
//         emit updatedWork(workId, works[workId].artist, works[workId].editions, works[workId].price, works[workId].paused);
//     }

//     function updateArtworkEditions(uint256 workId, uint256 _editions) public onlyOwner {
//         require(works[workId].exists, "WORK_DOES_NOT_EXIST");
//         require(works[workId].printed < _editions, "WORK_EXCEEDS_EDITIONS");
//         works[workId].editions = _editions;
//         emit updatedWork(workId, works[workId].artist, works[workId].editions, works[workId].price, works[workId].paused);
//     }

//     function updateArtworkPrice(uint256 workId, uint256 _price) public onlyOwner {
//         require(works[workId].exists, "WORK_DOES_NOT_EXIST");
//         works[workId].price = _price;
//         emit updatedWork(workId, works[workId].artist, works[workId].editions, works[workId].price, works[workId].paused);
//     }

//     function updateArtworkArtist(uint256 workId, address payable _artist) public onlyOwner {
//         require(works[workId].exists, "WORK_DOES_NOT_EXIST");
//         works[workId].artist = _artist;
//         emit updatedWork(workId, works[workId].artist, works[workId].editions, works[workId].price, works[workId].paused);
//     }

//     function buy(address recipient, uint256 workId) public payable notPaused returns (bool) {
//         require(!works[workId].paused, "WORK_NOT_YET_FOR_SALE");
//         require(works[workId].exists, "WORK_DOES_NOT_EXIST");
//         require(works[workId].editions > works[workId].printed, "EDITIONS_EXCEEDED");
//         require(msg.value == works[workId].price, "DID_NOT_SEND_PRICE");

//         uint256 editionId = works[workId].printed.add(1);
//         works[workId].printed = editionId;
        
//         uint256 tokenId = workId.mul(MAX_EDITIONS).add(editionId);

//         folia.mint(recipient, tokenId);
        
//         uint256 adminReceives = msg.value.mul(adminSplit).div(100);
//         uint256 artistReceives = msg.value.sub(adminReceives);

//         adminWallet.transfer(adminReceives);
//         works[workId].artist.transfer(artistReceives);

//         emit editionBought(workId, editionId, tokenId, recipient,  works[workId].price, artistReceives, adminReceives);
//     }

//     function updateAdminSplit(uint256 _adminSplit) public onlyOwner {
//         require(_adminSplit <= 100, "SPLIT_MUST_BE_LTE_100");
//         adminSplit = _adminSplit;
//     }

//     function updateAdminWallet(address payable _adminWallet) public onlyOwner {
//         adminWallet = _adminWallet;
//     }

//     function updatePaused(bool _paused) public onlyOwner {
//         paused = _paused;
//     }

// }
