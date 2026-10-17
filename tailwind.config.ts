import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gym: {
          bg: "#0a0a0a",
          card: "#121212",
          cardHover: "#171717",
          border: "#262626",
          borderHover: "#3f3f46",
          silver: "#e2e8f0",
          silverMuted: "#94a3b8",
          lime: "#84cc16",
          limeLight: "#a3e635",
          limeDark: "#65a30d",
          limeGlow: "rgba(132, 204, 22, 0.4)",
        },
      },
      boxShadow: {
        "lime-sm": "0 0 10px rgba(132, 204, 22, 0.25)",
        "lime-md": "0 0 20px rgba(132, 204, 22, 0.35)",
        "lime-lg": "0 0 35px rgba(132, 204, 22, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
