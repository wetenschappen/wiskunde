/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        primary: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
        },
        bakery: {
          light: '#fff7ed',
          border: '#fed7aa',
          DEFAULT: '#f97316',
          dark: '#c2410c',
        },
        brand: {
          dark: '#0B1120', // Deep Midnight Blue
          mid: '#1E293B',  // Slate 800-ish
          orange: '#F97316', // Bright Orange
          accent: '#FDA4AF', // Soft Pink/Rose (Complementary accent)
        },
        lab: {
          light: '#f5f3ff',
          border: '#ddd6fe',
          DEFAULT: '#7c3aed',
          dark: '#5b21b6',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'lift': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      }
    },
  },
  plugins: [],
}
