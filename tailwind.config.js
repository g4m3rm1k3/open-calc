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
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0f1117',
        }
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
