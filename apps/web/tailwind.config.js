/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'ai-gradient': 'linear-gradient(to right, #326bc6, #7ec4fc, #d2c7f3, #faa2be)',
      },
    },
  },
  plugins: [],
};