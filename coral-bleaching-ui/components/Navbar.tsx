"use client";

import { Box, Flex, HStack, Text, Link as ChakraLink, Container, Icon } from "@chakra-ui/react";
import Link from "next/link";
import { Waves } from "lucide-react";

export default function Navbar() {
  return (
    <Box
      as="nav"
      bg="white"
      position="sticky"
      top={0}
      zIndex={1000}
      shadow="sm"
      borderBottom="1px solid"
      borderColor="gray.200"
    >
      <Container maxW="7xl" py={4}>
        <Flex justify="space-between" align="center">
          {/* Logo / Title */}
          <HStack spacing={2} as={Link} href="/" _hover={{ textDecoration: "none" }}>
            <Icon as={Waves} w={8} h={8} color="cyan.600" />
            <Text
              fontSize="xl"
              fontWeight="extrabold"
              bgGradient="linear(to-r, cyan.600, blue.600, teal.600)"
              bgClip="text"
              letterSpacing="tight"
            >
              Coral Bleaching Detection
            </Text>
          </HStack>

          {/* Nav Links */}
          <HStack spacing={8}>
            <ChakraLink
              as={Link}
              href="/"
              fontWeight="semibold"
              color="gray.700"
              _hover={{ color: "cyan.600" }}
              transition="color 0.2s"
            >
              Home
            </ChakraLink>
            <ChakraLink
              as={Link}
              href="/results"
              fontWeight="semibold"
              color="gray.700"
              _hover={{ color: "cyan.600" }}
              transition="color 0.2s"
            >
              Results
            </ChakraLink>
            <ChakraLink
              as={Link}
              href="/about"
              fontWeight="semibold"
              color="gray.700"
              _hover={{ color: "cyan.600" }}
              transition="color 0.2s"
            >
              About
            </ChakraLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}