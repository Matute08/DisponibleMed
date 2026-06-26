export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        med: {
          50: '#edf8f6',
          100: '#d7efeb',
          200: '#b7ded7',
          600: '#168277',
          700: '#126a62',
          900: '#143c3a'
        },
        blush: {
          50: '#fff4f1',
          100: '#ffe6df',
          200: '#ffd0c3'
        },
        calm: {
          50: '#f3f7ff',
          100: '#e7efff',
          200: '#d5e3ff'
        }
      }
    }
  },
  plugins: []
};
