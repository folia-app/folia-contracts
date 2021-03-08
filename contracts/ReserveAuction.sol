pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./IMedia.sol";
import "./IMarket.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity/contracts/introspection/IERC165.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";

contract ReserveAuction is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    // TODO ask about this
    uint256 constant timeBuffer = 24 * 60 * 60; // extend 24 hours after every bid made in last 24 hours 
    // TODO ask about this
    uint256 constant minBid = 1 * 10**17; // 0.1 eth 

    bytes4 constant interfaceId = 0x80ac58cd;
    address constant zora = 0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7;

    address defaultTokenContract;
    mapping (bytes32 => Auction) public auctions;
    bytes32[] public auctionIds;

    struct Auction {
      bool exists;
      uint256 amount;
      uint256 tokenId;
      uint256 duration;
      uint256 firstBidTime;
      uint256 reservePrice;
      address payable creator;
      address payable bidder;
      address tokenContract;
    }

    event AuctionCreated(bytes32 auctionId, uint256 tokenId, address tokenContract, uint256 duration, uint256 reservePrice, address creator);
    event  AuctionBid(
        bytes32 auctionId,
        uint256 tokenId,
        address tokenContract,
        address sender,
        uint256 value,
        uint256 timestamp,
        bool firstBid,
        bool extended
      );
    event AuctionEnded(bytes32 auctionId, uint256 tokenId, address tokenContract, address creator, address winner, uint256 amount);
    event AuctionCanceled(bytes32 auctionId, uint256 tokenId, address tokenContract, address creator);

    constructor(address _defaultTokenContract) public {
      defaultTokenContract = _defaultTokenContract;
      require(IERC165(defaultTokenContract).supportsInterface(interfaceId), "Doesn't support NFT interface");
    }

    function updateDefaultTokenContract(address _defaultTokenContract) public onlyOwner {
      defaultTokenContract = _defaultTokenContract;
      require(IERC165(defaultTokenContract).supportsInterface(interfaceId), "Doesn't support NFT interface");
    }

    function createAuction(
      uint256 tokenId,
      uint256 duration,
      uint256 reservePrice,
      address payable creator
    ) external returns(bool) {
      return createAuctionCustom(tokenId, defaultTokenContract, duration, reservePrice, creator);
    }

    function createAuctionCustom(
      uint256 tokenId,
      address tokenContract,
      uint256 duration,
      uint256 reservePrice,
      address payable creator
    ) public returns(bool) {
      require(IERC165(tokenContract).supportsInterface(interfaceId), "Doesn't support NFT interface");

      bytes32 auctionId = keccak256(abi.encodePacked(tokenContract, tokenId));
      require(!auctions[auctionId].exists, "Auction already exists");

      auctionIds.push(auctionId);

      auctions[auctionId].exists = true;
      auctions[auctionId].tokenId = tokenId;
      auctions[auctionId].tokenContract = tokenContract;
      auctions[auctionId].duration = duration;
      auctions[auctionId].reservePrice = reservePrice;
      auctions[auctionId].creator = creator;

      IERC721(tokenContract).transferFrom(creator, address(this), tokenId);
      emit AuctionCreated(auctionId, tokenId, tokenContract, duration, reservePrice, creator);
      return true;
    }

    function createBid(uint256 tokenId) external payable returns (bool) {
      return createBidCustom(tokenId, defaultTokenContract);
    }

    //NOTE: removed amount as a variable because it's redundant with msg.amount since ERC20s aren't accepted. // TODO ask about this;
    function createBidCustom(uint256 tokenId, address tokenContract) public payable returns (bool) {
      require(IERC165(tokenContract).supportsInterface(interfaceId), "Doesn't support NFT interface");
      bytes32 auctionId = keccak256(abi.encodePacked(tokenContract, tokenId));
      require(auctions[auctionId].exists, "Auction doesn't exist");
      require(msg.value >= auctions[auctionId].reservePrice, "Must send reservePrice or more");
      require(block.timestamp < auctions[auctionId].firstBidTime + auctions[auctionId].duration, "Auction expired");

      uint256 lastValue = auctions[auctionId].amount;

      bool firstBid;
      address payable lastBidder;
      // allows for auctions with starting price of 0 // TODO ask about this;
      if (lastValue != 0) {
        require(msg.value.sub(lastValue) >= minBid, "Must send more than last bid by minBid Amount");
        lastBidder = auctions[auctionId].bidder;
      } else {
        firstBid = true;
        auctions[auctionId].firstBidTime = block.timestamp;
      }

      if (tokenContract == zora) {
          require(
            IMarket(zora).isValidBid(tokenId, msg.value),
            "Market: Ask invalid for share splitting"
        );
      }

      auctions[auctionId].amount = msg.value;
      auctions[auctionId].bidder = msg.sender;

      bool extended;
      if (block.timestamp - (auctions[auctionId].firstBidTime + auctions[auctionId].duration) < timeBuffer) {
        auctions[auctionId].firstBidTime += timeBuffer;
        extended = true;
      }

      if (!firstBid) {
        lastBidder.transfer(lastValue);
      }

      emit AuctionBid(
        auctionId,
        tokenId,
        tokenContract,
        msg.sender,
        msg.value,
        block.timestamp,
        firstBid,
        extended
      );
      return true;
    }

    function endAuction(uint256 tokenId) external returns (bool) {
      return endAuctionCustom(tokenId, defaultTokenContract);
    }

    // NOTE: description "Transfers the NFT to the highest bidder, if there is one and is greater-or-equal the reserve price, else transfers back to the creator"
    // Doesn't make sense. If there is no greater-or-equal to reserve price, the auction hasn't begun and cancelAuction should instead be called.
    // TODO: ask about this;
    function endAuctionCustom(uint256 tokenId, address tokenContract) public returns (bool) {
      require(IERC165(tokenContract).supportsInterface(interfaceId), "Doesn't support NFT interface");
      bytes32 auctionId = keccak256(abi.encodePacked(tokenContract, tokenId));
      require(auctions[auctionId].exists, "Auction doesn't exist");
      require(uint256(auctions[auctionId].firstBidTime) != 0, "Auction hasn't begun");
      require(block.timestamp >= auctions[auctionId].firstBidTime + auctions[auctionId].duration, "Auction hasn't completed");

      address winner = auctions[auctionId].bidder;
      uint256 amount = auctions[auctionId].amount;
      address payable creator = auctions[auctionId].creator;

      emit AuctionEnded(auctionId, tokenId, tokenContract, creator, winner, amount);
      delete auctions[auctionId];

      IERC721(tokenContract).transferFrom(address(this), winner, tokenId);
      if (tokenContract == zora) {
        IMarket.BidShares memory bidShares = IMarket(zora).bidSharesForToken(tokenId);
        // BidShares storage bidShares = _bidShares[tokenId];
        require(IMarket(zora).isValidBid(tokenId, amount), "Is not valid bid");
        // IMarket(zora).splitShare(bidShares.owner, bid.amount)

        address payable originalCreator = address(uint160(IMedia(zora).tokenCreators(tokenId)));
        uint256 creatorAmount = IMarket(zora).splitShare(bidShares.creator, amount);

        uint256 sellerAmount = amount.sub(creatorAmount);

        originalCreator.transfer(creatorAmount);
        creator.transfer(sellerAmount);

        // IMarket(zora).splitShare(bidShares.prevOwner, bid.amount)

        // // Calculate the bid share for the new owner,
        // // equal to 100 - creatorShare - sellOnShare
        // bidShares.owner = Decimal.D256(
        //     uint256(100)
        //         .mul(Decimal.BASE)
        //         .sub(_bidShares[tokenId].creator.value)
        //         .sub(bid.sellOnShare.value)
        // );
        // Set the previous owner share to the accepted bid's sell-on fee
        // bidShares.prevOwner = bid.sellOnShare;


      } else {
        creator.transfer(amount);
      }

      return true;
    }



    function cancelAuctionCustom(uint256 tokenId, address tokenContract) public returns (bool) {
      require(IERC165(tokenContract).supportsInterface(interfaceId), "Doesn't support NFT interface");
      bytes32 auctionId = keccak256(abi.encodePacked(tokenContract, tokenId));
      require(auctions[auctionId].exists, "Auction doesn't exist");
      require(auctions[auctionId].creator == msg.sender, "Can only be called by auction creator");
      require(uint256(auctions[auctionId].firstBidTime) == 0, "Can't cancel an auction once it's begun");
      address creator = auctions[auctionId].creator;
      IERC721(tokenContract).transferFrom(address(this), creator, tokenId);
      emit AuctionCanceled(auctionId, tokenId, tokenContract, creator);
      delete auctions[auctionId];

    }
    function cancelAuction(uint256 tokenId) external returns (bool) {
      return cancelAuctionCustom(tokenId, defaultTokenContract);
    }

}