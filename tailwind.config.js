/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#8193f8',
          500: '#6470f1',
          600: '#5054e4',
          700: '#4341ca',
          800: '#3837a3',
          900: '#323481',
          950: '#1e1f4c',
        },
        slate: {
          50: 'rgb(var(--tw-custom-slate-50) / <alpha-value>)',
          100: 'rgb(var(--tw-custom-slate-100) / <alpha-value>)',
          200: 'rgb(var(--tw-custom-slate-200) / <alpha-value>)',
          300: 'rgb(var(--tw-custom-slate-300) / <alpha-value>)',
          400: 'rgb(var(--tw-custom-slate-400) / <alpha-value>)',
          500: 'rgb(var(--tw-custom-slate-500) / <alpha-value>)',
          600: 'rgb(var(--tw-custom-slate-600) / <alpha-value>)',
          700: 'rgb(var(--tw-custom-slate-700) / <alpha-value>)',
          800: 'rgb(var(--tw-custom-slate-800) / <alpha-value>)',
          900: 'rgb(var(--tw-custom-slate-900) / <alpha-value>)',
          950: 'rgb(var(--tw-custom-slate-950) / <alpha-value>)',
        },
        sky: {
          50: 'rgb(var(--tw-custom-sky-50) / <alpha-value>)',
          100: 'rgb(var(--tw-custom-sky-100) / <alpha-value>)',
          200: 'rgb(var(--tw-custom-sky-200) / <alpha-value>)',
          300: 'rgb(var(--tw-custom-sky-300) / <alpha-value>)',
          400: 'rgb(var(--tw-custom-sky-400) / <alpha-value>)',
          500: 'rgb(var(--tw-custom-sky-500) / <alpha-value>)',
          600: 'rgb(var(--tw-custom-sky-600) / <alpha-value>)',
          700: 'rgb(var(--tw-custom-sky-700) / <alpha-value>)',
          800: 'rgb(var(--tw-custom-sky-800) / <alpha-value>)',
          900: 'rgb(var(--tw-custom-sky-900) / <alpha-value>)',
          950: 'rgb(var(--tw-custom-sky-950) / <alpha-value>)',
        },
        // Semantic tokens backed by CSS variables — auto dark-mode aware
        surface:    'var(--color-surface)',
        border:     'var(--color-border)',
        'text-muted': 'var(--color-text-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.slate.800'),
            maxWidth: 'none',
          }
        },
        dark: {
          css: {
            color: theme('colors.slate.200'),
          }
        }
      })
    },
  },
  plugins: [],
}
