import type { Metadata } from "next";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Box } from "@chakra-ui/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coral Bleaching Detection | AI-Powered Reef Monitoring",
  description: "Advanced AI detection meets scientific validation. Upload reef footage and get instant, research-grade bleaching analysis with dual-method comparison.",
  keywords: "coral bleaching, reef monitoring, AI detection, YOLOv8, HSV analysis, marine conservation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Box display="flex" flexDirection="column" minH="100vh">
            <Navbar />
            <Box as="main" flex="1">
              {children}
            </Box>
            <Footer />
          </Box>
        </Providers>
      </body>
    </html>
    
  );
}