/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-peach': '#F9A88C',
        'brand-peach-dark': '#F7936E',
        'brand-text': '#333333',
        'brand-subtext': '#5E5E5E',
      },
       animation: {
        'float': 'float 12s ease-in-out infinite',
        'float-reverse': 'float-reverse 15s ease-in-out infinite',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-move': 'grid-move 60s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-5%) translateX(5%)' },
          '50%': { transform: 'translateY(5%) translateX(-5%)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(5%) translateX(-5%)' },
          '50%': { transform: 'translateY(-5%) translateX(5%)' },
        },
        'grid-move': {
          '0%': { backgroundPosition: '0 0, 0 0' },
            
        }
      },
    },
  },
  plugins: [],
};