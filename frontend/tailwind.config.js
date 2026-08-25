/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Stitch Design Tokens ──────────────────────────────────────
      colors: {
        // Light mode surface tokens
        surface:                'var(--color-surface)',
        background:             'var(--color-background)',
        'surface-container':    'var(--color-surface-container)',
        'surface-container-low':'var(--color-surface-container-low)',
        'surface-container-high':'var(--color-surface-container-high)',
        'outline-variant':      'var(--color-outline-variant)',
        outline:                'var(--color-outline)',

        // Text tokens
        'on-surface':           'var(--color-on-surface)',
        secondary:              'var(--color-secondary)',

        // Primary / accent
        primary:                'var(--color-primary)',
        'on-primary':           'var(--color-on-primary)',
        'primary-container':    'var(--color-primary-container)',

        // Status
        positive:               '#10B981',
        negative:               '#EF4444',
        'positive-bg':          'var(--color-positive-bg)',
        'negative-bg':          'var(--color-negative-bg)',
        warning:                '#F59E0B',
        'warning-bg':           '#FEF3C7',

        // Track
        track:                  'var(--color-track)',
      },
      // ── Sharp corners (Stitch design rule) ───────────────────────
      borderRadius: {
        DEFAULT: '0px',
        sm:      '0px',
        md:      '0px',
        lg:      '0px',
        xl:      '0px',
        '2xl':   '0px',
        full:    '0px',
      },
      // ── Typography ───────────────────────────────────────────────
      fontFamily: {
        sans:      ['"Geist"', 'system-ui', 'sans-serif'],
        display:   ['"Space Grotesk"', 'sans-serif'],
        mono:      ['"Geist Mono"', 'monospace'],
      },
      fontSize: {
        'display-lg':  ['48px', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.2',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.3',  fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '1.4',  fontWeight: '600' }],
        'body-lg':     ['18px', { lineHeight: '1.6',  fontWeight: '400' }],
        'body-md':     ['16px', { lineHeight: '1.5',  fontWeight: '400' }],
        'body-sm':     ['14px', { lineHeight: '1.5',  fontWeight: '400' }],
        'label-mono':  ['12px', { lineHeight: '1',    letterSpacing: '0.05em', fontWeight: '500' }],
        'financial':   ['20px', { lineHeight: '1.2',  letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      // ── Spacing ──────────────────────────────────────────────────
      spacing: {
        xs:  '4px',
        sm:  '8px',
        md:  '16px',
        lg:  '24px',
        xl:  '40px',
        '2xl': '32px',
        '3xl': '48px',
        gutter: '24px',
      },
      // ── Shadows ──────────────────────────────────────────────────
      boxShadow: {
        'level-1': '0 1px 2px rgba(0,0,0,0.04)',
        'level-2': '0 2px 4px rgba(0,0,0,0.06)',
        'level-3': '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
