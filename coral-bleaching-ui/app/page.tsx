"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, Button, Container, Heading, Input, Text, VStack, SimpleGrid } from "@chakra-ui/react";

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("http://localhost:8000/analyze", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Analysis failed");
      localStorage.setItem("uploaded-comparison", JSON.stringify(payload.results));
      router.push("/results?upload=1");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis failed");
      setBusy(false);
    }
  }

  return <Box bg="gray.50" minH="calc(100vh - 130px)" py={14}><Container maxW="5xl">
    <VStack align="start" spacing={6} mb={10}>
      <Text color="teal.700" fontWeight="bold">KAVARATTI REEF ANALYSIS</Text>
      <Heading size="2xl">Measured results, with their limits visible</Heading>
      <Text fontSize="lg" color="gray.700">Explore a held-out external image benchmark and one-frame-per-second estimates from six Kavaratti videos. Video percentages are method estimates because Kavaratti test masks have not been reviewed.</Text>
      <Button as={Link} href="/results" colorScheme="teal" size="lg">View the six-video results</Button>
    </VStack>
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={10}>
      <Box bg="white" p={7} borderRadius="xl" borderWidth="1px"><Heading size="md" mb={3}>External benchmark</Heading><Text>883 held-out, directly labeled coral photographs. Scores describe image-level agreement with those supplied labels.</Text></Box>
      <Box bg="white" p={7} borderRadius="xl" borderWidth="1px"><Heading size="md" mb={3}>Local video estimates</Heading><Text>265 frames from videos 17, 19, 21, 22, 24, and 25. YOLO and HSV use different denominators; their difference is disagreement.</Text></Box>
    </SimpleGrid>
    <Box bg="white" p={7} borderRadius="xl" borderWidth="1px">
      <Heading size="md" mb={2}>Analyze another video locally</Heading>
      <Text color="gray.600" mb={5}>Start the FastAPI backend first. This runs both methods on one frame per second and labels the outputs as estimates.</Text>
      <Input type="file" accept="video/mp4,video/quicktime,video/x-msvideo" onChange={(event) => setFile(event.target.files?.[0] || null)} mb={4} />
      <Button colorScheme="teal" onClick={analyze} isDisabled={!file || busy} isLoading={busy}>Analyze video</Button>
      {error && <Text color="red.600" mt={3}>{error}</Text>}
    </Box>
  </Container></Box>;
}
