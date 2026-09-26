import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand — Amber/Gold
        primary: {
          DEFAULT: '#F5A623',
          dark: '#B36D0F',
          light: '#FFC857',
        },
        // Brand — Teal
        accent: {
          DEFAULT: '#00C9A7',
          dark: '#00A88A',
          light: '#33D4B8',
        },
        // Page background
        base: {
          DEFAULT: '#FAFAF8',
          dark: '#0F1115',
        },
        // Card/surface backgrounds
        elevated: {
          DEFAULT: '#FFFFFF',
          dark: '#1A1D23',
          secondary: '#F5F4F1',
          'secondary-dark': '#23262D',
        },
        // Text / icon colors
        content: {
          DEFAULT: '#1A1A1A',
          secondary: '#6B6B6B',
          tertiary: '#9A9A9A',
          'dark': '#F5F5F5',
          'secondary-dark': '#A0A0A0',
          'tertiary-dark': '#707070',
        },
        // Divider / border colors
        line: {
          DEFAULT: '#E8E5DF',
          dark: '#2A2E36',
          secondary: '#F0EEEA',
          'secondary-dark': '#353940',
        },
        border: '#E8E5DF',
        // Status
        success: '#00C9A7',
        warning: '#FFB020',
        error: '#FF4D4F',
        info: '#3B82F6',
      },
      fontFamily: {
        display: ['Instrument Sans', 'General Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['60px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['36px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-lg': ['30px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-md': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-sm': ['20px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['18px', { lineHeight: '1.5' }],
        'body-md': ['16px', { lineHeight: '1.5' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'body-xs': ['12px', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.04)',
        'md': '0 4px 12px rgba(0,0,0,0.06)',
        'lg': '0 12px 32px rgba(0,0,0,0.08)',
        'xl': '0 24px 64px rgba(0,0,0,0.12)',
        'glow': '0 0 24px rgba(245,166,35,0.35)',
        'glow-teal': '0 0 24px rgba(0,201,167,0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
