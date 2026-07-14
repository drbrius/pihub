import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#15130e",
          soft: "#211e17",
          mute: "#3c372b",
        },
        paper: "#fbf9f4",
        ivory: "#f4efe4",
        gold: {
          light: "#d9bd6e",
          DEFAULT: "#b3903f",
          dark: "#8a6d2c",
        },
        stone: "#767059",
        hairline: "#e8e1cf",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Didot", "Bodoni MT", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.28em",
        wide2: "0.16em",
      },
    },
  },
  plugins: [],
};
export default config;
