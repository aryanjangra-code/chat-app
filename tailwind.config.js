/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F14",
          900: "#12181F",
          800: "#1A222B",
          700: "#242E39",
          600: "#37424E",
        },
        paper: {
          50: "#FAF9F6",
          100: "#F2F0EA",
        },
        signal: {
          DEFAULT: "#F5A15D",
          soft: "#FCD9B3",
        },
        wire: "#4FBBC4",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        bubble: "0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
