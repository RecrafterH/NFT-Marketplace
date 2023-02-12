const { ethers } = require("hardhat");

const main = async () => {
  const MarketplaceContract = await ethers.getContractFactory("NftMarketplace");
  const marketplaceContract = await MarketplaceContract.deploy();
  await marketplaceContract.deployed();
  console.log("Contract deployed at: ", marketplaceContract.address);

  const BasicNftContract = await ethers.getContractFactory("BasicNft");
  const basicNftContract = await BasicNftContract.deploy();
  await basicNftContract.deployed();
  console.log("NFT deployed at :", basicNftContract.address);
};

//Contract deployed at:  0x4c950387D39c00d1608BaebE3c8E5F9ab4462947
//NFT deployed at : 0x0b55bddc116dcf52bb4fcbb70b5d7367810ef0cc

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
