/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bazk: {
          DEFAULT: '#12D97C',
          '500': '#12D97C',
        },

        'dark-blue': {
          DEFAULT: '#1B233B',
          '500': '#1B233B',
          '600': '#1E293B',
        }
      }
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1600px',
      '4xl': '1920px',
    },
  },
  plugins: [],
}

