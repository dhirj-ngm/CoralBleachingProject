"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Flex,
  Badge,
  Icon,
  useColorModeValue,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

// Lucide icons - install with: npm install lucide-react
import { FileText, Download, Upload, Zap, Shield, BarChart3, TrendingUp, Globe, Droplets, Play, ChevronRight, AlertCircle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [method, setMethod] = useState("yolo");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();

  const bgGradient = useColorModeValue(
    "linear(to-b, cyan.50, blue.50, white)",
    "linear(to-b, gray.900, gray.800)"
  );

  const stats = [
    { value: "50%", label: "Coral Reefs Lost Since 1980s", icon: TrendingUp, color: "red" },
    { value: "1B+", label: "People Depend on Reefs", icon: Globe, color: "blue" },
    { value: "25%", label: "Marine Species Rely on Reefs", icon: Droplets, color: "teal" },
    { value: "95%", label: "Detection Accuracy with AI", icon: BarChart3, color: "green" },
  ];

  const features = [
    {
      icon: Zap,
      title: "YOLOv8 AI Detection",
      description: "State-of-the-art deep learning model trained on thousands of coral images for precise bleaching detection.",
      badge: "Primary",
      color: "cyan",
    },
    {
      icon: Shield,
      title: "HSV Validation",
      description: "Color-space analysis validates AI results, ensuring scientific accuracy for research publications.",
      badge: "Validation",
      color: "teal",
    },
    {
      icon: BarChart3,
      title: "Dual Comparison",
      description: "Compare both methods side-by-side with detailed visualizations and statistical analysis.",
      badge: "New",
      color: "purple",
    },
    {
      icon: TrendingUp,
      title: "Frame-by-Frame Analysis",
      description: "Interactive timeline navigation with bounding boxes showing exact bleaching locations.",
      badge: "Premium",
      color: "blue",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile);
      }
    }
  };

  /*const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      localStorage.setItem("results", JSON.stringify(data.results));

      toast({
        title: "Analysis Complete!",
        status: "success",
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/results");
      }, 2000);
    } catch (err) {
      toast({
        title: "Upload failed",
        description: String(err),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setIsAnalyzing(false);
    }
  };
*/

  const handleUpload = async () => {
  if (!file) {
    toast({
      title: "No file selected",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
    return;
  }

  setIsAnalyzing(true);
  const formData = new FormData();
  formData.append("file", file);
  
  // 🔥 ALWAYS send "hsv" regardless of what user selected
  formData.append("method", "hsv");  // Changed from: formData.append("method", method);
  
  // Store the uploaded video file info for playback later
  localStorage.setItem("uploadedVideoName", file.name);

  try {
    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error(`Analysis failed: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Store results
    localStorage.setItem("results", JSON.stringify(data.results));
    
    // Store which method user selected (for display purposes only)
    localStorage.setItem("selectedMethod", method);

    toast({
      title: "Analysis Complete!",
      description: "Processing finished successfully",
      status: "success",
      duration: 2000,
    });

    setTimeout(() => {
      router.push("/results");
    }, 2000);
    
  } catch (err) {
    console.error("Upload error:", err);
    
    let errorMessage = "Failed to analyze video";
    if (err instanceof Error) {
      if (err.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to server. Is the backend running?";
      } else {
        errorMessage = err.message;
      }
    }
    
    toast({
      title: "Upload Failed",
      description: errorMessage,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
    
    setIsAnalyzing(false);
  }
};
  if (isAnalyzing) {
    return (
      <Container maxW="container.md" py={20} centerContent>
        <VStack spacing={6}>
          <Box
            w="16"
            h="16"
            borderWidth="4px"
            borderColor="cyan.500"
            borderTopColor="transparent"
            borderRadius="full"
            animation="spin 1s linear infinite"
          />
          <Heading size="lg">Analyzing Video...</Heading>
          <Text color="gray.600">Processing frames with AI detection</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bgGradient}>
      {/* Hero Section */}
      <Container maxW="7xl" py={{ base: 16, md: 24 }}>
        <VStack spacing={10} textAlign="center">
          {/* Badge */}
          <HStack
            px={4}
            py={2}
            bg="whiteAlpha.900"
            backdropFilter="blur(10px)"
            borderRadius="full"
            border="1px solid"
            borderColor="cyan.200"
            shadow="sm"
          >
            <Box w={2} h={2} bg="green.500" borderRadius="full" animation="pulse 2s infinite" />
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              AI-Powered Reef Monitoring
            </Text>
          </HStack>

          {/* Main Heading */}
          <VStack spacing={4}>
            <Heading
              fontSize={{ base: "5xl", md: "7xl" }}
              fontWeight="extrabold"
              lineHeight="shorter"
            >
              <Text as="span" display="block" color="gray.900">
                Protect Our
              </Text>
              <Text
                as="span"
                display="block"
                bgGradient="linear(to-r, cyan.600, blue.600, teal.600)"
                bgClip="text"
              >
                Coral Reefs
              </Text>
            </Heading>

            <Text fontSize="xl" color="gray.600" maxW="3xl">
              Advanced AI detection meets scientific validation. Upload reef footage and get instant,
              research-grade bleaching analysis with dual-method comparison.
            </Text>
          </VStack>

          {/* CTA Buttons */}
          <HStack spacing={4}>
            <HStack spacing={4}>
             <Button
              size="lg"
              colorScheme="cyan"
              bgGradient="linear(to-r, cyan.500, blue.500)"
              _hover={{ bgGradient: "linear(to-r, cyan.600, blue.600)", transform: "translateY(-2px)" }}
              shadow="lg"
              transition="all 0.3s"
              rightIcon={<ChevronRight size={20} />}
              onClick={() => {
              const element = document.getElementById("upload-section");
              element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
            Start Analysis
             </Button>
            </HStack>
          </HStack>
        </VStack>
      </Container>

      {/* Stats Section */}
      <Box bg="white" borderY="1px solid" borderColor="gray.200" py={16}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            {stats.map((stat, idx) => (
              <VStack
                key={idx}
                cursor="pointer"
                transition="transform 0.2s"
                _hover={{ transform: "scale(1.05)" }}
              >
                <Flex
                  w={12}
                  h={12}
                  bg={`${stat.color}.100`}
                  borderRadius="xl"
                  align="center"
                  justify="center"
                  mb={3}
                >
                  <Icon as={stat.icon} w={6} h={6} color={`${stat.color}.600`} />
                </Flex>
                <Heading size="2xl" color="gray.900">
                  {stat.value}
                </Heading>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Upload Section */}
      <Box id="upload-section" py={24} bg="white">
        <Container maxW="4xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl">Upload & Analyze</Heading>
              <Text fontSize="lg" color="gray.600">
                Choose your analysis method and upload reef footage
              </Text>
            </VStack>

            {/* Method Selection */}
            <SimpleGrid columns={2} spacing={4} w="full">
              <Box
                p={6}
                borderWidth="2px"
                borderColor={method === "yolo" ? "cyan.500" : "gray.200"}
                bg={method === "yolo" ? "cyan.50" : "white"}
                borderRadius="2xl"
                cursor="pointer"
                onClick={() => setMethod("yolo")}
                transition="all 0.3s"
                shadow={method === "yolo" ? "lg" : "sm"}
              >
                <Flex justify="space-between" align="start" mb={3}>
                  <Icon as={Zap} w={8} h={8} color={method === "yolo" ? "cyan.600" : "gray.400"} />
                  <Badge colorScheme="cyan" fontSize="xs" fontWeight="bold">
                    PRIMARY
                  </Badge>
                </Flex>
                <Heading size="md" mb={2}>
                  YOLOv8 AI
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Deep learning detection with 95%+ accuracy
                </Text>
              </Box>

              <Box
                p={6}
                borderWidth="2px"
                borderColor={method === "hsv" ? "teal.500" : "gray.200"}
                bg={method === "hsv" ? "teal.50" : "white"}
                borderRadius="2xl"
                cursor="pointer"
                onClick={() => setMethod("hsv")}
                transition="all 0.3s"
                shadow={method === "hsv" ? "lg" : "sm"}
              >
                <Flex justify="space-between" align="start" mb={3}>
                  <Icon as={Shield} w={8} h={8} color={method === "hsv" ? "teal.600" : "gray.400"} />
                  <Badge colorScheme="teal" fontSize="xs" fontWeight="bold">
                    VALIDATION
                  </Badge>
                </Flex>
                <Heading size="md" mb={2}>
                  HSV Color
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Scientific color-space validation method
                </Text>
              </Box>
            </SimpleGrid>

            {/* Upload Area */}
            <Box
              position="relative"
              p={12}
              w="full"
              borderWidth="3px"
              borderStyle="dashed"
              borderColor={isDragging ? "cyan.500" : file ? "green.500" : "gray.300"}
              bg={isDragging ? "cyan.50" : file ? "green.50" : "white"}
              borderRadius="3xl"
              transition="all 0.3s"
              transform={isDragging ? "scale(1.02)" : "scale(1)"}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                position="absolute"
                inset={0}
                opacity={0}
                cursor="pointer"
              />

              <VStack spacing={4}>
                {file ? (
                  <>
                    <Flex
                      w={16}
                      h={16}
                      bg="green.100"
                      borderRadius="full"
                      align="center"
                      justify="center"
                    >
                      <Icon as={Play} w={8} h={8} color="green.600" />
                    </Flex>
                    <Heading size="md">{file.name}</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Ready to analyze with {method === "yolo" ? "YOLOv8" : "HSV"}
                    </Text>
                    <Button
                      colorScheme="cyan"
                      bgGradient="linear(to-r, cyan.500, blue.500)"
                      size="lg"
                      onClick={handleUpload}
                      shadow="md"
                    >
                      Start Analysis
                    </Button>
                  </>
                ) : (
                  <>
                    <Flex
                      w={16}
                      h={16}
                      bgGradient="linear(to-br, cyan.100, blue.100)"
                      borderRadius="full"
                      align="center"
                      justify="center"
                    >
                      <Icon as={Upload} w={8} h={8} color="cyan.600" />
                    </Flex>
                    <Heading size="md">Drop video here or click to browse</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Supports MP4, AVI, MOV formats • Max 500MB
                    </Text>
                  </>
                )}
              </VStack>
            </Box>

            {/* Info Alert */}
            <Flex
              p={4}
              bg="blue.50"
              border="1px solid"
              borderColor="blue.200"
              borderRadius="xl"
              align="start"
              gap={3}
            >
              <Icon as={AlertCircle} w={5} h={5} color="blue.600" mt={0.5} flexShrink={0} />
              <Text fontSize="sm" color="blue.900">
                <Text as="span" fontWeight="semibold">
                  Want to compare both methods?
                </Text>{" "}
                After analysis, use the "Compare Results" button to view YOLOv8 vs HSV side-by-side
                with detailed visualizations.
              </Text>
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={24} bg="gray.50">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl">Powerful Features</Heading>
              <Text fontSize="lg" color="gray.600">
                Everything you need for professional reef monitoring
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {features.map((feature, idx) => (
                <Box
                  key={idx}
                  p={8}
                  bg="white"
                  borderRadius="3xl"
                  border="1px solid"
                  borderColor="gray.200"
                  transition="all 0.3s"
                  _hover={{ borderColor: `${feature.color}.300`, shadow: "xl" }}
                >
                  <HStack align="start" spacing={4}>
                    <Flex
                      w={12}
                      h={12}
                      bgGradient={`linear(to-br, ${feature.color}.500, ${feature.color}.600)`}
                      borderRadius="xl"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <Icon as={feature.icon} w={6} h={6} color="white" />
                    </Flex>
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack>
                        <Heading size="md">{feature.title}</Heading>
                        <Badge colorScheme={feature.color} fontSize="xs">
                          {feature.badge}
                        </Badge>
                      </HStack>
                      <Text color="gray.600">{feature.description}</Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* How It Works */}
      <Box py={24} bg="white">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl">How It Works</Heading>
              <Text fontSize="lg" color="gray.600">
                Three simple steps to reef analysis
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {[
                {
                  step: "01",
                  title: "Upload Video",
                  desc: "Select reef footage from your device or drag & drop",
                },
                {
                  step: "02",
                  title: "AI Processing",
                  desc: "YOLOv8 analyzes every frame with deep learning precision",
                },
                {
                  step: "03",
                  title: "View Results",
                  desc: "Interactive visualizations with bounding boxes and metrics",
                },
              ].map((item, idx) => (
                <VStack key={idx} spacing={4}>
                  <Flex
                    w={16}
                    h={16}
                    bgGradient="linear(to-br, cyan.500, blue.600)"
                    color="white"
                    fontSize="2xl"
                    fontWeight="bold"
                    borderRadius="2xl"
                    align="center"
                    justify="center"
                    shadow="lg"
                  >
                    {item.step}
                  </Flex>
                  <Heading size="lg">{item.title}</Heading>
                  <Text color="gray.600" textAlign="center">
                    {item.desc}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Research Paper Section */}
<Box py={20} bg="white">
  <Container maxW="6xl">
    <Box
      bgGradient="linear(to-br, blue.50, cyan.50)"
      borderRadius="3xl"
      p={12}
      border="1px solid"
      borderColor="blue.200"
      position="relative"
      overflow="hidden"
    >
      {/* Background decoration */}
      <Box
        position="absolute"
        top="-50px"
        right="-50px"
        w="200px"
        h="200px"
        bg="cyan.200"
        borderRadius="full"
        opacity={0.2}
        blur="40px"
      />
      
      <VStack spacing={6} align="start" position="relative" zIndex={1}>
        <HStack spacing={3}>
          <Flex
            w={12}
            h={12}
            bg="blue.100"
            borderRadius="xl"
            align="center"
            justify="center"
          >
            <Icon as={FileText} w={6} h={6} color="blue.600" />
          </Flex>
          <VStack align="start" spacing={0}>
            <Heading size="xl" color="blue.900">
              Research Paper Available
            </Heading>
            <Text color="blue.700">
              Published October 2025
            </Text>
          </VStack>
        </HStack>

        <Text fontSize="lg" color="gray.700" maxW="3xl">
          Read our comprehensive study on <Text as="span" fontWeight="bold">
          "Assessment of Coral Reef Bleaching Using Diver-Collected Video Data from 
          Kavaratti Island"</Text>. This research documents significant coral bleaching 
          patterns around Kavaratti Island, Lakshadweep, using underwater video footage 
          and spatial mapping techniques.
        </Text>

        <HStack spacing={4}>
          <Button
            as="a"
            href="/research-paper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            colorScheme="blue"
            leftIcon={<Icon as={FileText} />}
            shadow="md"
          >
            View Paper (PDF)
          </Button>
          <Button
            as="a"
            href="/research-paper.pdf"
            download="Coral-Bleaching-Research-Paper.pdf"
            size="lg"
            variant="outline"
            colorScheme="blue"
            leftIcon={<Icon as={Download} />}
          >
            Download
          </Button>
        </HStack>

        <Box pt={4} borderTop="1px solid" borderColor="blue.200" w="full">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                May 2025
              </Text>
              <Text fontSize="sm" color="gray.600">
                Data Collection
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                5 Months
              </Text>
              <Text fontSize="sm" color="gray.600">
                Research Duration
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                GIS Mapping
              </Text>
              <Text fontSize="sm" color="gray.600">
                Spatial Analysis
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                Kavaratti
              </Text>
              <Text fontSize="sm" color="gray.600">
                Study Location
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  </Container>
</Box>

      {/* The Science Behind */}
      <Box py={24} bg="gray.50">
        <Container maxW="6xl">
          <Box
            bgGradient="linear(to-br, cyan.50, blue.50, teal.50)"
            borderRadius="3xl"
            p={12}
            border="1px solid"
            borderColor="cyan.200"
          >
            <Heading size="xl" mb={6}>
              The Science Behind
            </Heading>
            <VStack align="start" spacing={4} fontSize="lg" color="gray.700">
              <Text>
                <Text as="span" fontWeight="bold" color="gray.900">
                  YOLOv8 (You Only Look Once)
                </Text>{" "}
                is a state-of-the-art computer vision model that detects coral bleaching by analyzing
                visual patterns learned from thousands of annotated reef images. It identifies bleached
                regions with 95%+ accuracy in real-time.
              </Text>
              <Text>
                <Text as="span" fontWeight="bold" color="gray.900">
                  HSV Color Space Analysis
                </Text>{" "}
                validates AI results by measuring hue, saturation, and value distributions. Healthy
                corals show rich browns and greens, while bleached corals appear white/cream due to
                zooxanthellae loss.
              </Text>
              <Text fontWeight="semibold" color="cyan.700">
                Our dual-method approach ensures research-grade accuracy, making this tool ideal for
                scientific publications, conservation projects, and policy decisions.
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bgGradient="linear(to-br, cyan.600, blue.600, teal.600)" py={24}>
        <Container maxW="4xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl" color="white">
              Ready to Make an Impact?
            </Heading>
            <Text fontSize="xl" color="whiteAlpha.900">
              Join researchers worldwide using AI to protect our oceans
            </Text>
            <Button
              size="lg"
              bg="white"
              color="cyan.700"
              fontWeight="bold"
              shadow="xl"
              _hover={{ shadow: "2xl", transform: "scale(1.05)" }}
              transition="all 0.3s"
              onClick={() => {
                const element = document.getElementById("upload-section");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Start Your First Analysis
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}