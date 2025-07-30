import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        'game-blue': 'var(--game-blue)',
        'game-red': 'var(--game-red)',
        'game-green': 'var(--game-green)',
        'game-yellow': 'var(--game-yellow)',
        'game-gray': 'var(--game-gray)',
        'game-surface': 'var(--game-surface)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config