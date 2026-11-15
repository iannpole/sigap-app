import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2433",
        krem: "#FAF7EC",
        blue: "#1F5FD1",
        yellow: "#F5C400",
        grey: "#3F4945",
        brand: "#005144",
        mint: "#B8EEDE",
        mist: "#EFF4FF",
        alert: "#94000C",
        health: "#176B5B",
        healthsoft: "#B8EEDE",
        refresh: "#34675B",
        refreshsoft: "#EFF4FF",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15,31,38,0.18)",
        card: "0 4px 18px -8px rgba(15,31,38,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;