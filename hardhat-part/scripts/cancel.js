const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const price = parseEther("0.012");

const mintAndList = async () => {
  const [owner] = await ethers.getSigners();

  const nftMarketplace = await ethers.getContractAt(
    "NftMarketplace",
    "0x4c950387d39c00d1608baebe3c8e5f9ab4462947",
    owner
  );

  const basicNft = await ethers.getContractAt(
    "BasicNftTwo",
    "0xE7Bb3BCd008d210F6Edd88293358c98913bD2C09",
    owner
  );

  console.log("Cancel NFT...");
  const tx = await nftMarketplace.cancelListing(basicNft.address, 0);
  await tx.wait(1);
  console.log("Canceled!");
};

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
