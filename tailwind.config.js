/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-green':  '#00F5A0',
        'eco-blue':   '#00D4FF',
        'eco-purple': '#7C6BFF',
        'eco-yellow': '#FFD166',
        'eco-red':    '#FF6B6B',
        'eco-dark':   '#000000',
        'eco-panel':  '#0A0A0A',
      },
      fontFamily: {
        'syne': ['Syne', 'sans-serif'],
        'mono': ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'float-orb': 'float-orb 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
