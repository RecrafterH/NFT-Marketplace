import Image from "next/image";
import { useMoralisQuery, useMoralis } from "react-moralis";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import NFTInfo from "@/components/NFTInfo";
import networkMapping from "../../..//constants/networkMapping.json";
import GET_SINGLE_ITEMS from "@/constants/SingleQueries";
import { useQuery } from "@apollo/client";
import { Box, Heading, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function NFTDetails() {
  const [currentPath, setCurrentPath] = useState("");
  const dataArray = currentPath.split("/");
  const nftAddress = dataArray[2] || "0";
  const tokenId = dataArray[3] || "0";

  const { chainId, isWeb3Enabled, account } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : null;
  const marketplaceAddress = chainId
    ? networkMapping[chainString].NftMarketplace[0]
    : null;
  const {
    loading,
    error,
    data: activeItems,
  } = useQuery(GET_SINGLE_ITEMS, {
    variables: { nftAddress: nftAddress, tokenId: tokenId },
  });

  useEffect(() => {
    // Update the document title using the browser API
    console.log(window.location.pathname);
    setCurrentPath(window.location.pathname);
  });
  return (
    <Box display="flex" flexDir="column" margin="5%">
      {isWeb3Enabled && chainId ? (
        loading || !activeItems ? (
          <div>Loading...</div>
        ) : (
          activeItems.itemListeds.map((nft) => {
            const { price, nftAddress, tokenId, seller } = nft;
            return marketplaceAddress ? (
              <NFTInfo
                price={price}
                nftAddress={nftAddress}
                tokenId={tokenId}
                marketplaceAddress={marketplaceAddress}
                seller={seller}
                key={`${nftAddress}${tokenId}`}
              />
            ) : (
              <div>Network error, please switch to a supported network. </div>
            );
          })
        )
      ) : (
        <div>Web3 Currently Not Enabled</div>
      )}
    </Box>
  );
}
