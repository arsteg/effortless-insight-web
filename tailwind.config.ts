import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Calm Intelligence accent families (see DESIGN_SYSTEM.md)
        azure: {
          DEFAULT: 'hsl(var(--azure))',
          50: '#eaf5fd',
          100: '#d2eafb',
          200: '#a9d6f6',
          300: '#74bcef',
          400: '#3aa0e7',
          500: '#0e93e0',
          600: '#0a78bd',
          700: '#0a6199',
          800: '#0d4f7b',
          900: '#103f61',
          950: '#0a2740',
        },
        mint: {
          DEFAULT: 'hsl(var(--mint))',
          50: '#e6f6ef',
          100: '#c8ecdb',
          200: '#95dcbd',
          300: '#5ec69b',
          400: '#31ac7c',
          500: '#1f9968',
          600: '#157a53',
          700: '#0f6144',
          800: '#0d4d37',
          900: '#0b3f2e',
        },
        coral: {
          DEFAULT: 'hsl(var(--coral))',
          50: '#fdeee9',
          100: '#fbd9cf',
          200: '#f7b3a2',
          300: '#f28a72',
          400: '#ee6a54',
          500: '#e8563e',
          600: '#cf3d28',
          700: '#ac2f1f',
          800: '#8a281d',
          900: '#71241c',
        },
        amber: {
          DEFAULT: 'hsl(var(--amber))',
          50: '#fdf4e3',
          100: '#fae4bd',
          200: '#f5cd84',
          300: '#f0b451',
          400: '#eca02f',
          500: '#e08d17',
          600: '#c1700f',
          700: '#9a5410',
          800: '#7d4413',
          900: '#673913',
        },
        lavender: {
          DEFAULT: 'hsl(var(--lavender))',
          50: '#f1eefc',
          100: '#e5defb',
          200: '#cec1f6',
          300: '#b19cf0',
          400: '#977ce8',
          500: '#7f5fdd',
          600: '#6b48cc',
          700: '#5a3aad',
          800: '#4a318c',
          900: '#3d2b71',
        },
        risk: {
          low: '#1f9968',
          medium: '#e08d17',
          high: '#e8563e',
          critical: '#cf3d28',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Refined, neutral elevation scale — soft layered shadows instead of
        // colored glows, for a calmer, more premium feel.
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        card: '0 1px 3px rgb(15 23 42 / 0.04), 0 10px 26px -8px rgb(15 23 42 / 0.10)',
        elevated:
          '0 2px 8px -2px rgb(15 23 42 / 0.06), 0 20px 44px -14px rgb(15 23 42 / 0.16)',
        premium:
          '0 4px 14px -6px rgb(15 23 42 / 0.10), 0 34px 64px -24px rgb(15 23 42 / 0.24)',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(14, 165, 233, 0.4)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(14, 165, 233, 0.1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
