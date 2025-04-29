/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        animation: {
          'bg-pan': 'bg-pan 15s ease infinite',
        },
        keyframes: {
          'bg-pan': {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
          },
        },
      },
    },
    plugins: [],
  }
  