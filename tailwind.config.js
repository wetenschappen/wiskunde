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
        math: {
          blue:          '#2563EB',
          'blue-light':  '#DBEAFE',
          'blue-bg':     '#EFF6FF',
          orange:        '#EA580C',
          'orange-light':'#FED7AA',
          'orange-bg':   '#FFF7ED',
          emerald:       '#059669',
          'emerald-light':'#A7F3D0',
          'emerald-bg':  '#ECFDF5',
          violet:        '#7C3AED',
          'violet-light':'#DDD6FE',
          'violet-bg':   '#F5F3FF',
        },
        surface: {
          white: '#FFFFFF',
          50:    '#F8FAFC',
          100:   '#F1F5F9',
          200:   '#E2E8F0',
          300:   '#CBD5E1',
        },
        ink: {
          DEFAULT: '#1E293B',
          light:   '#475569',
          muted:   '#94A3B8',
          dark:    '#0F172A',
        },
        chrome: {
          dark:   '#1E293B',
          border: '#334155',
        },
        brand: {
          dark: '#0B1120',
          mid: '#1E293B',
          orange: '#F97316',
          accent: '#FDA4AF',
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
