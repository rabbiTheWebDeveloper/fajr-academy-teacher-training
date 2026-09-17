/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx,mdx}',
    './src/components/**/*.{js,jsx,ts,tsx,mdx}',
    './src/pages/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ── Fonts ── */
      fontFamily: {
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
        amiri: ['Amiri', 'Georgia', 'serif'],
      },

      /* ── Brand Colour Palette ── */
      colors: {
        navy: {
          950: '#02080F',
          900: '#050F24',
          800: '#081832',
          700: '#0D2450',
          600: '#173A78',
        },
        gold: {
          100: '#FBF6E9',
          200: '#F4E7B6',
          300: '#EBD07B',
          400: '#D9B44A',
          500: '#C79E2E',
          600: '#A8801B',
        },
        cream: {
          50:  '#FDFBF6',
          100: '#F7F3E9',
          200: '#EFE7D2',
          300: '#E0D4B6',
        },
        ink: {
          900: '#0A1626',
          700: '#1E2A3A',
          500: '#4A5568',
          300: '#94A3B8',
        },
        men: {
          DEFAULT: '#1A3FA8',
          light:   '#3B6CE8',
        },
        women: {
          DEFAULT: '#8B0A4E',
          light:   '#D63A8B',
        },
        wa: '#25D366',
      },

      /* ── Background Images / Gradients ── */
      backgroundImage: {
        'gold-gradient':    'linear-gradient(135deg, #F7D96C 0%, #D9B44A 45%, #C79E2E 100%)',
        'fee-gradient':     'linear-gradient(140deg, #0D2450 0%, #050F24 55%, #02080F 100%)',
        'card-gradient':    'linear-gradient(170deg, #0A1F44 0%, #050F24 60%, #02080F 100%)',
        'cta-gradient':     'linear-gradient(160deg, #02080F 0%, #0D2450 50%, #050F24 100%)',
        'process-gradient': 'linear-gradient(180deg, #EFE7D2 0%, #F7F3E9 100%)',
      },

      /* ── Box Shadows ── */
      boxShadow: {
        'gold':    '0 8px 28px rgba(217,180,74,0.45)',
        'gold-lg': '0 16px 48px rgba(217,180,74,0.65)',
        'navy':    '0 16px 48px rgba(8,24,50,0.55)',
        'card':    '0 22px 56px rgba(0,0,0,0.5)',
      },

      /* ── Animations ── */
      keyframes: {
        'rise-in': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'rise-in-slow': {
          '0%':   { opacity: '0', transform: 'translateY(36px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gold-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.75' },
        },
        'gold-ripple': {
          '0%':   { transform: 'scale(1)',   opacity: '0.5' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'green-ripple': {
          '0%':   { boxShadow: '0 0 0 0 rgba(34,197,94,0.7)' },
          '70%':  { boxShadow: '0 0 0 8px rgba(34,197,94,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      animation: {
        'rise-in':       'rise-in 0.7s cubic-bezier(0.4,0,0.2,1) both',
        'rise-in-slow':  'rise-in-slow 0.9s cubic-bezier(0.4,0,0.2,1) 0.15s both',
        'gold-pulse':    'gold-pulse 3.5s ease-in-out infinite',
        'gold-ripple':   'gold-ripple 2s ease-out infinite',
        'green-ripple':  'green-ripple 2s ease-out infinite',
        'drift':         'drift 6s ease-in-out infinite',
        'shimmer':       'shimmer 6s ease-in-out infinite',
      },

      /* ── Typography Sizes ── */
      fontSize: {
        'xs2': '0.68rem',
        'xxs': '0.6rem',
      },

      /* ── Border Radius ── */
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      /* ── Spacing extras ── */
      spacing: {
        '4.5':   '1.125rem',
        '5.5':   '1.375rem',
        '6.5':   '1.625rem',
        '7.5':   '1.875rem',
        '8.5':   '2.125rem',
        '9.5':   '2.375rem',
        '10.5':  '2.625rem',
        '11.5':  '2.875rem',
        '12.5':  '3.125rem',
        '13':    '3.25rem',
        '13.5':  '3.375rem',
        '15':    '3.75rem',
        '15.5':  '3.875rem',
        '17':    '4.25rem',
        '55':    '13.75rem',
        '175':   '43.75rem',
      },
    },
  },
  plugins: [],
}
