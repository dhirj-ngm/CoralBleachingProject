"use client";

import { Box, Container, Text, HStack, Icon, VStack, Flex } from "@chakra-ui/react";
import { Heart, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      py={12}
      mt="auto"
    >
      <Container maxW="7xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          gap={6}
        >
          {/* Left - Branding */}
          <VStack align={{ base: "center", md: "start" }} spacing={2}>
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              Coral Bleaching Detection
            </Text>
            <HStack spacing={1} fontSize="sm" color="gray.600">
              <Text>Made with</Text>
              <Icon as={Heart} w={4} h={4} color="red.500" />
              <Text>for Coral Conservation</Text>
            </HStack>
          </VStack>

          {/* Center - Links */}
          <HStack spacing={8} fontSize="sm">
            <Text
              color="gray.600"
              _hover={{ color: "cyan.600", cursor: "pointer" }}
              transition="color 0.2s"
            >
              Documentation
            </Text>
            <Text
              color="gray.600"
              _hover={{ color: "cyan.600", cursor: "pointer" }}
              transition="color 0.2s"
            >
              Research Paper
            </Text>
            <Text
              color="gray.600"
              _hover={{ color: "cyan.600", cursor: "pointer" }}
              transition="color 0.2s"
            >
              Contact
            </Text>
          </HStack>

          {/* Right - Social Icons */}
          <HStack spacing={4}>
            <Flex
              w={10}
              h={10}
              bg="gray.100"
              borderRadius="lg"
              align="center"
              justify="center"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ bg: "cyan.100", color: "cyan.600" }}
            >
              <Icon as={Github} w={5} h={5} />
            </Flex>
            <Flex
              w={10}
              h={10}
              bg="gray.100"
              borderRadius="lg"
              align="center"
              justify="center"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ bg: "cyan.100", color: "cyan.600" }}
            >
              <Icon as={Mail} w={5} h={5} />
            </Flex>
          </HStack>
        </Flex>

        {/* Bottom - Copyright */}
        <Text
          textAlign="center"
          fontSize="sm"
          color="gray.500"
          mt={8}
          pt={6}
          borderTop="1px solid"
          borderColor="gray.200"
        >
          © {new Date().getFullYear()} Coral Bleaching Detection. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}