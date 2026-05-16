import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        panel: "#16181c",
        border: "#2f3336",
        muted: "#71767b",
        text: "#e7e9ea",
        accent: "#1d9bf0",
        accentHover: "#1a8cd8",
        like: "#f91880",
        repost: "#00ba7c",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
