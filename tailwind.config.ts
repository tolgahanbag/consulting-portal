import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: "#f0f1f5",
          100: "#d9dce6",
          200: "#b3b9cd",
          300: "#8d96b4",
          400: "#67739b",
          500: "#4a5682",
          600: "#3a4468",
          700: "#2a324e",
          800: "#1a2035",
          900: "#0d1221",
          950: "#070a14",
        },
        gold: {
          50: "#fefaf0",
          100: "#fdf2d4",
          200: "#fbe5a8",
          300: "#f8d47a",
          400: "#f5c04c",
          500: "#d4a032",
          600: "#b3862a",
          700: "#8a6720",
          800: "#614817",
          900: "#3d2e0e",
        },
        slate: {
          850: "#172033",
        },
        notion: {
          bg: "#ffffff",
          "bg-secondary": "#f7f6f3",
          "bg-hover": "#efefef",
          text: "#37352f",
          "text-secondary": "#787774",
          border: "#e9e9e7",
          sidebar: "#fbfbfa",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-mesh":
          "radial-gradient(ellipse at 20% 50%, rgba(212,160,50,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(74,86,130,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(212,160,50,0.05) 0%, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,160,50,0.3)" },
          "50%": { boxShadow: "0 0 0 12px rgba(212,160,50,0)" },
        },
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
        "glass-lg": "0 8px 32px rgba(0, 0, 0, 0.15)",
        "gold-glow": "0 0 40px rgba(212,160,50,0.15)",
        "card-hover": "0 20px 60px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
