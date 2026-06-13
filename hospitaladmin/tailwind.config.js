/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ef4444",
        "primary-hover": "#dc2626",
        "bg-color": "#0f172a",
        "card-bg": "rgba(30, 41, 59, 0.7)",
        "card-border": "rgba(255, 255, 255, 0.08)",
        "text-main": "#f8fafc",
        "text-muted": "#94a3b8",
        success: "#10b981",
        warning: "#f59e0b",
        red:       "#C8102E",
        "red-deep":  "#8B0A1E",
        "red-muted": "#E8364F",
        "red-faint": "#FDF0F1",
        bone:      "#FAF8F5",
        ink:       "#1A1210",
        "ink-2":     "#3D2B2B",
        "ink-3":     "#7A5F5F",
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}
