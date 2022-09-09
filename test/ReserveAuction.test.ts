import chai, { expect } from 'chai';
import asPromised from 'chai-as-promised';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Blockchain } from '../utils/Blockchain';
import { generatedWallets } from '../utils/generatedWallets';
import { ethers, Wallet } from 'ethers';
import { AddressZero } from '@ethersproject/constants';
import Decimal from '../utils/Decimal';
import { BigNumber, BigNumberish, Bytes } from 'ethers';
import { TestTokenFactory } from '../typechain/TestTokenFactory';
import { ReserveAuctionFactory } from '../typechain/ReserveAuctionFactory';
import { ReserveAuction } from '../typechain/ReserveAuction';
import { TestToken } from '../typechain/TestToken';

import {
  arrayify,
  formatBytes32String,
  formatUnits,
  parseUnits,
  sha256,
} from 'ethers/lib/utils';
import exp from 'constants';
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
let paused: boolean;
let adminSplit: number;
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
    adminWallet,
    prevOwnerWallet,
    otherWallet,
    nonBidderWallet,
  ] = generatedWallets(provider);

  let defaultTokenId = 1;

  let auctionAddress: string;
  let tokenAddress: string;
  let reserveAuctionAddress: string;


  async function auctionAs(wallet: Wallet) {
    return ReserveAuctionFactory.connect(reserveAuctionAddress, wallet)
  }

  async function tokenAs(wallet: Wallet) {
    return TestTokenFactory.connect(tokenAddress, wallet);
  }

  async function deploy() {
    const token = await (
      await new TestTokenFactory(deployerWallet).deploy()
    ).deployed();
    tokenAddress = token.address;

    // const foliaSafe = '0x397c2C9c2841bcC396ecAEdBc00cD2CFd07de917'

    const reserveAuction = await (
      await new ReserveAuctionFactory(deployerWallet).deploy(token.address, adminWallet.address)
    ).deployed();

    reserveAuctionAddress = reserveAuction.address;
  }

  async function mintToken() {
    const asCreator = await tokenAs(deployerWallet);
    const totalSupply = await asCreator.totalSupply()
    await asCreator.mint(deployerWallet.address, totalSupply.add(1))
    const totalTokens = await asCreator.balanceOf(deployerWallet.address)
    return asCreator.tokenOfOwnerByIndex(deployerWallet.address, totalTokens.sub(1))
  }

  // Trade a token a few times and create some open bids
  async function setupAuction(tokenId, currentOwnerWallet, firstTimeBid = 0, reservePrice = BigNumber.from(10).pow(18).div(2)) { // 0.5 eth
    // reservePrice = reservePrice_ || BigNumber.from(10).pow(18).div(2)
    const asCurrentOwnerToken = await tokenAs(currentOwnerWallet);
    // const asPrevOwner = await tokenAs(prevOwnerWallet);
    // const asOwner = await tokenAs(ownerWallet);
    // const asBidder = await tokenAs(bidderWallet);
    // const asOther = await tokenAs(otherWallet);

    const asCurrentOwnerWalletAuction = await auctionAs(currentOwnerWallet)

      duration = 60 * 60 * 24; // 24 hours
      adminSplit = 15
      paused = false
    
    let getApproved = await asCurrentOwnerToken.getApproved(tokenId)
    let currentOwner = await asCurrentOwnerToken.ownerOf(tokenId)
    if (getApproved != reserveAuctionAddress && currentOwner != reserveAuctionAddress) {
      await asCurrentOwnerToken.approve(reserveAuctionAddress, tokenId);
    }

    getApproved = await asCurrentOwnerToken.getApproved(tokenId)
    return asCurrentOwnerWalletAuction.createAuction(paused, tokenId, duration, firstTimeBid, reservePrice, adminSplit, currentOwnerWallet.address)

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

  describe.skip('#constructor', () => {
    it('should be able to deploy', async () => {
      await expect(deploy()).eventually.fulfilled;
    });
  });


  describe.skip('#auction mundane', () => {
    beforeEach(async () => {
      await deploy();
    });

    it('only owner can update contract address', async () => {
      const auctionAsCreator = await auctionAs(creatorWallet)
      const auctionAsDeployer = await auctionAs(deployerWallet)

      const token = await (
        await new TestTokenFactory(creatorWallet).deploy()
      ).deployed();

      await expect(
        auctionAsCreator.updateNftAddress(token.address)
        ).rejected
        // ).rejectedWith('Ownable: caller is not the owner')

      await expect(
        auctionAsDeployer.updateNftAddress(token.address)
      ).fulfilled
    })

    it('only valid TestToken can be contract address', async () => {
      const auctionAsDeployer = await auctionAs(deployerWallet)

      await expect(
        auctionAsDeployer.updateNftAddress(reserveAuctionAddress)
      ).rejected
    })

  })

  describe.skip('#createBid mundane', () => {
      beforeEach(async () => {
        await deploy();
      });

    it(`can't submit an auction that already exists`, async () => {

      const tokenId = await mintToken();

      await setupAuction(tokenId, deployerWallet);

      await expect(
        setupAuction(tokenId, deployerWallet)
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
      await setupAuction(tokenId, deployerWallet);

      await expect(
        auctionAsBidder.createBid(tokenId, {value: reservePrice.div(2)})
      ).rejectedWith(`Must send reservePrice or more`)

    })

    it(`can't bid after auction is expired`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)
      const auctionAsOther = await auctionAs(otherWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, deployerWallet);
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
      await setupAuction(tokenId, deployerWallet);
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
      await setupAuction(tokenId, deployerWallet);
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
      await setupAuction(tokenId, deployerWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice})

      const auctionBefore = await auctionAsBidder.auctions(tokenId)
      const durationBefore = auctionBefore.duration

      const blockBefore = await provider.getBlock(await provider.getBlockNumber())
      const timeBefore = blockBefore.timestamp
      const overTime = 10

      await blockchain.increaseTimeAsync(BigNumber.from(duration).sub(timeBuffer).add(overTime).toNumber())
      await blockchain.waitBlocksAsync(1)

      let blockAfter = await provider.getBlock(await provider.getBlockNumber())
      let timeAfter = blockAfter.timestamp


      expect(timeAfter - timeBefore).eq(BigNumber.from(duration).sub(timeBuffer).add(overTime).toNumber())

      await auctionAsBidder.createBid(tokenId, {value: reservePrice.mul(2)})

      blockAfter = await provider.getBlock(await provider.getBlockNumber())
      let timeAfter2 = blockAfter.timestamp


      const auctionAfter = await auctionAsBidder.auctions(tokenId)
      const durationAfter = auctionAfter.duration

      expect(durationAfter.sub(durationBefore).toString()).eq(BigNumber.from(timeAfter2).sub(timeAfter).add(overTime).toString())

    })
  })


  describe.skip('#endAuction mundane', () => {
    beforeEach(async () => {
      await deploy();
    });

    it(`can't submit an auction that doesn't exist`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, deployerWallet);
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
      await setupAuction(tokenId, deployerWallet);

      await expect(
        auctionAsBidder.endAuction(tokenId)
      ).rejectedWith(`Auction hasn't begun`)

    })

    it(`can't end an auction that hasn't completed`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, deployerWallet);
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



  describe.skip('#cancelAuction mundane', () => {
    beforeEach(async () => {
      await deploy();
    });

    it(`can't submit an auction that doesn't exist`, async () => {
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, deployerWallet);
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
      await setupAuction(tokenId, deployerWallet);

      await expect(
        auctionAsOther.cancelAuction(tokenId)
      ).rejectedWith(`Can only be called by auction creator or owner`)
    })

    it(`can cancel an auction if you're the creator `, async () => {
      const auctionAsCreator = await auctionAs(deployerWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, deployerWallet);

      await expect(
        auctionAsCreator.cancelAuction(tokenId)
      ).fulfilled
    })

    it(`can cancel an auction if you're the owner `, async () => {
      const auctionAsDeployer = await auctionAs(deployerWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, deployerWallet);

      await expect(
        auctionAsDeployer.cancelAuction(tokenId)
      ).fulfilled
    })

    it(`can't cancel an auction once it's begun`, async () => {
      const auctionAsDeployer = await auctionAs(deployerWallet)

      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();
      await setupAuction(tokenId, deployerWallet);
      await auctionAsBidder.createBid(tokenId, {value: reservePrice})

      await expect(
        auctionAsDeployer.cancelAuction(tokenId)
      ).rejectedWith(`Can't cancel an auction once it's begun`)
    })

    it(`can cancel an auction and transfer the token back and delete the auction`, async () => {
      const tokenAsCreator = await tokenAs(deployerWallet)
      const auctionAsDeployer = await auctionAs(deployerWallet)

      const tokenId = await mintToken();
      const ownerBefore = await tokenAsCreator.ownerOf(tokenId)
      await setupAuction(tokenId, deployerWallet);

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
      const token = await tokenAs(deployerWallet);
      const auctionAsBidder = await auctionAs(bidderWallet)

      const tokenId = await mintToken();

      await setupAuction(tokenId, deployerWallet);

      let ownerOf = await token.ownerOf(tokenId);
      expect(ownerOf).eq(reserveAuctionAddress);

      let beforeCreatorBalance = await deployerWallet.getBalance()

      await auctionAsBidder.createBid(tokenId, {value: reservePrice.toString()})
      blockchain.increaseTimeAsync(duration)

      const adminShareBefore = await adminWallet.getBalance()

      const auctionSettings = await auctionAsBidder.auctions(tokenId)

      await auctionAsBidder.endAuction(tokenId)
      ownerOf = await token.ownerOf(tokenId);

      expect(ownerOf).eq(bidderWallet.address);

      let admin  = await auctionAsBidder.admin()

      expect(adminWallet.address.toLowerCase()).eq(admin.toLowerCase(), "admin wallets don't match")

      const adminShare = auctionSettings.amount.mul(auctionSettings.adminSplit).div(100)
      const adminShareAfter = await adminWallet.getBalance()
      expect(adminShareAfter.toString()).eq(adminShareBefore.add(adminShare).toString());

      const creatorShare = reservePrice.sub(adminShare)

      let afterCreatorBalance = await deployerWallet.getBalance()
      expect(afterCreatorBalance.toString()).eq(beforeCreatorBalance.add(creatorShare).toString());

    });


    it('should work when seller is creator of NFT and multiple bids happen', async () => {
      const token = await tokenAs(deployerWallet);
      const auctionAsBidder = await auctionAs(bidderWallet)
      const auctionAsOther = await auctionAs(otherWallet)

      const tokenId = await mintToken();

      await setupAuction(tokenId, deployerWallet);

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

    it('should pass when firstBidTime is set manually', async () => {
      const token = await tokenAs(deployerWallet);
      const auctionAsBidder = await auctionAs(bidderWallet)
      const auctionAsOther = await auctionAs(otherWallet)

      let blockBefore = await provider.getBlock(await provider.getBlockNumber())
      let timeBefore = blockBefore.timestamp

      const tokenId = await mintToken();
      var diff = 5 // minutes
      var firstBidTime = Math.floor((new Date(timeBefore * 1000 + diff * 60000)).getTime() / 1000);

      await setupAuction(tokenId, deployerWallet, firstBidTime);

      // const auctionSettings = await auctionAsBidder.auctions(tokenId)
      // console.log({
      //   firstBidTime: auctionSettings.firstBidTime.toString(),
      //   duration: auctionSettings.duration.toString()
      // })

      await expect(
        auctionAsBidder.createBid(tokenId, {value: reservePrice.toString()})
      ).rejectedWith(`Auction hasn't started`)

      await blockchain.increaseTimeAsync(diff * 60)
      await blockchain.waitBlocksAsync(1)

      let blockAfter = await provider.getBlock(await provider.getBlockNumber())
      // let timeAfter = blockAfter.timestamp

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


    it('should pass when reservePrice is 0', async () => {
    const token = await tokenAs(deployerWallet);
    const auctionAsBidder = await auctionAs(bidderWallet)
      const auctionAsOther = await auctionAs(otherWallet)

      let blockBefore = await provider.getBlock(await provider.getBlockNumber())
      let timeBefore = blockBefore.timestamp

      const tokenId = await mintToken();
      var diff = 5 // minutes
      var firstBidTime = Math.floor((new Date(timeBefore * 1000 + diff * 60000)).getTime() / 1000);
      
      let reservePrice_ = BigNumber.from(0)

      await setupAuction(tokenId, deployerWallet, firstBidTime, reservePrice_);

      // const auctionSettings = await auctionAsBidder.auctions(tokenId)
      // console.log({
      //   firstBidTime: auctionSettings.firstBidTime.toString(),
      //   duration: auctionSettings.duration.toString()
      // })

      await expect(
        auctionAsBidder.createBid(tokenId, {value: reservePrice_.toString()})
      ).rejectedWith(`Auction hasn't started`)

      await blockchain.increaseTimeAsync(diff * 60)
      await blockchain.waitBlocksAsync(1)

      let blockAfter = await provider.getBlock(await provider.getBlockNumber())
      // let timeAfter = blockAfter.timestamp

      await auctionAsBidder.createBid(tokenId, {value: reservePrice_.toString()})


      await auctionAsOther.createBid(tokenId, {value: reservePrice_.toString()})

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

  });

});
