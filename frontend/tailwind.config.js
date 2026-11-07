/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172b4d',
        muted: '#71809b',
        brand: { 50: '#eef5ff', 100: '#dceaff', 500: '#3978e8', 600: '#2463d1', 700: '#1e4fa8' }
      },
      boxShadow: { card: '0 12px 40px rgba(32, 71, 133, .07)' }
    }
  },
  plugins: []
};
