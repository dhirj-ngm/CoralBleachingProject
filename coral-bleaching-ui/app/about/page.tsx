"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  VStack,
  Flex,
  Icon,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { TrendingDown, Waves, Shield, Users } from "lucide-react";

const timelineEvents = [
  { year: "1980s", desc: "First major coral bleaching events observed globally." },
  { year: "1998", desc: "Severe El Niño triggered mass coral bleaching worldwide." },
  { year: "2000s", desc: "Satellite monitoring expanded to track reef health." },
  { year: "2016", desc: "Great Barrier Reef lost ~50% corals due to bleaching." },
  { year: "Today", desc: "AI and machine learning power advanced monitoring tools." },
];

const impactStats = [
  {
    icon: TrendingDown,
    value: "50%",
    label: "Coral Reefs Lost",
    desc: "Since the 1980s due to climate change",
    color: "red",
  },
  {
    icon: Waves,
    value: "500M+",
    label: "People Affected",
    desc: "Depend on reefs for food and income",
    color: "blue",
  },
  {
    icon: Shield,
    value: "$375B",
    label: "Economic Value",
    desc: "Annual value from tourism and fishing",
    color: "green",
  },
  {
    icon: Users,
    value: "25%",
    label: "Marine Species",
    desc: "Rely on coral reefs for survival",
    color: "purple",
  },
];

export default function AboutPage() {
  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Section */}
      <Box bgGradient="linear(to-br, cyan.600, blue.600, teal.600)" py={20}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center" color="white">
            <Badge colorScheme="whiteAlpha" fontSize="md" px={4} py={2} borderRadius="full">
              Conservation & Research
            </Badge>
            <Heading
              size="3xl"
              fontWeight="extrabold"
              bgGradient="linear(to-r, white, cyan.100)"
              bgClip="text"
            >
              About Coral Bleaching
            </Heading>
            <Text fontSize="xl" maxW="3xl" color="whiteAlpha.900">
              Coral reefs are vibrant underwater ecosystems that support marine life and protect
              coastlines. However, rising ocean temperatures, pollution, and climate change have
              caused widespread coral bleaching, threatening biodiversity and human livelihoods.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Impact Stats */}
      <Box py={16} bg="white">
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {impactStats.map((stat, idx) => (
              <Box
                key={idx}
                p={6}
                bg="white"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.200"
                shadow="sm"
                transition="all 0.3s"
                _hover={{ shadow: "lg", transform: "translateY(-4px)" }}
              >
                <Flex
                  w={12}
                  h={12}
                  bg={`${stat.color}.100`}
                  borderRadius="xl"
                  align="center"
                  justify="center"
                  mb={4}
                >
                  <Icon as={stat.icon} w={6} h={6} color={`${stat.color}.600`} />
                </Flex>
                <Text fontSize="3xl" fontWeight="bold" color={`${stat.color}.600`} mb={1}>
                  {stat.value}
                </Text>
                <Text fontWeight="semibold" color="gray.900" mb={2}>
                  {stat.label}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {stat.desc}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Healthy vs Bleached */}
      <Box py={20} bg="gray.50">
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl">The Difference Is Striking</Heading>
              <Text fontSize="lg" color="gray.600" maxW="3xl">
                Coral bleaching occurs when corals lose their symbiotic algae (zooxanthellae),
                turning white and becoming vulnerable to disease and death.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
              <Box>
                <Box
                  borderRadius="2xl"
                  overflow="hidden"
                  shadow="xl"
                  border="3px solid"
                  borderColor="green.400"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80"
                    alt="Healthy Coral"
                    w="full"
                    h="300px"
                    objectFit="cover"
                  />
                </Box>
                <VStack align="start" spacing={2} mt={4}>
                  <HStack>
                    <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                      HEALTHY
                    </Badge>
                  </HStack>
                  <Heading size="md">Vibrant Coral Reef</Heading>
                  <Text color="gray.600">
                    Rich colors from symbiotic zooxanthellae algae. Provides food, shelter, and
                    breeding grounds for thousands of marine species.
                  </Text>
                </VStack>
              </Box>

              <Box>
                <Box
                  borderRadius="2xl"
                  overflow="hidden"
                  shadow="xl"
                  border="3px solid"
                  borderColor="red.400"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80&sat=-100&bri=50"
                    alt="Bleached Coral"
                    w="full"
                    h="300px"
                    objectFit="cover"
                    filter="grayscale(100%) brightness(1.4)"
                  />
                </Box>
                <VStack align="start" spacing={2} mt={4}>
                  <HStack>
                    <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                      BLEACHED
                    </Badge>
                  </HStack>
                  <Heading size="md">Stressed Coral Reef</Heading>
                  <Text color="gray.600">
                    White appearance after expelling algae due to stress. Weakened structure,
                    increased mortality, and ecosystem collapse if prolonged.
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Timeline */}
      <Box py={20} bg="white">
        <Container maxW="6xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" color="teal.700">
                Key Milestones in Coral Bleaching Research
              </Heading>
              <Text fontSize="lg" color="gray.600">
                A timeline of critical events and discoveries
              </Text>
            </VStack>

            <VStack align="stretch" spacing={6} w="full">
              {timelineEvents.map((event, idx) => (
                <Flex key={idx} align="center" position="relative">
                  <Box
                    w="120px"
                    fontWeight="bold"
                    fontSize="lg"
                    color="teal.600"
                    textAlign="right"
                    pr={6}
                    flexShrink={0}
                  >
                    {event.year}
                  </Box>
                  <Box
                    w="4"
                    h="4"
                    bg="teal.500"
                    borderRadius="full"
                    border="4px solid"
                    borderColor="teal.100"
                    flexShrink={0}
                  />
                  <Box
                    flex={1}
                    ml={6}
                    p={4}
                    bg="gray.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Text color="gray.700" fontSize="lg">
                      {event.desc}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Why It Matters */}
      <Box py={20} bg="gray.50">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="center">
            <Box>
              <Heading size="2xl" mb={6} color="teal.700">
                Why It Matters
              </Heading>
              <VStack align="start" spacing={4} fontSize="lg" color="gray.700">
                <Text>
                  Coral reefs are critical to marine biodiversity, providing shelter, food, and
                  breeding grounds for countless species. They also act as natural barriers
                  protecting coastal communities from storms and erosion.
                </Text>
                <Text>
                  The loss of coral reefs directly impacts fisheries, tourism, and global
                  ecosystems. Over 500 million people depend on reefs for food security and
                  livelihoods.
                </Text>
                <Text fontWeight="semibold" color="teal.700">
                  Without urgent action, we risk losing these vital ecosystems within our lifetime.
                </Text>
              </VStack>
            </Box>

            <Box
              p={8}
              bgGradient="linear(to-br, cyan.50, blue.50)"
              borderRadius="2xl"
              border="1px solid"
              borderColor="cyan.200"
            >
              <VStack align="start" spacing={6}>
                <Heading size="lg" color="cyan.800">
                  Ecosystem Services
                </Heading>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Box w={2} h={2} bg="cyan.500" borderRadius="full" />
                    <Text fontWeight="medium">Food security for 500M+ people</Text>
                  </HStack>
                  <HStack>
                    <Box w={2} h={2} bg="cyan.500" borderRadius="full" />
                    <Text fontWeight="medium">$375B annual economic value</Text>
                  </HStack>
                  <HStack>
                    <Box w={2} h={2} bg="cyan.500" borderRadius="full" />
                    <Text fontWeight="medium">Coastal protection from storms</Text>
                  </HStack>
                  <HStack>
                    <Box w={2} h={2} bg="cyan.500" borderRadius="full" />
                    <Text fontWeight="medium">Biodiversity hotspots</Text>
                  </HStack>
                  <HStack>
                    <Box w={2} h={2} bg="cyan.500" borderRadius="full" />
                    <Text fontWeight="medium">Medical research potential</Text>
                  </HStack>
                  <HStack>
                    <Box w={2} h={2} bg="cyan.500" borderRadius="full" />
                    <Text fontWeight="medium">Tourism and recreation</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Use Cases */}
      <Box py={20} bg="white">
        <Container maxW="6xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" color="teal.700">
                Use Cases of Monitoring Coral Bleaching
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="3xl">
                Our AI-powered platform serves multiple critical purposes
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {[
                {
                  title: "Conservation Planning",
                  desc: "Identify priority areas for reef restoration and marine protected area designation",
                  color: "green",
                },
                {
                  title: "Scientific Research",
                  desc: "Collect standardized data for climate change studies and ecological modeling",
                  color: "blue",
                },
                {
                  title: "Policy Making",
                  desc: "Provide evidence-based insights for environmental regulations and climate action",
                  color: "purple",
                },
                {
                  title: "Public Awareness",
                  desc: "Educate communities and stakeholders about reef health and conservation needs",
                  color: "orange",
                },
                {
                  title: "Early Warning Systems",
                  desc: "Detect bleaching events early to enable rapid intervention and mitigation",
                  color: "red",
                },
                {
                  title: "Tourism Management",
                  desc: "Monitor reef health to ensure sustainable tourism practices and visitor education",
                  color: "teal",
                },
              ].map((useCase, idx) => (
                <Box
                  key={idx}
                  p={6}
                  bg="white"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor="gray.200"
                  shadow="sm"
                  transition="all 0.3s"
                  _hover={{
                    shadow: "lg",
                    borderColor: `${useCase.color}.300`,
                    transform: "translateY(-4px)",
                  }}
                >
                  <Badge colorScheme={useCase.color} mb={3} fontSize="sm" px={3} py={1}>
                    {useCase.title.toUpperCase()}
                  </Badge>
                  <Heading size="md" mb={3}>
                    {useCase.title}
                  </Heading>
                  <Text color="gray.600">{useCase.desc}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box bgGradient="linear(to-br, teal.600, cyan.600)" py={20}>
        <Container maxW="4xl">
          <VStack spacing={6} textAlign="center" color="white">
            <Heading size="2xl">Join the Conservation Effort</Heading>
            <Text fontSize="xl" maxW="2xl" color="whiteAlpha.900">
              Every analysis contributes to our understanding of reef health. Start monitoring
              today and be part of the solution.
            </Text>
            <HStack spacing={4} pt={4}>
              <Box
                as="button"
                px={8}
                py={4}
                bg="white"
                color="teal.700"
                fontWeight="bold"
                borderRadius="xl"
                shadow="xl"
                transition="all 0.3s"
                _hover={{ shadow: "2xl", transform: "scale(1.05)" }}
              >
                Start Analyzing
              </Box>
              <Box
                as="button"
                px={8}
                py={4}
                bg="whiteAlpha.200"
                color="white"
                fontWeight="bold"
                borderRadius="xl"
                border="2px solid"
                borderColor="whiteAlpha.400"
                transition="all 0.3s"
                _hover={{ bg: "whiteAlpha.300" }}
              >
                Learn More
              </Box>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}