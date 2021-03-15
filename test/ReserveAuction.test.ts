import chai, { expect } from 'chai';
import asPromised from 'chai-as-promised';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Blockchain } from '../utils/Blockchain';
import { generatedWallets } from '../utils/generatedWallets';
import { MarketFactory } from '../typechain/MarketFactory';
import { ethers, Wallet } from 'ethers';
import { AddressZero } from '@ethersproject/constants';
import Decimal from '../utils/Decimal';
import { BigNumber, BigNumberish, Bytes } from 'ethers';
import { MediaFactory } from '../typechain/MediaFactory';
import { ReserveAuctionFactory } from '../typechain/ReserveAuctionFactory';
import { ReserveAuction } from '../typechain/ReserveAuction';
import { Media } from '../typechain/Media';
import {
  approveCurrency,
  deployCurrency,
  EIP712Sig,
  getBalance,
  mintCurrency,
  signMintWithSig,
  signPermit,
  toNumWei,
} from './utils';
import {
  arrayify,
  formatBytes32String,
  formatUnits,
  parseUnits,
  sha256,
} from 'ethers/lib/utils';
import exp from 'constants';
import { Market } from '../typechain';
import { isRegExp } from 'util';

chai.use(asPromised);

let provider = new JsonRpcProvider();
let blockchain = new Blockchain(provider);

let contentHex: string;
let contentHash: string;
let contentHashBytes: Bytes;
let otherContentHex: string;
let otherContentHash: string;
let otherContentHashBytes: Bytes;
let zeroContentHashBytes: Bytes;
let metadataHex: string;
let metadataHash: string;
let metadataHashBytes: Bytes;
let duration: number;
let reservePrice: BigNumber;

let tokenURI = 'www.example.com';
let metadataURI = 'www.example2.com';

type DecimalValue = { value: BigNumber };

type BidShares = {
  owner: DecimalValue;
  prevOwner: DecimalValue;
  creator: DecimalValue;
};

type MediaData = {
  tokenURI: string;
  metadataURI: string;
  contentHash: Bytes;
  metadataHash: Bytes;
};

type Ask = {
  currency: string;
  amount: BigNumberish;
};

type Bid = {
  currency: string;
  amount: BigNumberish;
  bidder: string;
  recipient: string;
  sellOnShare: { value: BigNumberish };
};

describe('ReserveAuction', () => {
  let [
    deployerWallet,
    bidderWallet,
    creatorWallet,
    ownerWallet,
    prevOwnerWallet,
    otherWallet,
    nonBidderWallet,
  ] = generatedWallets(provider);

  let defaultBidShares = {
    prevOwner: Decimal.new(10),
    owner: Decimal.new(80),
    creator: Decimal.new(10),
  };

  let defaultTokenId = 1;
  let defaultAsk = {
    amount: 100,
    currency: '0x41A322b28D0fF354040e2CbC676F0320d8c8850d',
    sellOnShare: Decimal.new(0),
  };
  const defaultBid = (
    currency: string,
    bidder: string,
    recipient?: string
  ) => ({
    amount: 100,
    currency,
    bidder,
    recipient: recipient || bidder,
    sellOnShare: Decimal.new(10),
  });

  let auctionAddress: string;
  let tokenAddress: string;
  let reserveAuctionAddress: string;


  async function marketAs(wallet: Wallet) {
    return MarketFactory.connect(auctionAddress, wallet)
  }
  async function auctionAs(wallet: Wallet) {
    return ReserveAuctionFactory.connect(reserveAuctionAddress, wallet)
  }
  async function tokenAs(wallet: Wallet) {
    return MediaFactory.connect(tokenAddress, wallet);
  }
  async function deploy() {
    const auction = await (
      await new MarketFactory(deployerWallet).deploy()
    ).deployed();
    auctionAddress = auction.address;

    const token = await (
      await new MediaFactory(deployerWallet).deploy(auction.address)
    ).deployed();
    tokenAddress = token.address;

    await auction.configure(tokenAddress);

    const reserveAuction = await (
      await new ReserveAuctionFactory(deployerWallet).deploy(token.address)
    ).deployed();

    reserveAuctionAddress = reserveAuction.address;
  }

  async function mint(
    token: Media,
    metadataURI: string,
    tokenURI: string,
    contentHash: Bytes,
    metadataHash: Bytes,
    shares: BidShares
  ) {
    const data: MediaData = {
      tokenURI,
      metadataURI,
      contentHash,
      metadataHash,
    };
    return token.mint(data, shares);
  }

  async function mintWithSig(
    token: Media,
    creator: string,
    tokenURI: string,
    metadataURI: string,
    contentHash: Bytes,
    metadataHash: Bytes,
    shares: BidShares,
    sig: EIP712Sig
  ) {
    const data: MediaData = {
      tokenURI,
      metadataURI,
      contentHash,
      metadataHash,
    };

    return token.mintWithSig(creator, data, shares, sig);
  }

  async function setAsk(token: Media, tokenId: number, ask: Ask) {
    return token.setAsk(tokenId, ask);
  }

  async function removeAsk(token: Media, tokenId: number) {
    return token.removeAsk(tokenId);
  }

  async function setBid(token: Media, bid: Bid, tokenId: number) {
    return token.setBid(tokenId, bid);
  }

  async function removeBid(token: Media, tokenId: number) {
    return token.removeBid(tokenId);
  }

  async function acceptBid(token: Media, tokenId: number, bid: Bid) {
    return token.acceptBid(tokenId, bid);
  }


  async function mintToken() {
    const asCreator = await tokenAs(creatorWallet);
    await mint(
      asCreator,
      metadataURI,
      tokenURI,
      contentHashBytes,
      metadataHashBytes,
      defaultBidShares
    );

    const totalTokens = await asCreator.balanceOf(creatorWallet.address)
    const lastToken = await asCreator.tokenOfOwnerByIndex(creatorWallet.address, (totalTokens).sub(1))

    return lastToken
  }

  // Trade a token a few times and create some open bids
  async function setupAuction(tokenId, currentOwnerWallet) {
    const asCurrentOwnerToken = await tokenAs(currentOwnerWallet);
    // const asPrevOwner = await tokenAs(prevOwnerWallet);
    // const asOwner = await tokenAs(ownerWallet);
    // const asBidder = await tokenAs(bidderWallet);
    // const asOther = await tokenAs(otherWallet);

    const asCurrentOwnerWalletAuction = await auctionAs(currentOwnerWallet)


    duration = 60 * 60 * 24; // 24 hours
    reservePrice = BigNumber.from(10).pow(18).div(2) // 0.5 ETH
    
    let getApproved = await asCurrentOwnerToken.getApproved(tokenId)
    let currentOwner = await asCurrentOwnerToken.ownerOf(tokenId)
    if (getApproved != reserveAuctionAddress && currentOwner != reserveAuctionAddress) {
      await asCurrentOwnerToken.approve(reserveAuctionAddress, tokenId);
    }

    getApproved = await asCurrentOwnerToken.getApproved(tokenId)

    return asCurrentOwnerWalletAuction.createAuction(tokenId, duration, reservePrice, currentOwnerWallet.address)

  }

  beforeEach(async () => {
    await blockchain.resetAsync();

    metadataHex = ethers.utils.formatBytes32String('{}');
    metadataHash = await sha256(metadataHex);
    metadataHashBytes = ethers.utils.arrayify(metadataHash);

    contentHex = ethers.utils.formatBytes32String('invert');
    contentHash = await sha256(contentHex);
    contentHashBytes = ethers.utils.arrayify(contentHash);

    otherContentHex = ethers.utils.formatBytes32String('otherthing');
    otherContentHash = await sha256(otherContentHex);
    otherContentHashBytes = ethers.utils.arrayify(otherContentHash);

    zeroContentHashBytes = ethers.utils.arrayify(ethers.constants.HashZero);
  });

  describe('#constructor', () => {
    it('should be able to deploy', async () => {
      await expect(deploy()).eventually.fulfilled;
    });
  });


  describe('#auction mundane', () => {
    beforeEach(async () => {
      await deploy();
    });

    it('only owner can update contract address', async () => {
      const auctionAsCreator = await auctionAs(creatorWallet)
      const auctionAsDeployer = await auctionAs(deployerWallet)

      const token = await (
        await new MediaFactory(creatorWallet).deploy(auctionAddress)
      ).deployed();

      await expect(
        auctionAsCreator.updateZora(token.address)
      ).rejectedWith('Ownable: caller is not the owner')

      await expect(
        auctionAsDeployer.updateZora(token.address)
      ).fulfilled
    })

    it('only valid erc721 can be contract address', async () => {
      const auctionAsDeployer = await auctionAs(deployerWallet)

      const notToken = await (
        await new MarketFactory(creatorWallet).deploy()
      ).deployed();

      await expect(
        auctionAsDeployer.updateZora(notToken.address)
      ).rejected
    })

  })

  describe('#createBid mundane', () => {
      beforeEach(async () => {
        await deploy();
      });

    it('can\'t submit an auction that already exists', async () => {

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);

      await expect(
        setupAuction(tokenId, creatorWallet)
      ).rejectedWith('Auction already exists')
    })

    it('can\'t bid on an auction that doesn\'t exist', async () => {
      const auctionAsOther = await auctionAs(otherWallet)
      await expect(
        auctionAsOther.createBid(999)
      ).rejectedWith(`Auction doesn't exist`)
    })

    it(`can't create a bid lower than reservePrice`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);

      await expect(
        auctionAsBidder.createBid(tokenId, {value: reservePrice.div(2)})
      ).rejectedWith(`Must send reservePrice or more`)

    })

    it(`can't bid after auction is expired`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)
      const auctionAsOther = await auctionAs(otherWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice})
      blockchain.increaseTimeAsync(duration)
      await expect(
        auctionAsOther.createBid(tokenId, {value: reservePrice.mul(2)})
      ).rejectedWith('Auction expired')
    })

    it(`can't bid less than the last bid`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)
      const auctionAsOther = await auctionAs(otherWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice.mul(3)})
      await expect(
        auctionAsOther.createBid(tokenId, {value: reservePrice.mul(2)})
      ).rejectedWith('Must send more than last bid')
    })

    it(`can't increment bid by less than minBid amount`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)
      const auctionAsOther = await auctionAs(otherWallet)

      const minBid = await auctionAsBidder.minBid()

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice})
      await expect(
        auctionAsBidder.createBid(tokenId, {value: reservePrice.add(minBid.sub(1))})
      ).rejectedWith(`Must send more than last bid by minBid Amount`)
    })

    it(`should extend auction by timebuffer when bid made during timebuffer`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)
      const auctionAsOther = await auctionAs(otherWallet)

      const minBid = await auctionAsBidder.minBid()
      const timeBuffer = await auctionAsBidder.timeBuffer()

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice})

      const auctionBefore = await auctionAsBidder.auctions(tokenId)
      const durationBefore = auctionBefore.duration

      const blockBefore = await provider.getBlock(await provider.getBlockNumber())
      const timeBefore = blockBefore.timestamp

      await blockchain.increaseTimeAsync(BigNumber.from(duration).sub(timeBuffer).add(1).toNumber())
      await blockchain.waitBlocksAsync(1)

      const blockAfter = await provider.getBlock(await provider.getBlockNumber())
      const timeAfter = blockAfter.timestamp

      expect(timeAfter - timeBefore).eq(BigNumber.from(duration).sub(timeBuffer).add(1).toNumber())

      await auctionAsBidder.createBid(tokenId, {value: reservePrice.mul(2)})

      const auctionAfter = await auctionAsBidder.auctions(tokenId)
      const durationAfter = auctionAfter.duration

      expect(durationAfter.sub(durationBefore).toString()).eq(timeBuffer.toString())

    })
  })


  describe('#endAuction mundane', () => {
    beforeEach(async () => {
      await deploy();
    });

    it(`can't submit an auction that doesn't exist`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice})

      await blockchain.increaseTimeAsync(BigNumber.from(duration).add(1).toNumber())
      await blockchain.waitBlocksAsync(1)

      await expect(
        auctionAsBidder.endAuction(666)
      ).rejectedWith(`Auction doesn't exist`)
    })

    it(`can't end an auction that hasn't begun`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);

      await expect(
        auctionAsBidder.endAuction(tokenId)
      ).rejectedWith(`Auction hasn't begun`)

    })

    it(`can't end an auction that hasn't completed`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice})

      await expect(
        auctionAsBidder.endAuction(tokenId)
      ).rejectedWith(`Auction hasn't completed`)

      await blockchain.increaseTimeAsync(BigNumber.from(duration).sub(1).toNumber())
      await blockchain.waitBlocksAsync(1)

      await expect(
        auctionAsBidder.endAuction(tokenId)
      ).rejectedWith(`Auction hasn't completed`)

    })

  })



  describe('#cancelAuction mundane', () => {
    beforeEach(async () => {
      await deploy();
    });

    it(`can't submit an auction that doesn't exist`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice})

      await blockchain.increaseTimeAsync(BigNumber.from(duration).add(1).toNumber())
      await blockchain.waitBlocksAsync(1)

      await expect(
        auctionAsBidder.cancelAuction(666)
      ).rejectedWith(`Auction doesn't exist`)
    })

    it(`can't cancel an auction if you're not the creator or owner`, async () => {
      const auctionAsOther = await auctionAs(otherWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);

      await expect(
        auctionAsOther.cancelAuction(tokenId)
      ).rejectedWith(`Can only be called by auction creator or owner`)
    })

    it(`can cancel an auction if you're the creator `, async () => {
      const auctionAsCreator = await auctionAs(creatorWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);

      await expect(
        auctionAsCreator.cancelAuction(tokenId)
      ).fulfilled
    })

    it(`can cancel an auction if you're the owner `, async () => {
      const auctionAsDeployer = await auctionAs(deployerWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);

      await expect(
        auctionAsDeployer.cancelAuction(tokenId)
      ).fulfilled
    })

    it(`can't cancel an auction once it's begun`, async () => {
      const auctionAsDeployer = await auctionAs(deployerWallet)

      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, creatorWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice})

      await expect(
        auctionAsDeployer.cancelAuction(tokenId)
      ).rejectedWith(`Can't cancel an auction once it's begun`)
    })

    it(`can cancel an auction and transfer the token back and delete the auction`, async () => {
      const tokenAsCreator = await tokenAs(creatorWallet)
      const auctionAsDeployer = await auctionAs(deployerWallet)

      const tokenId = await mintToken();
      const ownerBefore = await tokenAsCreator.ownerOf(tokenId)
      await setupAuction(tokenId, creatorWallet);

      const ownerInBetween = await tokenAsCreator.ownerOf(tokenId)
      expect(ownerBefore).not.eq(ownerInBetween)

      const auctionBefore = await auctionAsDeployer.auctions(tokenId)
      expect(auctionBefore.exists).eq(true)

      await auctionAsDeployer.cancelAuction(tokenId)
      const ownerAfter = await tokenAsCreator.ownerOf(tokenId)
      expect(ownerBefore).eq(ownerAfter)

      const auctionAfter = await auctionAsDeployer.auctions(tokenId)
      expect(auctionAfter.exists).eq(false)

    })

  })

  describe('#auction happy trail', () => {
    beforeEach(async () => {
      await deploy();
    });

    it('should work when seller is creator of NFT', async () => {
      const token = await tokenAs(creatorWallet);
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();

      await setupAuction(tokenId, creatorWallet);

      let ownerOf = await token.ownerOf(tokenId);
      expect(ownerOf).eq(reserveAuctionAddress);

      let beforeCreatorBalance = await creatorWallet.getBalance()

      await auctionAsBidder.createBid(tokenId, {value: reservePrice.toString()})
      blockchain.increaseTimeAsync(duration)

      await auctionAsBidder.endAuction(tokenId)
      ownerOf = await token.ownerOf(tokenId);
      expect(ownerOf).eq(bidderWallet.address);

      let afterCreatorBalance = await creatorWallet.getBalance()
      expect(afterCreatorBalance.toString()).eq(beforeCreatorBalance.add(reservePrice).toString());

    });


    it('should work when seller is creator of NFT and multiple bids happen', async () => {
      const token = await tokenAs(creatorWallet);
      const auctionAsBidder = await auctionAs(bidderWallet)
      const auctionAsOther = await auctionAs(otherWallet)

      const tokenId = await mintToken();

      await setupAuction(tokenId, creatorWallet);

      await auctionAsBidder.createBid(tokenId, {value: reservePrice.toString()})

      let beforeAsBidder = await bidderWallet.getBalance()

      await auctionAsOther.createBid(tokenId, {value: reservePrice.mul(2).toString()})

      blockchain.increaseTimeAsync(duration)

      await auctionAsOther.endAuction(tokenId)
      let ownerOf = await token.ownerOf(tokenId);
      expect(ownerOf).eq(otherWallet.address);

      let afterAsBidder = await bidderWallet.getBalance()

      // losing bidder should have their balance back
      expect(afterAsBidder.toString()).eq(beforeAsBidder.add(reservePrice).toString());

    });

    it('should work when seller is not creator of NFT', async () => {
      const market = await marketAs(creatorWallet);
      const token = await tokenAs(creatorWallet);
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();

      await token.transferFrom(creatorWallet.address, otherWallet.address, tokenId)
      let ownerOf = await token.ownerOf(tokenId);
      expect(ownerOf).eq(otherWallet.address);

      await setupAuction(tokenId, otherWallet);

      ownerOf = await token.ownerOf(tokenId);
      expect(ownerOf).eq(reserveAuctionAddress);

      let beforeCreatorBalance = await creatorWallet.getBalance()
      let beforeOtherBalance = await otherWallet.getBalance()

      await auctionAsBidder.createBid(tokenId, {value: reservePrice.toString()})
      blockchain.increaseTimeAsync(duration)

      await auctionAsBidder.endAuction(tokenId)
      ownerOf = await token.ownerOf(tokenId);
      expect(ownerOf).eq(bidderWallet.address);


      const creatorShare = await market.bidSharesForToken(tokenId);

      const creatorAmount = await market.splitShare(creatorShare.creator, reservePrice);

      let afterCreatorBalance = await creatorWallet.getBalance()
      expect(afterCreatorBalance.toString()).eq(beforeCreatorBalance.add(creatorAmount).toString());

      let afterOtherBalance = await otherWallet.getBalance()
      expect(afterOtherBalance.toString()).eq(beforeOtherBalance.add(reservePrice).sub(creatorAmount).toString());

    });

  });

});
