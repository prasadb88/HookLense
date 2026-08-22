/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#08090C",
        panelBg: "#0F1117",
        borderSubtle: "#1E232F",
      },
    },
  },
  plugins: [],
}