"use client";

import {
  Box,
  Container,
  Text,
  HStack,
  Icon,
  VStack,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  Link as ChakraLink,
  Divider,
} from "@chakra-ui/react";
import { Heart, Github, Mail, FileText, MapPin, Phone, ExternalLink } from "lucide-react";

export default function Footer() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
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
                as="a"
                href="\MiniProjectReport.pdf"
                target="_blank"
                rel="noopener noreferrer"
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
                onClick={onOpen}
              >
                Contact Us
              </Text>
              <Text
                as="a"
                href="https://github.com/dhirj-ngm/CoralBleachingProject"
                target="_blank"
                rel="noopener noreferrer"
                color="gray.600"
                _hover={{ color: "cyan.600", cursor: "pointer" }}
                transition="color 0.2s"
              >
                GitHub
              </Text>
            </HStack>

            {/* Right - Social Icons */}
            <HStack spacing={4}>
              <Flex
                as="a"
                href="https://github.com/dhirj-ngm/CoralBleachingProject"
                target="_blank"
                rel="noopener noreferrer"
                w={10}
                h={10}
                bg="gray.100"
                borderRadius="lg"
                align="center"
                justify="center"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ bg: "cyan.100", color: "cyan.600", transform: "translateY(-2px)" }}
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
                _hover={{ bg: "cyan.100", color: "cyan.600", transform: "translateY(-2px)" }}
                onClick={onOpen}
              >
                <Icon as={Mail} w={5} h={5} />
              </Flex>
              <Flex
                as="a"
                href="/research-paper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                w={10}
                h={10}
                bg="gray.100"
                borderRadius="lg"
                align="center"
                justify="center"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ bg: "cyan.100", color: "cyan.600", transform: "translateY(-2px)" }}
              >
                <Icon as={FileText} w={5} h={5} />
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

      {/* Contact Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader
            bgGradient="linear(to-r, cyan.500, blue.500)"
            color="white"
            fontSize="2xl"
            fontWeight="bold"
          >
            Get In Touch
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* Location */}
              <Box
                p={4}
                bg="gray.50"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                transition="all 0.2s"
                _hover={{ borderColor: "cyan.300", shadow: "md" }}
              >
                <HStack spacing={4} align="start">
                  <Flex
                    w={12}
                    h={12}
                    bg="cyan.100"
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={MapPin} w={6} h={6} color="cyan.600" />
                  </Flex>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="semibold" color="gray.800">
                      Location
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Chinmaya Vishwa Vidyapeeth
                    </Text>
                    <ChakraLink
                      href="https://www.google.com/maps/search/Chinmaya+Vishwa+Vidyapeeth"
                      target="_blank"
                      rel="noopener noreferrer"
                      fontSize="sm"
                      color="cyan.600"
                      _hover={{ color: "cyan.700", textDecoration: "underline" }}
                    >
                      <HStack spacing={1}>
                        <Text>View on Map</Text>
                        <Icon as={ExternalLink} w={3} h={3} />
                      </HStack>
                    </ChakraLink>
                  </VStack>
                </HStack>
              </Box>

              {/* Email */}
              <Box
                p={4}
                bg="gray.50"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                transition="all 0.2s"
                _hover={{ borderColor: "cyan.300", shadow: "md" }}
              >
                <HStack spacing={4} align="start">
                  <Flex
                    w={12}
                    h={12}
                    bg="blue.100"
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={Mail} w={6} h={6} color="blue.600" />
                  </Flex>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="semibold" color="gray.800">
                      Email
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      miniprojectcvv01@gmail.com
                    </Text>
                    <ChakraLink
                      href="mailto:miniprojectcvv01@gmail.com"
                      fontSize="sm"
                      color="blue.600"
                      _hover={{ color: "blue.700", textDecoration: "underline" }}
                    >
                      <HStack spacing={1}>
                        <Text>Send Email</Text>
                        <Icon as={ExternalLink} w={3} h={3} />
                      </HStack>
                    </ChakraLink>
                  </VStack>
                </HStack>
              </Box>

              {/* GitHub */}
              <Box
                p={4}
                bg="gray.50"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                transition="all 0.2s"
                _hover={{ borderColor: "cyan.300", shadow: "md" }}
              >
                <HStack spacing={4} align="start">
                  <Flex
                    w={12}
                    h={12}
                    bg="purple.100"
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={Github} w={6} h={6} color="purple.600" />
                  </Flex>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="semibold" color="gray.800">
                      GitHub Repository
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      dhirj-ngm/CoralBleachingProject
                    </Text>
                    <ChakraLink
                      href="https://github.com/dhirj-ngm/CoralBleachingProject"
                      target="_blank"
                      rel="noopener noreferrer"
                      fontSize="sm"
                      color="purple.600"
                      _hover={{ color: "purple.700", textDecoration: "underline" }}
                    >
                      <HStack spacing={1}>
                        <Text>View Repository</Text>
                        <Icon as={ExternalLink} w={3} h={3} />
                      </HStack>
                    </ChakraLink>
                  </VStack>
                </HStack>
              </Box>

              <Divider />

              {/* Additional Info */}
              <Box textAlign="center">
                <Text fontSize="sm" color="gray.600" mb={4}>
                  For research collaboration, data inquiries, or technical support
                </Text>
                <Button
                  colorScheme="cyan"
                  size="lg"
                  leftIcon={<Icon as={Mail} />}
                  as="a"
                  href="mailto:miniprojectcvv01@gmail.com"
                  w="full"
                >
                  Contact via Email
                </Button>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}