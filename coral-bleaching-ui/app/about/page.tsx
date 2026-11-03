import { Box, Container, Heading, Link, Text, VStack } from "@chakra-ui/react";

export default function AboutPage() {
  return <Box bg="gray.50" minH="100vh" py={12}><Container maxW="4xl"><VStack align="stretch" spacing={8}>
    <Box><Heading mb={3}>About this analysis</Heading><Text fontSize="lg">This project compares the recovered coral segmentation checkpoint with an independent HSV color rule. It keeps source provenance, method estimates, and reference-label scores separate.</Text></Box>
    <Box bg="white" p={7} borderRadius="xl" borderWidth="1px"><Heading size="md" mb={3}>Source footage</Heading><Text>Six user-supplied Kavaratti videos (IDs 17, 19, 21, 22, 24, and 25) yielded 265 one-frame-per-second samples. Frame manifests preserve video IDs, timestamps, and hashes. The recording date and frame-level GPS positions are not independently verified.</Text></Box>
    <Box bg="white" p={7} borderRadius="xl" borderWidth="1px"><Heading size="md" mb={3}>What was measured</Heading><Text>External image-label agreement was measured on 883 held-out coral photographs after duplicate and overlap filtering. Kavaratti outputs are YOLO detected-coral mask fractions and HSV pale-color fractions. They use different denominators and can disagree without either difference measuring accuracy.</Text></Box>
    <Box bg="white" p={7} borderRadius="xl" borderWidth="1px"><Heading size="md" mb={3}>What remains uncertain</Heading><Text>There are no reviewed Kavaratti test masks yet. Pale coral, bare skeleton, sand, underwater lighting, and poor visibility can all confuse classification. The 24 provisional masks are optional material for a later expert review.</Text></Box>
    <Text color="gray.600">Explore the <Link href="/results" color="teal.700">measured results</Link> and download the video endpoint GeoJSON there. Its geometries represent workbook start and end points, not reconstructed swim tracks.</Text>
  </VStack></Container></Box>;
}
