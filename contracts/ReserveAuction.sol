pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity/contracts/introspection/IERC165.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";

contract ReserveAuction is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    bool public globalPaused;

    uint256 public timeBuffer = 15 * 60; // extend 15 minutes after every bid made in last 15 minutes
    uint256 public minBid = 1 * 10**17; // 0.1 eth

    bytes4 constant interfaceId = 0x80ac58cd; // 721 interface id
    address public nftAddress;
    address payable public admin;

    mapping(uint256 => Auction) public auctions;
    uint256[] public tokenIds;

    struct Auction {
        bool exists;
        bool paused;
        uint256 amount;
        uint256 tokenId;
        uint256 duration;
        uint256 firstBidTime;
        uint256 reservePrice;
        uint256 adminSplit; // percentage of 100
        address creator;
        address payable proceedsRecipient;
        address payable bidder;
    }

    modifier notPaused() {
        require(!globalPaused, "Must not be paused");
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
    event UpdateAuction(
        uint256 tokenId,
        bool paused
    );

    constructor(address _nftAddress, address payable _admin) public {
        require(
            IERC165(_nftAddress).supportsInterface(interfaceId),
            "Doesn't support NFT interface"
        );
        nftAddress = _nftAddress;
        admin = _admin;
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

    function updateAuction(uint256 tokenId, bool paused) public onlyOwner {
        require(auctions[tokenId].exists, "Auction doesn't exist");
        auctions[tokenId].paused = paused;
        emit UpdateAuction(tokenId, paused);
    }

    function createAuction(
        bool paused,
        uint256 tokenId,
        uint256 duration,
        uint256 firstBidTime,
        uint256 reservePrice,
        uint256 adminSplit, // percentage
        address payable proceedsRecipient
    ) external notPaused onlyOwner nonReentrant {
        require(!auctions[tokenId].exists, "Auction already exists");
        require(adminSplit < 100, "Percentage has to be less than 100");
        tokenIds.push(tokenId);

        auctions[tokenId].paused = paused;
        auctions[tokenId].exists = true;
        auctions[tokenId].duration = duration;
        auctions[tokenId].firstBidTime = firstBidTime;
        auctions[tokenId].reservePrice = reservePrice;

        auctions[tokenId].adminSplit = adminSplit;
        auctions[tokenId].creator = msg.sender;
        auctions[tokenId].proceedsRecipient = proceedsRecipient;

        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);

        emit AuctionCreated(tokenId, nftAddress, duration, reservePrice, msg.sender);
    }

    function createBid(uint256 tokenId) external payable notPaused nonReentrant {

        Auction memory auction = auctions[tokenId];

        require(auction.exists, "Auction doesn't exist");
        require(!auction.paused, "Auction paused");
        require(
            msg.value >= auction.reservePrice,
            "Must send reservePrice or more"
        );

        if (auction.firstBidTime > 0) {
            require(
                auction.firstBidTime <= block.timestamp,
            "Auction hasn't started");
        }

        require(
            auction.firstBidTime == 0 ||
                block.timestamp <
                auction.firstBidTime + auction.duration,
            "Auction expired"
        );

        uint256 lastValue = auction.amount;

        bool firstBid;
        address payable lastBidder;

        // allows for auctions with starting price of 0
        if (lastValue != 0) {
            require(msg.value > lastValue, "Must send more than last bid");
            require(
                msg.value.sub(lastValue) >= minBid,
                "Must send more than last bid by minBid Amount"
            );
            lastBidder = auction.bidder;
        } else {
            firstBid = true;
            if (auction.firstBidTime == 0) {
                auctions[tokenId].firstBidTime = block.timestamp;
            }
        }

        auctions[tokenId].amount = msg.value;
        auctions[tokenId].bidder = msg.sender;

        bool extended;
        // at this point we know that the timestamp is less than start + duration
        // we want to know by how much the timestamp is less than start + duration
        // if the difference is less than the timeBuffer, update duration to time buffer
        if (
            ( auctions[tokenId].firstBidTime.add( auction.duration ) ).sub( block.timestamp ) < timeBuffer
        ) {
            // take the difference between now and starting point, add timeBuffer and set as duration
            auctions[tokenId].duration = block.timestamp.sub(auctions[tokenId].firstBidTime).add(timeBuffer);
            extended = true;
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
        if (!firstBid && lastValue > 0) {
            // in case the bidder is a contract that doesn't allow receiving
             (bool success, ) = lastBidder.call.value(lastValue)("");
            if (!success) {
                (success, ) = admin.call.value(lastValue)("");
                require(success, "admin (in place of lastBidder) failed to receive");
            }
        }
    }

    function endAuction(uint256 tokenId) external notPaused nonReentrant {
        
        Auction memory auction = auctions[tokenId];

        require(auction.exists, "Auction doesn't exist");
        require(!auction.paused, "Auction paused");
        require(
            uint256(auction.firstBidTime) != 0,
            "Auction hasn't begun"
        );
        require(
            block.timestamp >=
                auction.firstBidTime + auction.duration,
            "Auction hasn't completed"
        );

        address winner = auction.bidder;
        uint256 amount = auction.amount;
        address creator = auction.creator;
        uint256 adminSplit = auction.adminSplit;
        address payable proceedsRecipient = auction.proceedsRecipient;

        emit AuctionEnded(tokenId, nftAddress, creator, winner, amount);
        delete auctions[tokenId];

        IERC721(nftAddress).transferFrom(address(this), winner, tokenId);

        uint256 adminReceives = amount.mul(adminSplit).div(100);
        uint256 proceedsAmount = amount.sub(adminReceives);
        bool success;
        if (adminReceives > 0) {
            (success, ) = admin.call.value(adminReceives)("");
            require(success, "admin failed to receive");
        }

        (success, ) = proceedsRecipient.call.value(proceedsAmount)("");
        require(success, "recipient failed to receive");
    }

    function cancelAuction(uint256 tokenId) external nonReentrant {

        Auction memory auction = auctions[tokenId];

        require(auction.exists, "Auction doesn't exist");
        require(
            auction.creator == msg.sender || msg.sender == owner(),
            "Can only be called by auction creator or owner"
        );
        require(
            auction.amount == 0,
            "Can't cancel an auction once it's begun"
        );
        address creator = auction.creator;
        delete auctions[tokenId];
        IERC721(nftAddress).transferFrom(address(this), creator, tokenId);
        emit AuctionCanceled(tokenId, nftAddress, creator);
    }

    function updatePaused(bool _globalPaused) public onlyOwner {
        globalPaused = _globalPaused;
    }

    function updateAdmin(address payable _admin) public onlyOwner {
        admin = _admin;
    }
}
