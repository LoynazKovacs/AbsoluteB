/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite'
      },
      colors: {
        primary: {
          light: '#ffc444',
          dark: '#373536'
        },
        background: {
          light: '#cac3c0',
          dark: '#1f1f1f'
        },
      },
    },
  },
  plugins: [],
};
