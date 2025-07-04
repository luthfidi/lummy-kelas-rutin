// src/theme.ts
import { extendTheme } from "@chakra-ui/react";
import type { ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    purple: {
      50: "#F6F4FF",
      100: "#EDE9FF",
      200: "#D9CFFF",
      300: "#C5B6FF",
      400: "#A48BFA",
      500: "#8A6EF7",
      600: "#7455E9",
      700: "#5C3CDB",
      800: "#482BBD",
      900: "#38219E",
    },
  },
  fonts: {
    heading: "system-ui, sans-serif",
    body: "system-ui, sans-serif",
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "purple",
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "full",
        px: 2,
        py: 0.5,
        fontWeight: "medium",
        fontSize: "xs",
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
    },
  },
});

export default theme;
