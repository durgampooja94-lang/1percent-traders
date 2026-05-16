/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#EFF8FF',
          100: '#DBEEFE',
          200: '#BAE0FD',
          300: '#7DCFFB',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        dark: {
          900: '#0A0A0F',
          800: '#111118',
          700: '#1A1A24',
          600: '#22222F',
          500: '#2E2E3E',
          400: '#3A3A4E',
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #050D1A 50%, #0A0A0F 100%)',
        'card-gradient': 'linear-gradient(135deg, #1A1A24 0%, #22222F 100%)',
        'brand-gradient': 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
