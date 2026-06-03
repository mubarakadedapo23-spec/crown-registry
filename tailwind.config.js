const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Crown Registry design tokens
        crown: {
          gold: "#C9A84C",
          "gold-dark": "#8B6914",
          "gold-light": "#F0D080",
          "gold-pale": "rgba(201,168,76,0.12)",
          obsidian: "#050505",
          "obsidian-mid": "#0A0A0A",
          "obsidian-light": "#111111",
          ivory: "#F0EAD0",
          "ivory-muted": "#C8BFA0",
          ash: "#666666",
          "ash-dark": "#444444",
          "ash-darker": "#222222",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#C9A84C",
          foreground: "#050505",
        },
        secondary: {
          DEFAULT: "#111111",
          foreground: "#F0EAD0",
        },
        muted: {
          DEFAULT: "#0A0A0A",
          foreground: "#666666",
        },
        destructive: {
          DEFAULT: "#7f1d1d",
          foreground: "#fef2f2",
        },
        card: {
          DEFAULT: "#0A0A0A",
          foreground: "#F0EAD0",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", ...fontFamily.serif],
        sans: ["Montserrat", ...fontFamily.sans],
        mono: ["JetBrains Mono", ...fontFamily.mono],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem", letterSpacing: "0.1em" }],
        xs: ["0.75rem", { lineHeight: "1.125rem" }],
      },
      letterSpacing: {
        widest: "0.3em",
        "ultra-wide": "0.4em",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)",
        "gold-shimmer":
          "linear-gradient(90deg, #8B6914, #C9A84C, #F0D080, #C9A84C, #8B6914)",
        "dark-gradient":
          "linear-gradient(180deg, #050505 0%, #0A0803 50%, #050505 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(201,168,76,0.05) 0%, transparent 100%)",
        "hero-grid": `
          linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)
        `,
      },
      boxShadow: {
        gold: "0 0 30px rgba(201,168,76,0.15), 0 0 60px rgba(201,168,76,0.05)",
        "gold-sm": "0 4px 20px rgba(201,168,76,0.15)",
        "gold-lg":
          "0 24px 60px rgba(201,168,76,0.15), 0 0 0 1px rgba(201,168,76,0.3)",
        "card-hover":
          "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.2)",
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-in": "slideIn 0.4s ease forwards",
        "pulse-border": "pulseBorder 2s ease infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideIn: {
          from: { opacity: 0, transform: "translateX(-16px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        pulseBorder: {
          "0%, 100%": { borderColor: "rgba(201,168,76,0.2)" },
          "50%": { borderColor: "rgba(201,168,76,0.6)" },
        },
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "2px",
        md: "4px",
        lg: "6px",
        xl: "8px",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
