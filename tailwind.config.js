/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc4fa',
          400: '#36a5f5',
          500: '#0c87eb',
          600: '#026bc9',
          700: '#0355a3',
          800: '#074886',
          900: '#0c3d6f',
          950: '#07264a',
          depth: '#04162e',
          banner: '#0a305e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        script: ['"Caveat"', '"Dancing Script"', 'cursive'],
      }
    },
  },
  plugins: [],
}
