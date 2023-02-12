import Image from "next/image";
import { useMoralisQuery, useMoralis } from "react-moralis";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import NFTBox from "@/components/NFTBox";
import networkMapping from "../constants/networkMapping.json";
import GET_ACITVE_ITEMS from "@/constants/subgraphQueries";
import { useQuery } from "@apollo/client";
import { Box, Heading, Input, Select, Button } from "@chakra-ui/react";
import GET_SEARCH_ITEMS from "@/constants/searchNftQueries";
import { useState } from "react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [radioInput, setRadioInput] = useState("NFTAddress");

  const { chainId, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : null;
  const marketplaceAddress = chainId
    ? networkMapping[chainString].NftMarketplace[0]
    : null;
  const { loading, error, data: listedNfts } = useQuery(GET_ACITVE_ITEMS);

  return (
    <Box>
      {" "}
      <Box
        display="flex"
        flexDir="row"
        background="linear-gradient(45deg, #efe6fd, #a553c8"
      >
        <Select
          margin="20px"
          maxWidth="200px"
          placeholder="select option"
          onChange={(e) => setRadioInput(e.target.value)}
        >
          <option value="Seller">Seller Address</option>
          <option value="NFTAddress">NFT Address</option>
        </Select>
        <Input
          margin="20px"
          id="nftSearchValue"
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Link
          key={"/"}
          href={`/search/${radioInput}/${searchInput}`}
          passHref
          legacyBehavior
        >
          <a>
            <Button margin="20px">Search</Button>
          </a>
        </Link>
      </Box>
      <Heading margin="30px">Recently Listed</Heading>
      <Box
        display="grid"
        gridTemplateColumns="repeat(5, minmax(0, 1fr))"
        grid-auto-rows="1fr"
      >
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
