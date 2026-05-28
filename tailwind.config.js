/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          50: "#f4fbf4",
          100: "#e6f6e7",
          500: "#22c55e",
          700: "#15803d"
        },
        draw: {
          400: "#facc15",
          500: "#eab308"
        },
        away: {
          500: "#ef4444",
          600: "#dc2626"
        }
      },
      boxShadow: {
        poster: "0 30px 80px rgba(15, 23, 42, 0.28)",
        glowGreen: "0 0 24px rgba(34, 197, 94, 0.42)",
        glowYellow: "0 0 24px rgba(250, 204, 21, 0.38)",
        glowRed: "0 0 24px rgba(239, 68, 68, 0.34)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
