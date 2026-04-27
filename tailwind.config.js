/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        fadeIn:  'fadeIn 0.25s ease-out',
        pulse2:  'pulse2 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
