import {
  Box,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { ConnectButton } from "web3uikit";
import { HamburgerIcon } from "@chakra-ui/icons";
import Link from "next/link";

export default function Header() {
  return (
    <Box
      display="flex"
      flexDir="row"
      justifyContent="space-between"
      padding="20px"
      background="linear-gradient(45deg, #efe6fd, #a553c8)"
    >
      <Heading>NFT Marketplace</Heading>
      <Box display="flex" flexDir="row">
        <Box marginRight="20px">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="outline"
            />
            <MenuList>
              <Link key={"/"} href={"/"} passHref legacyBehavior>
                <a>
                  <MenuItem>Home</MenuItem>
                </a>
              </Link>
              <Link key={"/MyNfts"} href={"/MyNfts"} passHref legacyBehavior>
                <a>
                  <MenuItem>My NFTs</MenuItem>
                </a>
              </Link>

              <Link
                key={"/sell-nfts"}
                href={"/sell-nft"}
                passHref
                legacyBehavior
              >
                <a>
                  <MenuItem>Sell NFTs</MenuItem>
                </a>
              </Link>

              <MenuItem>Comming soon...</MenuItem>
            </MenuList>
          </Menu>
        </Box>

        <ConnectButton moralisAuth={false} />
      </Box>
    </Box>
  );
}
