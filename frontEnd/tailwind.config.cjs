/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-peach': '#F9A88C',
        'brand-peach-dark': '#F7936E',
        'brand-text': '#333333',
        'brand-subtext': '#5E5E5E',
      }
    },
  },
  plugins: [],
}