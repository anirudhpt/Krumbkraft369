import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // KrumbKraft Brand Colors - Warm, Artisanal Bakery Theme
        krumb: {
          50: '#fef7f7',
          100: '#fdeaea',
          200: '#fad5d5',
          300: '#f5b5b5',
          400: '#e88888',
          500: '#AA5453', // Primary brand color - muted red
          600: '#954745',
          700: '#7a3b3a',
          800: '#653030',
          900: '#542828',
          950: '#2e1616',
        },
        sourdough: {
          50: '#f8f6f2',
          100: '#f0ece2',
          200: '#e1d8c5',
          300: '#cdbfa0',
          400: '#b7a47c',
          500: '#a89063', // Sourdough crust color
          600: '#997e57',
          700: '#7f674a',
          800: '#685442',
          900: '#564639',
          950: '#2f251d',
        },
        flour: {
          50: '#fdfdfc',
          100: '#faf9f7',
          200: '#f5f3ef',
          300: '#ede9e3',
          400: '#e1dbd1',
          500: '#d2c8b8', // Flour white
          600: '#bcad98',
          700: '#a0927c',
          800: '#867766',
          900: '#6e6154',
          950: '#39322a',
        },
        crust: {
          50: '#f7f3f0',
          100: '#ede4db',
          200: '#dcc9b8',
          300: '#c7a88f',
          400: '#b18766',
          500: '#a1704d', // Golden crust
          600: '#945e41',
          700: '#7b4d38',
          800: '#644033',
          900: '#53362d',
          950: '#2d1c17',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 25px -5px rgba(0, 0, 0, 0.1)',
        'warm': '0 10px 40px -10px rgba(238, 119, 36, 0.2), 0 4px 25px -5px rgba(238, 119, 36, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'bread-texture': 'linear-gradient(135deg, #f8f6f2 0%, #f0ece2 25%, #e1d8c5 50%, #f0ece2 75%, #f8f6f2 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
