import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";
import Image from "next/image";
import { Card, useNotification } from "web3uikit";
import { ethers, formatEther } from "ethers";
//import { formatEther } from "ethers/lib/utils";

import { Box, Text, Button } from "@chakra-ui/react";
import Link from "next/link";
import UpdateListingModal from "./UpdateListingModal";

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = "...";
  const seperatorLength = separator.length;
  const charsToShow = strLen - seperatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};

export default function NFTInfo({
  price,
  nftAddress,
  tokenId,
  marketplaceAddress,
  seller,
}) {
  const { isWeb3Enabled, account } = useMoralis();
  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  });
  const [imageURI, setImageURI] = useState("");
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);
  const dispatch = useNotification();
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");

  async function updateUI() {
    const tokenURI = await getTokenURI();
    console.log(`The TokenURI is ${tokenURI}`);
    // We are going to cheat a little here...
    if (tokenURI) {
      // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
      const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      const tokenURIResponse = await (await fetch(requestURL)).json();
      const imageURI = tokenURIResponse.image;
      const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      setImageURI(imageURIURL);
      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
      // We could render the Image on our sever, and just call our sever.
      // For testnets & mainnet -> use moralis server hooks
      // Have the world adopt IPFS
      // Build our own IPFS gateway
    }
    // get the tokenURI
    // using the image tag from the tokenURI, get the image
  }

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  });

  const { runContractFunction: cancelItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "cancelListing",
    params: { nftAddress: nftAddress, tokenId: tokenId },
  });

  const isOwnedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = isOwnedByUser ? "you" : seller;

  const handleButtonClick = () => {
    console.log("lol");
    isOwnedByUser
      ? setShowModal(true)
      : buyItem({
          onError: (error) => console.log(error),
          onSuccess: () => handleBuyItemSuccess(),
        });
  };

  const handleCancelClick = () => {
    isOwnedByUser
      ? cancelItem({
          onError: (error) => console.log(error),
          onSuccess: () => handleCancelItemSuccess(),
        })
      : console.log("You are not the owner of this NFT");
  };

  const handleBuyItemSuccess = () => {
    dispatch({
      type: "success",
      message: "Item bought!",
      title: "Item Bought",
      position: "topR",
    });
  };

  const handleCancelItemSuccess = () => {
    dispatch({
      type: "success",
      message: "Item canceled!",
      title: "Item canceled",
      position: "topR",
    });
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <Box>
      {imageURI ? (
        <Box display="flex" flexDir="row" minWidth="60%" margin=" 0 2%">
          <UpdateListingModal
            isVisible={showModal}
            tokenId={tokenId}
            marketplaceAddress={marketplaceAddress}
            nftAddress={nftAddress}
            onClose={hideModal}
          />

          <Card
            width="100px"
            /* onClick={handleCardClick} */
          >
            <Box
              padding="20px"
              display="flex"
              flexDir="row"
              justifyContent="center"
            >
              <Box>
                <Image
                  loader={() => imageURI}
                  src={imageURI}
                  height="200"
                  width="200"
                />
              </Box>
            </Box>
          </Card>
          <Box
            background="linear-gradient(45deg, #cad3f2, #e6e9ff)"
            minWidth="60%"
            marginLeft="100px"
            padding="20px"
            borderRadius="12px"
          >
            <Text margin="20px">Name: {tokenName}</Text>
            <Text margin="20px">Address: {nftAddress}</Text>
            <Text margin="20px">Token ID: {tokenId}</Text>
            <Text margin="20px">Owned by {formattedSellerAddress}</Text>
            <Text margin="20px">Description: {tokenDescription}</Text>
            <Text fontWeight="bold" margin="20px">
              {formatEther(price.toString())} ETH
            </Text>
            {isOwnedByUser ? (
              <Box display="flex" justifyContent="space-between" margin="30px">
                <Button backgroundColor="#9680ff" onClick={handleButtonClick}>
                  Change price
                </Button>{" "}
                <Button backgroundColor="#9680ff" onClick={handleCancelClick}>
                  Cancel Listing
                </Button>
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" margin="30px">
                <Button backgroundColor="#9680ff" onClick={handleButtonClick}>
                  Buy NFT
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box>Loading...</Box>
      )}
    </Box>
  );
}
