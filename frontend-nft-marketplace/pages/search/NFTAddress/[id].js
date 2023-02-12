import { Inter } from "@next/font/google";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "@/components/NFTBox";
import { useQuery } from "@apollo/client";
import { Box, Heading, Text } from "@chakra-ui/react";
import networkMapping from "../../../constants/networkMapping.json";
import GET_SEARCHNFT_ITEMS from "@/constants/searchNftQueries";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function MyNfts() {
  const [currentPath, setCurrentPath] = useState("");
  const dataArray = currentPath.split("/");
  const nftAddress = dataArray[3] || "0";

  const { chainId, isWeb3Enabled, account } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : null;
  const marketplaceAddress = chainId
    ? networkMapping[chainString].NftMarketplace[0]
    : null;
  const {
    loading,
    error,
    data: activeItems,
  } = useQuery(GET_SEARCHNFT_ITEMS, {
    variables: { nftAddress: nftAddress },
  });

  useEffect(() => {
    // Update the document title using the browser API
    console.log(window.location.pathname);
    setCurrentPath(window.location.pathname);
  });
  return (
    <Box>
      <Text margin="10px" fontSize="20px" fontWeight="bold">
        Searching for NFT Address: {nftAddress}
      </Text>
      <Box
        display="grid"
        gridTemplateColumns="repeat(5, minmax(0, 1fr))"
        grid-auto-rows="1fr"
      >
        {isWeb3Enabled && chainId ? (
          loading || !activeItems ? (
            <div>Loading...</div>
          ) : (
            activeItems.itemListeds.map((nft) => {
              const { price, nftAddress, tokenId, seller } = nft;
              return marketplaceAddress ? (
                <NFTBox
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
    </Box>
  );
}
