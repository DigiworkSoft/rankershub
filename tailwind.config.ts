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
        primary: "#4f46e5",
        "primary-dark": "#4338ca",
        "primary-light": "#eef2ff",
        secondary: "#facc15",
        accent: "#1e3a8a",
      },
      fontFamily: {
        sans: ["Inter", "Outfit", "ui-sans-serif", "system-ui"],
        display: ["Outfit", "Inter", "ui-sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      animation: {
        "orb-float": "orbFloat 8s ease-in-out infinite",
        "orb-pulse": "orbPulse 4s ease-in-out infinite",
      },
      keyframes: {
        orbFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        orbPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "0.9" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
