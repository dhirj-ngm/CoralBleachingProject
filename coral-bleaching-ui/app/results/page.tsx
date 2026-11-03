"use client";

import { useEffect, useState } from "react";
import { Box, Button, Container, Heading, HStack, Select, SimpleGrid, Stat, StatLabel, StatNumber, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Metric = { accuracy: number; precision: number; recall: number; f1: number; tp: number; tn: number; fp: number; fn: number };
type Frame = { video_id: string; second: number; yolo_estimate_pct: number | null; hsv_color_estimate_pct: number | null; disagreement_points: number | null };
type Video = { video_id: string; frames: number; paired_frames: number; yolo_estimate_pct: number | null; hsv_color_estimate_pct: number | null; mean_absolute_disagreement_points: number | null };
type Published = { external_test: { images: number; bleached_labels: number; healthy_labels: number; metrics: { original_yolo: Metric; hsv: Metric } }; kavaratti: { video_summaries: Video[]; frames: Frame[] }; limits: string[] };
type Uploaded = { filename: string; frames: Frame[]; summary: Video; note: string };
const pct = (value: number | null | undefined) => value == null ? "—" : `${value.toFixed(1)}%`;

export default function ResultsPage() {
  const [published, setPublished] = useState<Published | null>(null);
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const [videoId, setVideoId] = useState("17");
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/comparison-results.json").then((response) => {
      if (!response.ok) throw new Error("Published results are unavailable");
      return response.json();
    }).then(setPublished).catch((cause) => setError(String(cause)));
    if (window.location.search.includes("upload=1")) {
      try { const stored = localStorage.getItem("uploaded-comparison"); if (stored) setUploaded(JSON.parse(stored)); }
      catch { setError("Uploaded results could not be read"); }
    }
  }, []);
  if (error) return <Container py={12}><Text color="red.600">{error}</Text></Container>;
  if (!published) return <Container py={12}><Text>Loading measured results…</Text></Container>;
  const videos = published.kavaratti.video_summaries;
  const frames = published.kavaratti.frames.filter((frame) => frame.video_id === videoId);
  const metricRows: [string, Metric][] = [["Recovered YOLO", published.external_test.metrics.original_yolo], ["HSV", published.external_test.metrics.hsv]];

  return <Box bg="gray.50" py={10} minH="100vh"><Container maxW="6xl"><VStack align="stretch" spacing={10}>
    <Box><Heading mb={2}>Real comparison results</Heading><Text color="gray.700">External image-label agreement and Kavaratti video estimates are shown separately. No Kavaratti accuracy claim is made.</Text></Box>
    {uploaded && <Box bg="white" p={7} borderRadius="xl" borderWidth="1px">
      <Heading size="md" mb={2}>Your video: {uploaded.filename}</Heading><Text mb={4}>{uploaded.note}</Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
        <Stat><StatLabel>YOLO detected-mask estimate</StatLabel><StatNumber>{pct(uploaded.summary.yolo_estimate_pct)}</StatNumber></Stat>
        <Stat><StatLabel>HSV pale-color estimate</StatLabel><StatNumber>{pct(uploaded.summary.hsv_color_estimate_pct)}</StatNumber></Stat>
        <Stat><StatLabel>Mean absolute disagreement</StatLabel><StatNumber>{pct(uploaded.summary.mean_absolute_disagreement_points)}</StatNumber></Stat>
      </SimpleGrid><Text mt={4} color="gray.600">{uploaded.frames.length} sampled frames; {uploaded.summary.paired_frames} paired valid frames.</Text>
      <Box h="260px" mt={5}><ResponsiveContainer width="100%" height="100%"><LineChart data={uploaded.frames}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="second" /><YAxis domain={[0, 100]} unit="%" /><Tooltip /><Legend /><Line type="monotone" dataKey="yolo_estimate_pct" name="YOLO estimate" stroke="#2563eb" connectNulls={false} dot={false} /><Line type="monotone" dataKey="hsv_color_estimate_pct" name="HSV color estimate" stroke="#0d9488" dot={false} /></LineChart></ResponsiveContainer></Box>
    </Box>}
    <Box bg="white" p={7} borderRadius="xl" borderWidth="1px"><Heading size="md" mb={2}>External image benchmark</Heading>
      <Text color="gray.600" mb={5}>{published.external_test.images} held-out photos: {published.external_test.bleached_labels} supplied bleached labels and {published.external_test.healthy_labels} supplied healthy labels. These are image-level scores, not mask accuracy.</Text>
      <Box overflowX="auto"><Table size="sm"><Thead><Tr><Th>Method</Th><Th isNumeric>Accuracy</Th><Th isNumeric>Precision</Th><Th isNumeric>Recall</Th><Th isNumeric>F1</Th><Th>TP / TN / FP / FN</Th></Tr></Thead><Tbody>
        {metricRows.map(([name, value]) => <Tr key={name}><Td>{name}</Td><Td isNumeric>{pct(value.accuracy * 100)}</Td><Td isNumeric>{pct(value.precision * 100)}</Td><Td isNumeric>{pct(value.recall * 100)}</Td><Td isNumeric>{pct(value.f1 * 100)}</Td><Td>{value.tp} / {value.tn} / {value.fp} / {value.fn}</Td></Tr>)}
      </Tbody></Table></Box>
    </Box>
    <Box bg="white" p={7} borderRadius="xl" borderWidth="1px"><Heading size="md" mb={2}>Kavaratti: six source videos</Heading>
      <Text color="gray.600" mb={5}>Paired means use frames with both estimates. The methods use different denominators, so disagreement is not an accuracy measure.</Text>
      <Box overflowX="auto"><Table size="sm"><Thead><Tr><Th>Video</Th><Th isNumeric>Frames</Th><Th isNumeric>Paired</Th><Th isNumeric>YOLO estimate</Th><Th isNumeric>HSV color estimate</Th><Th isNumeric>Mean absolute disagreement</Th></Tr></Thead><Tbody>
        {videos.map((video) => <Tr key={video.video_id}><Td>{video.video_id}</Td><Td isNumeric>{video.frames}</Td><Td isNumeric>{video.paired_frames}</Td><Td isNumeric>{pct(video.yolo_estimate_pct)}</Td><Td isNumeric>{pct(video.hsv_color_estimate_pct)}</Td><Td isNumeric>{pct(video.mean_absolute_disagreement_points)}</Td></Tr>)}
      </Tbody></Table></Box>
    </Box>
    <Box bg="white" p={7} borderRadius="xl" borderWidth="1px">
      <HStack justify="space-between" mb={4}><Heading size="md">Frame timeline</Heading><Select maxW="160px" value={videoId} onChange={(event) => setVideoId(event.target.value)}>{videos.map((video) => <option key={video.video_id} value={video.video_id}>Video {video.video_id}</option>)}</Select></HStack>
      <Box h="320px"><ResponsiveContainer width="100%" height="100%"><LineChart data={frames}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="second" label={{ value: "Second", position: "insideBottom", offset: -4 }} /><YAxis domain={[0, 100]} unit="%" /><Tooltip /><Legend /><Line type="monotone" dataKey="yolo_estimate_pct" name="YOLO estimate" stroke="#2563eb" connectNulls={false} dot={false} /><Line type="monotone" dataKey="hsv_color_estimate_pct" name="HSV color estimate" stroke="#0d9488" dot={false} /></LineChart></ResponsiveContainer></Box>
    </Box>
    <Box bg="white" p={7} borderRadius="xl" borderWidth="1px"><Heading size="md" mb={4}>Download and limits</Heading>
      <HStack spacing={3} mb={5}><Button as="a" href="/comparison-results.json" download="comparison-results.json">Results JSON</Button><Button as="a" href="/kavaratti-locations.geojson" download="kavaratti-locations.geojson" variant="outline">Video endpoint GeoJSON</Button></HStack>
      {published.limits.map((limit) => <Text key={limit} mb={2}>• {limit}</Text>)}
      <Text color="gray.600">Location geometries contain workbook start and end points only; they are not frame GPS or reconstructed swim tracks.</Text>
    </Box>
  </VStack></Container></Box>;
}
