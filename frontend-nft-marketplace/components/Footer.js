import {
  Box,
  Text,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box
      display="flex"
      flexDir="row"
      justifyContent="center"
      padding="20px"
      background="linear-gradient(45deg, #9759c5, #0e052f)"
      color="white"
    >
      <Text>Made by Recrafter Productions</Text>
    </Box>
  );
}
