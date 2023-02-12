const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const main = async () => {
  const BasicNftContract = await ethers.getContractFactory("BasicNftThree");
  const basicNftContract = await BasicNftContract.deploy();
  await basicNftContract.deployed();
  console.log("NFT deployed at :", basicNftContract.address);

  const mintNft = await basicNftContract.requestNft({
    value: parseEther("0.01"),
  });
  const mintTxReceipt = await mintNft.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;
  console.log(tokenId);
};

//NFT deployed at : 0xD7971C48A3dB12038D42545269928EC943acda12

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
