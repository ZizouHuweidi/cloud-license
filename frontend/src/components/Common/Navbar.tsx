import { Flex, Link as ChakraLink, useBreakpointValue } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Link } from "@tanstack/react-router";

import UserMenu from "./UserMenu";

function Navbar() {
  const display = useBreakpointValue({ base: "none", md: "flex" });

  return (
    <Flex
      display={display}
      justify="space-between"
      position="sticky"
      color="white"
      align="center"
      bg="bg.muted"
      w="100%"
      top={0}
      p={4}
    >
      <Flex gap={4} alignItems="center">
        <Link to="dashboard">
          <ChakraLink color={useColorModeValue('gray.200', 'white')}>Dashboard</ChakraLink>
        </Link>
        <Link to="devices">
          <ChakraLink color={useColorModeValue('gray.200', 'white')}>Devices</ChakraLink>
        </Link>
        <Link to="licenses">
          <ChakraLink color={useColorModeValue('gray.200', 'white')}>Licenses</ChakraLink>
        </Link>
      </Flex>
      <UserMenu />
    </Flex>
  );
}

export default Navbar;
