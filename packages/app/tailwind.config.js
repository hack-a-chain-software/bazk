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
          800: '#1A4748',
          500: '#12D97C',

          font: {
            1: '#1E293B',
            2: '#475569',
          },

          blue: {
            600: '#0540F2',
            500: '#624BFF',
            200: '#E0DBFF',
            100: '#E6ECFE',
          },

          green: {
            500: '#198754',
            100: '#DCF2E9',
          },

          red: {
            500: '#B02A37',
            100: '#F8D7DA',
          },

          cyan: {
            500: '#087990',
            100: '#CFF4FC',
          },

          yellow: {
            500: '#997404',
            100: '#FFF3CD',
          },

          purple: {
            500: '#4E3CCC',
            100: '#E0DBFF',
          },

          orange: {
            500: '#FFD3B2',
            100: '#B34D00',
          },

          pink: {
            500: '#B34579',
            100: '#FFD9EB',
          },

          grey: {
            500: '#CBD5E1',
            400: '#DEE2E6',
            300: '#F1F5F9',
            200: '#F8FAFC',
          },

          'dark-blue': {
            DEFAULT: '#1B233B',

            700: '#373E53',
            900: '#1B233B',
          }
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

