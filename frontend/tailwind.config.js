/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        redline: ['Orbitron', 'sans-serif'],
      },
      colors: {
        redline: '#d00000',
        dark: '#1a1a1a',
        grayish: '#2e2e2e',
      },
    },
  },
  plugins: [],
}
