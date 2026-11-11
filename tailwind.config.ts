import type { Config } from "tailwindcss";

/**
 * Syndiq Fit design tokens.
 * Surfaces and text use CSS variables (see globals.css) so light/dark switch without per-component dark: variants.
 * Accent: lime (brand, matches logo) used sparingly; turquoise as secondary data accent.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
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
          ink: "#0b1004",
          lime: "#C6F432",
          limeLight: "#d9fb6a",
          limeDark: "#4d7c0f",
          limeGlow: "rgba(198, 244, 50, 0.35)",
          turquoise: "#22d3ee",
          turquoiseLight: "#67e8f9",
          turquoiseDark: "#0e7490",
        },
      },
      boxShadow: {
        "lime-sm": "none",
        "lime-md": "none",
        "lime-lg": "none",
        "cyan-sm": "none",
        float: "0 10px 30px -8px rgba(0,0,0,0.45)",
      },
      maxWidth: {
        page: "72rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
