import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      '#0F1923',   // dark navy — main background
          surface: '#162230',   // slightly lighter — cards, sidebars
          accent:  '#E01B2D',   // CrowdStrike red — active states, highlights
          text:    '#FFFFFF',   // primary text
          muted:   '#8899AA',   // secondary / subdued text
          border:  '#243446',   // subtle dividers
        },
      },
    },
  },
  plugins: [],
}

export default config
