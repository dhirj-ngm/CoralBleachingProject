import type { Metadata } from "next";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Box } from "@chakra-ui/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coral Bleaching Project | Measured Comparison",
  description: "External image benchmark and method-dependent Kavaratti video estimates with source and validation limits.",
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
