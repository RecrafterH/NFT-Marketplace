import { Inter } from "@next/font/google";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "@/components/NFTBox";
import { useQuery } from "@apollo/client";
import { Box, Heading } from "@chakra-ui/react";
import GET_My_ITEMS from "@/constants/MyQueries";
import networkMapping from "../../constants/networkMapping.json";

const inter = Inter({ subsets: ["latin"] });

export default function MyNfts() {
  const { chainId, isWeb3Enabled, account } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : null;
  const marketplaceAddress = chainId
    ? networkMapping[chainString].NftMarketplace[0]
    : null;
  const {
    loading,
    error,
    data: activeItems,
  } = useQuery(GET_My_ITEMS, { variables: { user: account } });
  return (
    <Box>
      <Heading>My NFTS</Heading>
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
