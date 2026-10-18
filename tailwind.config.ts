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
          bg: "var(--gym-bg)",
          card: "var(--gym-card)",
          cardHover: "var(--gym-card-hover)",
          cardAlt: "var(--gym-card-alt)",
          cardInner: "var(--gym-card-inner)",
          border: "var(--gym-border)",
          borderHover: "var(--gym-border-hover)",
          silver: "var(--gym-silver)",
          silverMuted: "var(--gym-silver-muted)",
          text: "var(--gym-text-primary)",
          textMuted: "var(--gym-text-muted)",
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
