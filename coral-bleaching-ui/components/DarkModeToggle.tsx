"use client";

import { IconButton, useColorMode, useColorModeValue, Tooltip } from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const hoverBg = useColorModeValue("gray.200", "gray.600");

  return (
    <Tooltip label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`} placement="bottom">
      <IconButton
        aria-label="Toggle dark mode"
        icon={colorMode === "light" ? <Moon size={20} /> : <Sun size={20} />}
        onClick={toggleColorMode}
        bg={bgColor}
        _hover={{ bg: hoverBg }}
        borderRadius="lg"
        transition="all 0.3s"
      />
    </Tooltip>
  );
}