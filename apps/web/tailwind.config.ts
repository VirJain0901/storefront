import type { Config } from "tailwindcss";

// Tokens pulled from the Storefront deck's existing brand:
// warm cream background, terracotta/brown accents, mustard highlight.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F4F1E8",
        bark: "#5A3418",
        terracotta: "#D2691E",
        mustard: "#E8A33D",
        ink: "#2B1B0F",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
