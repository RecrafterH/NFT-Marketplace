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
    "0x36335BD3DF379b1C3Fe163575665F9209F1F5921",
    owner
  );

  console.log("Minting...");
  const mintNft = await basicNft.mintNft();
  const mintTxReceipt = await mintNft.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;
  console.log(tokenId);
  console.log("Approving Nft...");

  const approveTx = await basicNft.approve(nftMarketplace.address, tokenId);
  await approveTx.wait(1);
  console.log("Listing NFT...");
  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, price);
  await tx.wait(1);
  console.log("Listed!");
};

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
