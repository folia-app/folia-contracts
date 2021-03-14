pragma solidity 0.5.0;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity/contracts/introspection/IERC165.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";

/**
   _____                                                   _   _                           
  |  __ \                                  /\             | | (_)                          
  | |__) |___ ___  ___ _ ____   _____     /  \  _   _  ___| |_ _  ___  _ __                
  |  _  // _ / __|/ _ | '__\ \ / / _ \   / /\ \| | | |/ __| __| |/ _ \| '_ \               
  | | \ |  __\__ |  __| |   \ V |  __/  / ____ | |_| | (__| |_| | (_) | | | |              
  |_|  \_\___|___/\___|_|    \_/ \___| /_/    \_\__,_|\___|\__|_|\___/|_| |_|              
                                                                                           
                                                                                           
   ____          ____  _ _ _         _____                       _                         
  |  _ \        |  _ \(_| | |       |  __ \                     | |                        
  | |_) |_   _  | |_) |_| | |_   _  | |__) |___ _ __  _ __   ___| | ____ _ _ __ ___  _ __  
  |  _ <| | | | |  _ <| | | | | | | |  _  // _ | '_ \| '_ \ / _ | |/ / _` | '_ ` _ \| '_ \ 
  | |_) | |_| | | |_) | | | | |_| | | | \ |  __| | | | | | |  __|   | (_| | | | | | | |_) |
  |____/ \__, | |____/|_|_|_|\__, | |_|  \_\___|_| |_|_| |_|\___|_|\_\__,_|_| |_| |_| .__/ 
          __/ |               __/ |                                                 | |    
         |___/               |___/                                                  |_|    

*/

contract ReserveAuction is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    bool public paused;

    uint256 public timeBuffer = 15 * 60; // extend 15 minutes after every bid made in last 15 minutes
    uint256 public minBid = 1 * 10**17; // 0.1 eth

    bytes4 constant interfaceId = 0x80ac58cd; // 721 interface id
    address public nftAddress;

    mapping(uint256 => Auction) public auctions;
    uint256[] public tokenIds;

    struct Auction {
        bool exists;
        uint256 amount;
        uint256 tokenId;
        uint256 duration;
        uint256 firstBidTime;
        uint256 reservePrice;
        address payable creator;
        address payable bidder;
    }

    modifier notPaused() {
        require(!paused, "Must not be paused");
        _;
    }

    event AuctionCreated(
        uint256 tokenId,
        address nftAddress,
        uint256 duration,
        uint256 reservePrice,
        address creator
    );
    event AuctionBid(
        uint256 tokenId,
        address nftAddress,
        address sender,
        uint256 value,
        uint256 timestamp,
        bool firstBid,
        bool extended
    );
    event AuctionEnded(
        uint256 tokenId,
        address nftAddress,
        address creator,
        address winner,
        uint256 amount
    );
    event AuctionCanceled(
        uint256 tokenId,
        address nftAddress,
        address creator
    );

    constructor(address _nftAddress) public {
        require(
            IERC165(_nftAddress).supportsInterface(interfaceId),
            "Doesn't support NFT interface"
        );
        nftAddress = _nftAddress;
    }

    function updateNftAddress(address _nftAddress) public onlyOwner {
        require(
            IERC165(_nftAddress).supportsInterface(interfaceId),
            "Doesn't support NFT interface"
        );
        nftAddress = _nftAddress;
    }

    function updateMinBid(uint256 _minBid) public onlyOwner {
        minBid = _minBid;
    }

    function updateTimeBuffer(uint256 _timeBuffer) public onlyOwner {
        timeBuffer = _timeBuffer;
    }

    function createAuction(
        uint256 tokenId,
        uint256 duration,
        uint256 reservePrice,
        address payable creator
    ) external notPaused onlyOwner {
        require(!auctions[tokenId].exists, "Auction already exists");

        tokenIds.push(tokenId);

        auctions[tokenId].exists = true;
        auctions[tokenId].duration = duration;
        auctions[tokenId].reservePrice = reservePrice;
        auctions[tokenId].creator = creator;

        IERC721(nftAddress).transferFrom(creator, address(this), tokenId);

        emit AuctionCreated(tokenId, nftAddress, duration, reservePrice, creator);
    }

    function createBid(uint256 tokenId) external payable notPaused {
        require(auctions[tokenId].exists, "Auction doesn't exist");
        require(
            msg.value >= auctions[tokenId].reservePrice,
            "Must send reservePrice or more"
        );
        require(
            auctions[tokenId].firstBidTime == 0 ||
                block.timestamp <
                auctions[tokenId].firstBidTime + auctions[tokenId].duration,
            "Auction expired"
        );

        uint256 lastValue = auctions[tokenId].amount;

        bool firstBid;
        address payable lastBidder;

        // allows for auctions with starting price of 0
        if (lastValue != 0) {
            require(msg.value > lastValue, "Must send more than last bid");
            require(
                msg.value.sub(lastValue) >= minBid,
                "Must send more than last bid by minBid Amount"
            );
            lastBidder = auctions[tokenId].bidder;
        } else {
            firstBid = true;
            auctions[tokenId].firstBidTime = block.timestamp;
        }

        auctions[tokenId].amount = msg.value;
        auctions[tokenId].bidder = msg.sender;

        bool extended;
        // at this point we know that the timestamp is less than start + duration
        // we want to know by how much the timestamp is less than start + duration
        // if the difference is less than the timeBuffer, increase the duration by the timeBuffer
        if (
            (auctions[tokenId].firstBidTime.add(auctions[tokenId].duration))
                .sub(block.timestamp) < timeBuffer
        ) {
            auctions[tokenId].duration += timeBuffer;
            extended = true;
        }

        if (!firstBid) {
            lastBidder.transfer(lastValue);
        }

        emit AuctionBid(
            tokenId,
            nftAddress,
            msg.sender,
            msg.value,
            block.timestamp,
            firstBid,
            extended
        );
    }

    function endAuction(uint256 tokenId) external notPaused {
        require(auctions[tokenId].exists, "Auction doesn't exist");
        require(
            uint256(auctions[tokenId].firstBidTime) != 0,
            "Auction hasn't begun"
        );
        require(
            block.timestamp >=
                auctions[tokenId].firstBidTime + auctions[tokenId].duration,
            "Auction hasn't completed"
        );

        address winner = auctions[tokenId].bidder;
        uint256 amount = auctions[tokenId].amount;
        address payable creator = auctions[tokenId].creator;

        emit AuctionEnded(tokenId, nftAddress, creator, winner, amount);
        delete auctions[tokenId];

        IERC721(nftAddress).transferFrom(address(this), winner, tokenId);
        creator.transfer(amount);
    }

    function cancelAuction(uint256 tokenId) external {
        require(auctions[tokenId].exists, "Auction doesn't exist");
        require(
            auctions[tokenId].creator == msg.sender || msg.sender == owner(),
            "Can only be called by auction creator or owner"
        );
        require(
            uint256(auctions[tokenId].firstBidTime) == 0,
            "Can't cancel an auction once it's begun"
        );
        address creator = auctions[tokenId].creator;
        IERC721(nftAddress).transferFrom(address(this), creator, tokenId);
        emit AuctionCanceled(tokenId, nftAddress, creator);
        delete auctions[tokenId];
    }

    function updatePaused(bool _paused) public onlyOwner {
        paused = _paused;
    }
}
