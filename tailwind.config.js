/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-cyan': '#00D4FF',
        'eco-green': '#00F5A0',
        'eco-amber': '#FFD700',
        'eco-orange': '#FF6B00',
        'eco-red': '#FF3333',
        'eco-blue': '#0066FF',
        'eco-dark': '#060D1A',
        'eco-panel': '#0A1628',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
