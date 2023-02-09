import { Box, Heading } from "@chakra-ui/react";
import { ConnectButton } from "web3uikit";

export default function Header() {
  return (
    <Box
      display="flex"
      flexDir="row"
      justifyContent="space-between"
      padding="20px"
      background="linear-gradient(45deg, #9caff1, #84d4d1)"
    >
      <Heading>NFT Marketplace</Heading>
      <ConnectButton moralisAuth={false} />
    </Box>
  );
}
