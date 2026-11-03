"use client";

import { Box, Container, HStack, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";

export default function Footer() {
  return <Box as="footer" bg="white" borderTopWidth="1px" py={6} mt="auto"><Container maxW="6xl"><HStack justify="space-between" flexWrap="wrap" gap={3}>
    <Text color="gray.600">Coral Bleaching Project · Evidence and estimates</Text>
    <HStack spacing={5}><Link as={NextLink} href="/about">Methods and limits</Link><Link as={NextLink} href="/results">Results</Link><Link href="https://github.com/dhirj-ngm/CoralBleachingProject" isExternal>Source</Link></HStack>
  </HStack></Container></Box>;
}
