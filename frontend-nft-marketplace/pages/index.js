import Image from "next/image";
import { useMoralisQuery, useMoralis } from "react-moralis";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import NFTBox from "@/components/NFTBox";
import networkMapping from "../constants/networkMapping.json";
import GET_ACITVE_ITEMS from "@/constants/subgraphQueries";
import { useQuery } from "@apollo/client";
import { Box, Heading } from "@chakra-ui/react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { chainId, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : null;
  const marketplaceAddress = chainId
    ? networkMapping[chainString].NftMarketplace[0]
    : null;
  const { loading, error, data: listedNfts } = useQuery(GET_ACITVE_ITEMS);
  return (
    <Box>
      <Heading>Recently Listed</Heading>
      <Box display="flex">
        {isWeb3Enabled && chainId ? (
          loading || !listedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts.activeItems.map((nft) => {
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
