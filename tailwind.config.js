/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f2f3ff",
          100: "#e6e7f4",
          200: "#b2c5ff",
          300: "#6b8fff",
          500: "#006aff",
          600: "#0053cc",
          700: "#0040a1",
          900: "#191b24",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};