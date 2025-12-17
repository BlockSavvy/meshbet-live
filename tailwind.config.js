/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#fafafa",
        card: "#171717",
        primary: {
          DEFAULT: "#00ffff",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#ff00ff",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#262626",
          foreground: "#a3a3a3",
        },
        accent: {
          DEFAULT: "#262626",
          foreground: "#fafafa",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fafafa",
        },
      },
      fontFamily: {
        mono: ["SpaceMono"],
        display: ["Orbitron"],
      },
    },
  },
  plugins: [],
};
