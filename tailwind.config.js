/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kango-blue': {
          50: '#e6f2ff',   // 最も薄い青
          100: '#b3dcff',  // 薄い青
          200: '#80c6ff',  // 明るい青
          300: '#4db0ff',  // 中間の青
          400: '#1a9aff',  // メインブルー
          500: '#0084e6',  // 深い青
          600: '#006ecc',  // ダークブルー
          700: '#0058b2',  // さらに深い青
          800: '#004299',  // 濃い青
          900: '#002b7f'   // 最も濃い青
        },
        'kango-gray': {
          50: '#f9f9f9',  // 最も薄いグレー
          100: '#f0f0f0', // 薄いグレー
          200: '#e0e0e0', // 明るいグレー
          300: '#d0d0d0', // 中間のグレー
          400: '#b0b0b0', // やや濃いグレー
          500: '#808080', // 標準のグレー
          600: '#606060', // ダークグレー
          700: '#404040', // さらに濃いグレー
          800: '#303030', // 濃いグレー
          900: '#202020'  // 最も濃いグレー
        }
      },
      fontFamily: {
        'sans': ['Noto Sans JP', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'kango-card': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'kango': '10px',
      }
    },
  },
  plugins: [],
}