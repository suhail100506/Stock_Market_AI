/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable class-based dark mode
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand & Theme Palette
        brand: {
          light: '#405CF5',
          DEFAULT: '#405CF5',
          hover: '#3049D8',
          dark: '#627BFF',
          darkHover: '#4E68F0',
        },
        surface: {
          light: '#FFFFFF',
          lightBg: '#F3F6FC',
          lightBorder: '#E4E9F2',
          dark: '#18191D',
          darkElevated: '#202228',
          darkBg: '#101114',
          darkBorder: '#30333B',
        },
        textPrimary: {
          light: '#172033',
          dark: '#F4F6FC',
        },
        textSecondary: {
          light: '#69758A',
          dark: '#A0A7B5',
        },
        trade: {
          gain: '#07966A',
          gainDark: '#19B88A',
          loss: '#E5484D',
          lossDark: '#FF6268',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 20px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
