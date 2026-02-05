import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-0': 'var(--bg-0)',
        'bg-1': 'var(--bg-1)',
        'bg-2': 'var(--bg-2)',
        'glass-1': 'var(--glass-1)',
        'glass-2': 'var(--glass-2)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-gold': 'var(--accent-gold)',
        'accent-rose': 'var(--accent-rose)',
        'accent-lime': 'var(--accent-lime)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)'
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 30px rgba(74, 219, 232, 0.35)',
        glowGold: '0 0 28px rgba(241, 200, 107, 0.35)',
        glass: '0 20px 60px rgba(0, 0, 0, 0.45)'
      },
      backdropBlur: {
        xl: '24px'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0, -12px, 0) scale(1.02)' }
        },
        breathe: {
          '0%, 100%': { opacity: '0.65', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' }
        },
        equalize: {
          '0%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
          '100%': { transform: 'scaleY(0.5)' }
        }
      },
      animation: {
        floatSlow: 'float 12s ease-in-out infinite',
        breathe: 'breathe 8s ease-in-out infinite',
        shimmer: 'shimmer 10s ease-in-out infinite',
        equalize: 'equalize 1.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
} satisfies Config;
