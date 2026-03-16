/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: 'var(--bg)',
          panel: 'var(--surface)',
          panelHover: 'var(--surface2)',
          appTag: 'var(--surface3)',
          border: 'var(--border)',
          borderBright: 'var(--border-bright)',
          primary: 'var(--primary)',
          primaryGlow: 'var(--primary-glow)',
          accent: 'var(--accent)',
          accentGlow: 'var(--accent-glow)',
          gold: 'var(--gold)',
          text: 'var(--text)',
          textDim: 'var(--text-dim)',
          textMuted: 'var(--text-muted)',
          rarity: {
            common: 'var(--common)',
            rare: 'var(--rare)',
            epic: 'var(--epic)',
            legendary: 'var(--legendary)',
          }
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
        mono: ['Orbitron', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 10px var(--primary-glow)',
        'glow-accent': '0 0 10px var(--accent-glow)',
        'card': 'var(--shadow)',
        'card-hover': 'var(--shadow-hover)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
