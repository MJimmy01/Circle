// hero.ts
import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0284c7",
          foreground: "#ffffff",
        },
      },
    },
    dark: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#38bdf8",
          foreground: "#0f172a",
        },
      },
    },
  },
});
