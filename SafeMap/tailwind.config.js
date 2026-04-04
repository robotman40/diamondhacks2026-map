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
        background: "#0f1a2e",
        surface: "#1a2840",
        input: "#1e3048",
        accent: "#2dd4a8",
        danger: "#ef6461",
        "text-primary": "#ffffff",
        "text-muted": "#8899aa",
        border: "#243447",
      },
    },
  },
  plugins: [],
};
