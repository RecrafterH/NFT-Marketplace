import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Form, useNotification } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers, formatEther, parseEther } from "ethers";
import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import networkMapping from "../constants/networkMapping.json";
import { useEffect, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";

export default function Home() {
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : null;
  const marketplaceAddress = chainId
    ? networkMapping[chainString].NftMarketplace[0]
    : null;
  const dispatch = useNotification();
  const [proceeds, setProceeds] = useState("0");

  const { runContractFunction } = useWeb3Contract();

  async function approveAndList(data) {
    console.log("Approving...");
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = parseEther(data.data[2].inputResult).toString();

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId, price),
      onError: (error) => {
        console.log(error);
      },
    });
  }

  async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
    console.log("Ok! Now time to list");
    await tx.wait();
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: () => handleListSuccess(),
      onError: (error) => console.log(error),
    });
  }

  async function handleListSuccess() {
    dispatch({
      type: "success",
      message: "NFT listing",
      title: "NFT listed",
      position: "topR",
    });
  }

  const handleWithdrawSuccess = () => {
    dispatch({
      type: "success",
      message: "Withdrawing proceeds",
      position: "topR",
    });
  };

  const { runContractFunction: withdrawProceeds } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "withdrawProceeds",
    params: {},

    onError: (error) => console.log(error),
    onSuccess: () => handleWithdrawSuccess,
  });

  const handleWithdrawClick = () => {
    console.log("lol");

    withdrawProceeds({
      onError: (error) => console.log(error),
      onSuccess: () => handleWithdrawSuccess,
    });
  };

  async function setupUI() {
    const returnedProceeds = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
      onError: (error) => console.log(error),
    });
    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString());
    }
  }

  useEffect(() => {
    setupUI();
  }, [proceeds, account, isWeb3Enabled, chainId]);

  return (
    <Box
      margin="5%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDir="column"
    >
      <Box
        border="solid 1px black"
        padding="10px"
        borderRadius="12px"
        marginBottom="50px"
      >
        <Form
          onSubmit={approveAndList}
          data={[
            {
              name: "NFT Address",
              type: "text",
              inputWidth: "50%",
              value: "",
              key: "nftAddress",
            },
            {
              name: "Token ID",
              type: "number",
              value: "",
              key: "tokenId",
            },
            {
              name: "Price (in ETH)",
              type: "number",
              value: "",
              key: "price",
            },
          ]}
          title="Sell your NFT!"
          id="Main Form"
        />
      </Box>
      <div>Withdraw {formatEther(proceeds)} ETH proceeds</div>
      {proceeds != "0" ? (
        <Button margin="30px" onClick={handleWithdrawClick}>
          Withdraw
        </Button>
      ) : (
        <Text margin="30px">No proceeds detected</Text>
      )}
    </Box>
  );
}
