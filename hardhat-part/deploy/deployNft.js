const { ethers } = require("hardhat");

const main = async () => {
  const BasicNftContract = await ethers.getContractFactory("BasicNftTwo");
  const basicNftContract = await BasicNftContract.deploy();
  await basicNftContract.deployed();
  console.log("NFT deployed at :", basicNftContract.address);
};

//NFT deployed at : 0xE7Bb3BCd008d210F6Edd88293358c98913bD2C09

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
