/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff4ff',
          100: '#e6eeff',
          200: '#d0dbed',
          500: '#4648d4',
          600: '#464554',
          700: '#3323cc',
          900: '#121c2a',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#d0dbed',
          container: '#e6eeff',
          card: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(18, 28, 42, 0.04), 0 2px 4px -2px rgba(18, 28, 42, 0.04)',
        popover: '0 10px 15px -3px rgba(18, 28, 42, 0.08), 0 4px 6px -4px rgba(18, 28, 42, 0.05)',
      },
    },
  },
  plugins: [],
}
