const { ethers, network } = require("hardhat");
const fs = require("fs");

const frontEndContractsFile =
  "../frontend-nft-marketplace/constants/networkMapping.json";
const frontEndAbiLocation = "../frontend-nft-marketplace/constants/";

const main = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("updating front end...");
    await updateContractAddresses();
    await updateABI();
  }
};

async function updateABI() {
  const [owner] = await ethers.getSigners();
  const nftMarketplace = await ethers.getContractAt(
    "NftMarketplace",
    0x4c950387d39c00d1608baebe3c8e5f9ab4462947,
    owner
  );
  fs.writeFileSync(
    `${frontEndAbiLocation}NftMarketplace.json`,
    nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
  );

  const basicNft = await ethers.getContractAt(
    "BasicNft",
    0xfbaf1a98af4cfc8cb32bd3b6cfad818cb7121de1,
    owner
  );
  fs.writeFileSync(
    `${frontEndAbiLocation}BasicNft.json`,
    basicNft.interface.format(ethers.utils.FormatTypes.json)
  );
}

const updateContractAddresses = async () => {
  const [owner] = await ethers.getSigners();
  const NftMarketplace = await ethers.getContractAt(
    "NftMarketplace",
    0x37f7e6f90a155905fcc2f51e125e7d011e2a54d3,
    owner
  );
  const chainId = network.config.chainId.toString();
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]["NftMarketplace"].includes(
        NftMarketplace.address
      )
    ) {
      contractAddresses[chainId]["NftMarketplace"].push(NftMarketplace.address);
    }
  } else {
    contractAddresses[chainId] = { NftMarketplace: [NftMarketplace.address] };
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
