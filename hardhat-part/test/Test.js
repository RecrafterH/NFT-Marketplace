const { expect } = require("chai");
const { parseEther, formatEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("unit tests", async () => {
  let MarketplaceContract,
    marketplaceContract,
    NFTContract,
    nftContract,
    SecondNFTContract,
    secondNftContract;
  beforeEach(async () => {
    MarketplaceContract = await ethers.getContractFactory("NftMarketplace");
    marketplaceContract = await MarketplaceContract.deploy();
    await marketplaceContract.deployed();

    NFTContract = await ethers.getContractFactory("BasicNft");
    nftContract = await NFTContract.deploy();
    await nftContract.deployed();

    await nftContract.mintNft();
  });
  describe("listItem", () => {
    it("Revert if the seller sets a price at 0", async () => {
      await expect(
        marketplaceContract.listItem(nftContract.address, 0, 0)
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__PriceMustBeAboveZero"
      );
    });
    it("Reverts if the seller is not the owner", async () => {
      const [owner, user1] = await ethers.getSigners();
      await expect(
        marketplaceContract.connect(user1).listItem(nftContract.address, 0, 0)
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__NotOwner"
      );
    });
    it("Reverts if the nft is not approved", async () => {
      await expect(
        marketplaceContract.listItem(nftContract.address, 0, parseEther("1"))
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__NotApprovedForMarketplace"
      );
    });
    it("Lets the seller list a NFT", async () => {
      await nftContract.approve(marketplaceContract.address, 0);
      await expect(
        marketplaceContract.listItem(nftContract.address, 0, parseEther("1"))
      ).to.emit(marketplaceContract, "ItemListed");
    });
    it("Reverts when the seller tries to list the nft twice", async () => {
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1")
      );
      await expect(
        marketplaceContract.listItem(nftContract.address, 0, parseEther("1"))
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__alreadyListed"
      );
    });
  });
  describe("cancelListing", () => {
    it("Will revert if the item is not listed", async () => {
      await expect(
        marketplaceContract.cancelListing(nftContract.address, 0)
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__NotListed"
      );
    });
    it("Reverts if someone but the owner call", async () => {
      const [owner, user1] = await ethers.getSigners();
      await expect(
        marketplaceContract.connect(user1).cancelListing(nftContract.address, 0)
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__NotOwner"
      );
    });
    it("Emits an event if the listing is cancelled", async () => {
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1")
      );
      await expect(
        marketplaceContract.cancelListing(nftContract.address, 0)
      ).to.emit(marketplaceContract, "ItemCanceled");
    });
  });
  describe("updateListing", async () => {
    it("Will revert if the nft is not listed", async () => {
      await expect(
        marketplaceContract.updateListing(
          nftContract.address,
          0,
          parseEther("2")
        )
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__NotListed"
      );
    });
    it("Reverts if someone but the owner call", async () => {
      const [owner, user1] = await ethers.getSigners();
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1")
      );
      await expect(
        marketplaceContract
          .connect(user1)
          .updateListing(nftContract.address, 0, parseEther("2"))
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__NotOwner"
      );
    });
    it("Updates the price", async () => {
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1")
      );
      await marketplaceContract.updateListing(
        nftContract.address,
        0,
        parseEther("2")
      );
      const listing = await marketplaceContract.getListing(
        nftContract.address,
        0
      );
      const price = formatEther(listing.price.toString());
      await expect(price.toString()).to.equal("2.0");
    });
  });
  describe("buyItem", () => {
    it("Reverts if the nft is not listed", async () => {
      await expect(
        marketplaceContract.buyItem(nftContract.address, 0)
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__NotListed"
      );
    });
    it("Reverts if the buyer will not send enough money", async () => {
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1")
      );
      await expect(
        marketplaceContract.buyItem(nftContract.address, 0, {
          value: parseEther("0.5"),
        })
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__PriceNotMet"
      );
    });
    it("Emits an event if the buyer bought the nft", async () => {
      const [owner, user1] = await ethers.getSigners();
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1")
      );
      await expect(
        marketplaceContract.connect(user1).buyItem(nftContract.address, 0, {
          value: parseEther("1"),
        })
      ).to.emit(marketplaceContract, "ItemBought");
    });
    it("Will increase the balance of the seller", async () => {
      const [owner, user1] = await ethers.getSigners();
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1")
      );

      await marketplaceContract.connect(user1).buyItem(nftContract.address, 0, {
        value: parseEther("1"),
      });

      const number = formatEther(
        (await marketplaceContract.getProceeds(owner.address)).toString()
      );
      await expect(number.toString()).to.equal("0.98");
    });
    it("Will send the nft to the new owner", async () => {
      const [owner, user1] = await ethers.getSigners();
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1")
      );

      await marketplaceContract.connect(user1).buyItem(nftContract.address, 0, {
        value: parseEther("1"),
      });
      const newOwner = await nftContract.ownerOf(0);
      await expect(newOwner).to.equal(user1.address);
    });
  });
  describe("withdrawProceeds", async () => {
    it("Will revert if the proceed balance is 0", async () => {
      await expect(
        marketplaceContract.withdrawProceeds()
      ).to.revertedWithCustomError(
        marketplaceContract,
        "NftMarketplace__NoProceeds"
      );
    });
    it("Will let the seller withdraw his balance", async () => {
      const [owner, user1] = await ethers.getSigners();
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1")
      );
      const oldBalance = formatEther(
        (await ethers.provider.getBalance(owner.address)).toString()
      );
      await marketplaceContract.connect(user1).buyItem(nftContract.address, 0, {
        value: parseEther("1"),
      });
      await marketplaceContract.withdrawProceeds();
      const newBalance = formatEther(
        (await ethers.provider.getBalance(owner.address)).toString()
      );
      let number = Math.round((newBalance - oldBalance) * 10000) / 10000;
      await expect(number).to.equal(0.98);
    });
  });
  describe("setCollectionRoyalties", () => {
    it("Lets set the collection royalties", async () => {
      const [owner, user1, user2] = await ethers.getSigners();
      await marketplaceContract.setCollectionRoyalties(
        user1.address,
        nftContract.address,
        1000
      );
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1000")
      );

      await marketplaceContract.connect(user2).buyItem(nftContract.address, 0, {
        value: parseEther("1000"),
      });

      let balance = await marketplaceContract.getProceeds(user1.address);
      balance = formatEther(balance.toString());
      expect(balance.toString()).to.equal("100.0");
    });
    it("allows only the owner to set a royalty", async () => {
      const [owner, user1] = await ethers.getSigners();
      await expect(
        marketplaceContract
          .connect(user1)
          .setCollectionRoyalties(user1.address, nftContract.address, 1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Won't let us set a royalty over 10000", async () => {
      const [owner, user1] = await ethers.getSigners();
      await expect(
        marketplaceContract.setCollectionRoyalties(
          user1.address,
          nftContract.address,
          10001
        )
      ).to.be.revertedWith("Royalty must be below 10001");
    });
  });
  describe("updateCollectionRoyalities", () => {
    it("Lets only the owner update call the function", async () => {
      const [owner, user1] = await ethers.getSigners();
      await marketplaceContract.setCollectionRoyalties(
        user1.address,
        nftContract.address,
        1000
      );
      await expect(
        marketplaceContract
          .connect(user1)
          .updateCollectionRoyalities(user1.address, nftContract.address, 2000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should revert if there is no royalty set", async () => {
      const [owner, user1] = await ethers.getSigners();
      await expect(
        marketplaceContract.updateCollectionRoyalities(
          user1.address,
          nftContract.address,
          2000
        )
      ).to.be.revertedWith("There is no royalty set");
    });
    it("Should revert if royalty is below 10001", async () => {
      const [owner, user1] = await ethers.getSigners();
      await marketplaceContract.setCollectionRoyalties(
        user1.address,
        nftContract.address,
        1000
      );
      await expect(
        marketplaceContract.updateCollectionRoyalities(
          user1.address,
          nftContract.address,
          10100
        )
      ).to.be.revertedWith("Royalty must be below 10001");
    });
    it("Lets the owner update the royalty", async () => {
      const [owner, user1, user2] = await ethers.getSigners();
      await marketplaceContract.setCollectionRoyalties(
        user1.address,
        nftContract.address,
        1000
      );
      await marketplaceContract.updateCollectionRoyalities(
        user1.address,
        nftContract.address,
        2000
      );
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1000")
      );
      await marketplaceContract.connect(user2).buyItem(nftContract.address, 0, {
        value: parseEther("1000"),
      });
      let balance = await marketplaceContract.getProceeds(user1.address);
      balance = formatEther(balance.toString());
      await expect(balance.toString()).to.equal("200.0");
    });
  });
  describe("withdrawFees", () => {
    it("Reverts if someone but the owner tries to withdraw the fees", async () => {
      const [owner, user1] = await ethers.getSigners();
      await expect(
        marketplaceContract.connect(user1).withdrawFees()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should revert if there are no fees to withdraw", async () => {
      await expect(marketplaceContract.withdrawFees()).to.be.revertedWith(
        "The balance is 0"
      );
    });
    it("Lets the owner withdraw the fees", async () => {
      const [owner, user1, user2] = await ethers.getSigners();
      const balanceOld = await ethers.provider.getBalance(owner.address);
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1000")
      );
      await marketplaceContract.connect(user2).buyItem(nftContract.address, 0, {
        value: parseEther("1000"),
      });
      await marketplaceContract.withdrawFees();
      const balanceNew = await ethers.provider.getBalance(owner.address);
      const balance = formatEther((balanceNew - balanceOld).toString());
      await expect(Math.round(Number(balance))).to.equal(20);
    });
  });
  describe("upateFee", () => {
    it("Revert if someone but the owner calls the function", async () => {
      const [owner, user1] = await ethers.getSigners();
      await expect(
        marketplaceContract.connect(user1).updateFee(100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Reverts if the fee is above 1000", async () => {
      await expect(marketplaceContract.updateFee(1001)).to.be.revertedWith(
        "Fee must be below 1001"
      );
    });
    it("Lets the owner update the fee", async () => {
      const [owner, user1, user2] = await ethers.getSigners();
      const balanceOld = await ethers.provider.getBalance(owner.address);
      await nftContract.approve(marketplaceContract.address, 0);
      await marketplaceContract.listItem(
        nftContract.address,
        0,
        parseEther("1000")
      );
      await marketplaceContract.updateFee(100);
      await marketplaceContract.connect(user2).buyItem(nftContract.address, 0, {
        value: parseEther("1000"),
      });
      let balance = await marketplaceContract.getCollectedFees();
      balance = formatEther(balance.toString());
      await expect(balance).to.equal("100.0");
    });
  });
});
