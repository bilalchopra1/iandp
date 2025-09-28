 /** @type {import('tailwindcss').Config} */
 module.exports = {
      content: [
     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
     "./components/**/*.{js,ts,jsx,tsx,mdx}",
     "../../packages/ui/**/*.{js,ts,jsx,tsx}",
   ],
   theme: {
     extend: {
       backgroundImage: {
         "ai-gradient":
           "linear-gradient(to right, theme('colors.blue.400'), theme('colors.purple.400'), theme('colors.pink.400'))",
       },
     },
   },
   plugins: [],
 };
