import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1f26",
        brand: "#0b6b63",
        health: "#0e7490",
        healthsoft: "#d6f1f6",
        refresh: "#4d9a2e",
        refreshsoft: "#e2f3d2",
        mist: "#eaf4ef",
        alert: "#b91c1c",
      },
      fontFamily: { sans: ["var(--font-jakarta)", "system-ui", "sans-serif"] },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15,31,38,0.18)",
        card: "0 4px 18px -8px rgba(15,31,38,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;