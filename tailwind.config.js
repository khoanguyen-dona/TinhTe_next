/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
      './app/**/*.{js,ts,jsx,tsx}', // if using App Router
    ],
    theme: {
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      }
    },
    plugins: [require("tailwindcss-animate")],
    
  };