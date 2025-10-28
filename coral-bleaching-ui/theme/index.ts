import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      cream: "#FFFDD0",
      brown: "#8B4513",
      aqua: "#4FC3F7",
      grayBg: "#F5F5F5",
    },
    // Enhanced color palette
    cyan: {
      50: "#E0F7FA",
      100: "#B2EBF2",
      200: "#80DEEA",
      300: "#4DD0E1",
      400: "#26C6DA",
      500: "#00BCD4",
      600: "#00ACC1",
      700: "#0097A7",
      800: "#00838F",
      900: "#006064",
    },
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
        fontFeatureSettings: "'kern', 'liga', 'calt'",
      },
      "*::placeholder": {
        color: "gray.400",
      },
      "*, *::before, &::after": {
        borderColor: "gray.200",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "xl",
        transition: "all 0.2s",
      },
      sizes: {
        lg: {
          h: "12",
          minW: "12",
          fontSize: "lg",
          px: "8",
        },
      },
      variants: {
        solid: {
          bg: "cyan.500",
          color: "white",
          _hover: {
            bg: "cyan.600",
            transform: "translateY(-2px)",
            shadow: "lg",
          },
          _active: {
            bg: "cyan.700",
            transform: "translateY(0)",
          },
        },
        outline: {
          borderWidth: "2px",
          borderColor: "gray.300",
          _hover: {
            bg: "gray.50",
            borderColor: "cyan.400",
          },
        },
      },
      defaultProps: {
        colorScheme: "cyan",
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "full",
        px: 3,
        py: 1,
        fontWeight: "bold",
        textTransform: "uppercase",
        fontSize: "xs",
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: "bold",
        letterSpacing: "tight",
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "2xl",
          overflow: "hidden",
          shadow: "sm",
          transition: "all 0.3s",
          _hover: {
            shadow: "lg",
            transform: "translateY(-4px)",
          },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: "xl",
            borderWidth: "2px",
            _focus: {
              borderColor: "cyan.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-cyan-500)",
            },
          },
        },
      },
      defaultProps: {
        variant: "outline",
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            borderRadius: "xl",
            borderWidth: "2px",
            _focus: {
              borderColor: "cyan.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-cyan-500)",
            },
          },
        },
      },
      defaultProps: {
        variant: "outline",
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "3xl",
          overflow: "hidden",
        },
        header: {
          fontWeight: "bold",
          fontSize: "xl",
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            borderRadius: "lg",
            fontWeight: "semibold",
            _selected: {
              color: "cyan.600",
              borderColor: "cyan.600",
              borderBottomColor: "white",
            },
          },
        },
      },
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  shadows: {
    outline: "0 0 0 3px rgba(0, 188, 212, 0.6)",
  },
});

export default theme;