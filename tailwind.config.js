/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cloud-white': '#F5F7FA',
        'deep-atmosphere': '#0B1526',
        'amber-flare': '#FFB454',
        'storm-violet': '#7C6FF0',
        'signal-red': '#FF6B6B',
        sky: {
          'clear-day-from': '#4FA8E0',
          'clear-day-to': '#8FD3F4',
          'clear-night-from': '#0B1526',
          'clear-night-to': '#1B2A4A',
          'cloudy-from': '#6B7B8C',
          'cloudy-to': '#9AA7B0',
          'rain-from': '#33465A',
          'rain-to': '#56707E',
          'storm-from': '#241B3A',
          'storm-to': '#443A66',
          'snow-from': '#B9CBDA',
          'snow-to': '#E7F0F7',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      fontSize: {
        'hero-temp': ['96px', { lineHeight: '1' }],
        'section-head': ['20px', { lineHeight: '1.3' }],
        'body': ['15px', { lineHeight: '1.5' }],
        'micro': ['13px', { lineHeight: '1.4' }],
      },
      borderRadius: {
        'glass': '20px',
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
}
