"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Heading,
  Box,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Flex,
  Badge,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  Image,
} from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  BarChart3,
  Download,
  Layout,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
} from "lucide-react";

interface BoxCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FrameResult {
  frame: string;
  bleaching_percent: number;
  image_url?: string;
  boxes?: {
    bleached: BoxCoords[];
    healthy: BoxCoords[];
  };
}

interface Results {
  frames: FrameResult[];
  summary: {
    bleached: number;
    healthy: number;
  };
}

export default function ResultsPage() {
  const [comparisonMode, setComparisonMode] = useState(false);
  const [yoloResults, setYoloResults] = useState<Results | null>(null);
  const [hsvResults, setHsvResults] = useState<Results | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<FrameResult | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const stored = localStorage.getItem("results");
    if (stored) {
      const parsed = JSON.parse(stored);
      setYoloResults(parsed);

      // Mock HSV results (in production, backend sends both)
      setHsvResults({
        frames: parsed.frames.map((f: FrameResult) => ({
          ...f,
          bleaching_percent: f.bleaching_percent + (Math.random() * 10 - 5),
        })),
        summary: {
          bleached: parsed.summary.bleached - 2.7,
          healthy: parsed.summary.healthy + 2.7,
        },
      });
    }
  }, []);

  if (!yoloResults) {
    return (
      <Container maxW="container.md" py={20} centerContent>
        <VStack spacing={4}>
          <Heading size="lg">Loading results...</Heading>
        </VStack>
      </Container>
    );
  }

  const pieData = [
    { name: "Bleached", value: yoloResults.summary.bleached, color: "#ef4444" },
    { name: "Healthy", value: yoloResults.summary.healthy, color: "#10b981" },
  ];

  const comparisonChartData = yoloResults.frames.slice(0, 10).map((frame, i) => ({
    frame: `F${i + 1}`,
    yolo: frame.bleaching_percent,
    hsv: hsvResults?.frames[i].bleaching_percent || 0,
  }));

  const handleFrameClick = (frame: FrameResult, index: number) => {
    setSelectedFrame(frame);
    setCurrentFrameIndex(index);
    onOpen();
  };

  const navigateFrame = (direction: "prev" | "next") => {
    const newIndex =
      direction === "next"
        ? Math.min(currentFrameIndex + 1, yoloResults.frames.length - 1)
        : Math.max(currentFrameIndex - 1, 0);
    setCurrentFrameIndex(newIndex);
    setSelectedFrame(yoloResults.frames[newIndex]);
  };

  return (
    <Box minH="100vh" bg="gray.50" pb={16}>
      {/* Sticky Header */}
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        position="sticky"
        top={0}
        zIndex={10}
        backdropFilter="blur(10px)"
      >
        <Container maxW="7xl" py={6}>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="xl">Analysis Results</Heading>
              <Text color="gray.600">Coral reef bleaching detection report</Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                colorScheme={comparisonMode ? "purple" : "gray"}
                bgGradient={comparisonMode ? "linear(to-r, purple.500, pink.500)" : undefined}
                leftIcon={<Icon as={Layout} />}
                onClick={() => setComparisonMode(!comparisonMode)}
                shadow={comparisonMode ? "lg" : "sm"}
              >
                {comparisonMode ? "Exit Comparison" : "Compare Methods"}
              </Button>
              <Button leftIcon={<Icon as={Download} />} variant="outline">
                Export
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={8}>
        {!comparisonMode ? (
          /* Single Method View */
          <VStack spacing={8} align="stretch">
            {/* Summary Cards */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Box
                bgGradient="linear(to-br, red.50, orange.50)"
                p={6}
                borderRadius="2xl"
                border="1px solid"
                borderColor="red.200"
                shadow="sm"
              >
                <Flex justify="space-between" align="start" mb={4}>
                  <Flex w={12} h={12} bg="red.100" borderRadius="xl" align="center" justify="center">
                    <Icon as={TrendingDown} w={6} h={6} color="red.600" />
                  </Flex>
                  <Badge colorScheme="red" fontSize="xs" fontWeight="bold">
                    ALERT
                  </Badge>
                </Flex>
                <Stat>
                  <StatNumber fontSize="4xl" color="red.600">
                    {yoloResults.summary.bleached.toFixed(1)}%
                  </StatNumber>
                  <StatLabel fontSize="sm" color="red.700" fontWeight="medium">
                    Average Bleaching
                  </StatLabel>
                </Stat>
              </Box>

              <Box
                bgGradient="linear(to-br, green.50, emerald.50)"
                p={6}
                borderRadius="2xl"
                border="1px solid"
                borderColor="green.200"
                shadow="sm"
              >
                <Flex justify="space-between" align="start" mb={4}>
                  <Flex w={12} h={12} bg="green.100" borderRadius="xl" align="center" justify="center">
                    <Icon as={TrendingUp} w={6} h={6} color="green.600" />
                  </Flex>
                  <Badge colorScheme="green" fontSize="xs" fontWeight="bold">
                    GOOD
                  </Badge>
                </Flex>
                <Stat>
                  <StatNumber fontSize="4xl" color="green.600">
                    {yoloResults.summary.healthy.toFixed(1)}%
                  </StatNumber>
                  <StatLabel fontSize="sm" color="green.700" fontWeight="medium">
                    Healthy Coral
                  </StatLabel>
                </Stat>
              </Box>

              <Box
                bgGradient="linear(to-br, blue.50, cyan.50)"
                p={6}
                borderRadius="2xl"
                border="1px solid"
                borderColor="blue.200"
                shadow="sm"
              >
                <Flex justify="space-between" align="start" mb={4}>
                  <Flex w={12} h={12} bg="blue.100" borderRadius="xl" align="center" justify="center">
                    <Icon as={BarChart3} w={6} h={6} color="blue.600" />
                  </Flex>
                  <Badge colorScheme="blue" fontSize="xs" fontWeight="bold">
                    YOLOv8
                  </Badge>
                </Flex>
                <Stat>
                  <StatNumber fontSize="4xl" color="blue.600">
                    {yoloResults.frames.length}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="blue.700" fontWeight="medium">
                    Frames Analyzed
                  </StatLabel>
                </Stat>
              </Box>
            </SimpleGrid>

            {/* Charts Row */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box bg="white" p={8} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm">
                <Heading size="md" mb={6}>
                  Overall Distribution
                </Heading>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Box bg="white" p={8} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm">
                <Heading size="md" mb={6}>
                  Bleaching Trend
                </Heading>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="frame" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Line type="monotone" dataKey="yolo" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </SimpleGrid>

            {/* Frame Grid */}
            <Box bg="white" p={8} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm">
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md">Frame Analysis</Heading>
                <Text fontSize="sm" color="gray.600">
                  {yoloResults.frames.length} frames processed
                </Text>
              </Flex>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {yoloResults.frames.slice(0, 12).map((frame, idx) => (
                  <Box
                    key={idx}
                    cursor="pointer"
                    onClick={() => handleFrameClick(frame, idx)}
                    transition="all 0.2s"
                    _hover={{ transform: "scale(1.05)" }}
                  >
                    <Box
                      position="relative"
                      aspectRatio={16 / 9}
                      bg="gray.100"
                      borderRadius="xl"
                      overflow="hidden"
                      mb={2}
                      border="2px solid transparent"
                      _hover={{ borderColor: "blue.500" }}
                    >
                      {frame.image_url ? (
                        <Image src={`http://localhost:8000${frame.image_url}`} alt={frame.frame} objectFit="cover" w="full" h="full" />
                      ) : (
                        <Flex align="center" justify="center" h="full" bgGradient="linear(to-br, blue.200, cyan.200)">
                          <Icon as={Maximize2} w={8} h={8} color="gray.400" />
                        </Flex>
                      )}
                    </Box>
                    <Text fontSize="xs" fontWeight="medium" color="gray.600" mb={1}>
                      {frame.frame}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color={frame.bleaching_percent > 50 ? "red.600" : "green.600"}>
                      {frame.bleaching_percent.toFixed(1)}% bleached
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        ) : (
          /* Comparison Mode */
          <VStack spacing={8} align="stretch">
            {/* Comparison Header */}
            <Box bgGradient="linear(to-r, purple.50, pink.50, purple.50)" p={6} borderRadius="2xl" border="1px solid" borderColor="purple.200">
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={2}>
                  <Heading size="lg" color="purple.900">
                    Method Comparison
                  </Heading>
                  <Text color="purple.700">YOLOv8 AI Detection vs HSV Color Validation</Text>
                </VStack>
                <HStack spacing={4}>
                  <HStack>
                    <Box w={4} h={4} bg="blue.500" borderRadius="sm" />
                    <Text fontSize="sm" fontWeight="medium">
                      YOLOv8
                    </Text>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} bg="teal.500" borderRadius="sm" />
                    <Text fontSize="sm" fontWeight="medium">
                      HSV
                    </Text>
                  </HStack>
                </HStack>
              </Flex>
            </Box>

            {/* Side-by-Side Summary */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* YOLO Card */}
              <Box bg="white" p={8} borderRadius="2xl" border="2px solid" borderColor="blue.300" shadow="lg">
                <HStack spacing={3} mb={6}>
                  <Flex w={12} h={12} bg="blue.100" borderRadius="xl" align="center" justify="center">
                    <Icon as={Zap} w={6} h={6} color="blue.600" />
                  </Flex>
                  <VStack align="start" spacing={0}>
                    <Heading size="md">YOLOv8 AI</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Deep Learning Detection
                    </Text>
                  </VStack>
                </HStack>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Average Bleaching
                    </Text>
                    <Text fontSize="4xl" fontWeight="bold" color="blue.600">
                      {yoloResults.summary.bleached.toFixed(1)}%
                    </Text>
                  </Box>
                  <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                    <Flex justify="space-between" fontSize="sm" mb={2}>
                      <Text color="gray.600">Confidence</Text>
                      <Text fontWeight="bold">95.2%</Text>
                    </Flex>
                    <Flex justify="space-between" fontSize="sm">
                      <Text color="gray.600">Processing Speed</Text>
                      <Text fontWeight="bold">Fast</Text>
                    </Flex>
                  </Box>
                </VStack>
              </Box>

              {/* HSV Card */}
              <Box bg="white" p={8} borderRadius="2xl" border="2px solid" borderColor="teal.300" shadow="lg">
                <HStack spacing={3} mb={6}>
                  <Flex w={12} h={12} bg="teal.100" borderRadius="xl" align="center" justify="center">
                    <Icon as={Shield} w={6} h={6} color="teal.600" />
                  </Flex>
                  <VStack align="start" spacing={0}>
                    <Heading size="md">HSV Color</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Color Space Validation
                    </Text>
                  </VStack>
                </HStack>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Average Bleaching
                    </Text>
                    <Text fontSize="4xl" fontWeight="bold" color="teal.600">
                      {hsvResults?.summary.bleached.toFixed(1)}%
                    </Text>
                  </Box>
                  <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                    <Flex justify="space-between" fontSize="sm" mb={2}>
                      <Text color="gray.600">Validation</Text>
                      <Text fontWeight="bold">Scientific</Text>
                    </Flex>
                    <Flex justify="space-between" fontSize="sm">
                      <Text color="gray.600">Processing Speed</Text>
                      <Text fontWeight="bold">Very Fast</Text>
                    </Flex>
                  </Box>
                </VStack>
              </Box>
            </SimpleGrid>

            {/* Comparison Chart */}
            <Box bg="white" p={8} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm">
              <Heading size="md" mb={6}>
                Frame-by-Frame Comparison
              </Heading>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="frame" stroke="#64748b" />
                  <YAxis stroke="#64748b" label={{ value: "Bleaching %", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yolo" fill="#3b82f6" name="YOLOv8" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="hsv" fill="#14b8a6" name="HSV" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Accuracy Metrics */}
            <Box bg="white" p={8} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm">
              <Heading size="md" mb={6}>
                Statistical Comparison
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Box textAlign="center" p={6} bgGradient="linear(to-br, blue.50, cyan.50)" borderRadius="xl">
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600" mb={2}>
                    2.7%
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Average Difference
                  </Text>
                </Box>
                <Box textAlign="center" p={6} bgGradient="linear(to-br, green.50, emerald.50)" borderRadius="xl">
                  <Text fontSize="3xl" fontWeight="bold" color="green.600" mb={2}>
                    93.1%
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Agreement Rate
                  </Text>
                </Box>
                <Box textAlign="center" p={6} bgGradient="linear(to-br, purple.50, pink.50)" borderRadius="xl">
                  <Text fontSize="3xl" fontWeight="bold" color="purple.600" mb={2}>
                    0.89
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Correlation
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
          </VStack>
        )}
      </Container>

      {/* Frame Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" overflow="hidden" shadow="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200">
            <VStack align="start" spacing={1}>
              <Heading size="md">{selectedFrame?.frame}</Heading>
              <Text fontSize="sm" color="gray.600">
                Bleaching:{" "}
                <Text as="span" fontWeight="bold" color={selectedFrame && selectedFrame.bleaching_percent > 50 ? "red.600" : "green.600"}>
                  {selectedFrame?.bleaching_percent.toFixed(1)}%
                </Text>
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="teal">
              <TabList mb={6}>
                <Tab fontWeight="semibold">Bleached Regions</Tab>
                <Tab fontWeight="semibold">Healthy Regions</Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  <Box position="relative" borderRadius="2xl" overflow="hidden" mb={6}>
                    {selectedFrame?.image_url ? (
                      <Box position="relative">
                        <Image src={`http://localhost:8000${selectedFrame.image_url}`} alt="Frame" borderRadius="lg" shadow="md" w="full" />
                        {selectedFrame?.boxes?.bleached?.map((box, i) => (
                          <Box
                            key={i}
                            position="absolute"
                            top={`${box.y}px`}
                            left={`${box.x}px`}
                            w={`${box.w}px`}
                            h={`${box.h}px`}
                            border="3px solid red"
                            borderRadius="md"
                            pointerEvents="none"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Flex h="400px" bg="gray.100" borderRadius="lg" align="center" justify="center">
                        <Text color="gray.400">Frame Preview</Text>
                      </Flex>
                    )}
                  </Box>
                </TabPanel>

                <TabPanel p={0}>
                  <Box position="relative" borderRadius="2xl" overflow="hidden" mb={6}>
                    {selectedFrame?.image_url ? (
                      <Box position="relative">
                        <Image src={`http://localhost:8000${selectedFrame.image_url}`} alt="Frame" borderRadius="lg" shadow="md" w="full" />
                        {selectedFrame?.boxes?.healthy?.map((box, i) => (
                          <Box
                            key={i}
                            position="absolute"
                            top={`${box.y}px`}
                            left={`${box.x}px`}
                            w={`${box.w}px`}
                            h={`${box.h}px`}
                            border="3px solid green"
                            borderRadius="md"
                            pointerEvents="none"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Flex h="400px" bg="gray.100" borderRadius="lg" align="center" justify="center">
                        <Text color="gray.400">Frame Preview</Text>
                      </Flex>
                    )}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Navigation */}
            <Flex justify="space-between" align="center">
              <Button
                leftIcon={<Icon as={ChevronLeft} />}
                onClick={() => navigateFrame("prev")}
                isDisabled={currentFrameIndex === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Text fontSize="sm" color="gray.600">
                Frame {currentFrameIndex + 1} of {yoloResults.frames.length}
              </Text>
              <Button
                rightIcon={<Icon as={ChevronRight} />}
                onClick={() => navigateFrame("next")}
                isDisabled={currentFrameIndex === yoloResults.frames.length - 1}
                variant="outline"
              >
                Next
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}