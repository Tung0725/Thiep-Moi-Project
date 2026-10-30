import type { Config } from 'tailwindcss';

function withOpacity(variableName: string): any {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mh-primary': '#ff2056',
        'mh-primary-hover': '#e61c4e',
        'mh-dark': '#2d2d2d',
        'mh-body': '#555555',
        'mh-muted': '#999999',
        'mh-line': '#eeeeee',
        'mh-border': '#f0e0e4',
        'mh-pink-soft': '#ffe8ec',
        'mh-pink-bg': '#fff0f3',

        surface: withOpacity('--surface-rgb'),
        'surface-dim': withOpacity('--surface-dim-rgb'),
        'surface-bright': withOpacity('--surface-bright-rgb'),
        'surface-container-lowest': withOpacity('--surface-container-lowest-rgb'),
        'surface-container-low': withOpacity('--surface-container-low-rgb'),
        'surface-container': withOpacity('--surface-container-rgb'),
        'surface-container-high': withOpacity('--surface-container-high-rgb'),
        'surface-container-highest': withOpacity('--surface-container-highest-rgb'),
        'surface-variant': withOpacity('--surface-variant-rgb'),
        'surface-tint': withOpacity('--surface-tint-rgb'),

        primary: withOpacity('--primary-rgb'),
        'primary-container': withOpacity('--primary-container-rgb'),
        'primary-fixed': withOpacity('--primary-fixed-rgb'),
        'primary-fixed-dim': withOpacity('--primary-fixed-dim-rgb'),
        'on-primary': withOpacity('--on-primary-rgb'),
        'on-primary-container': withOpacity('--on-primary-container-rgb'),
        'on-primary-fixed': withOpacity('--on-primary-fixed-rgb'),
        'on-primary-fixed-variant': withOpacity('--on-primary-fixed-variant-rgb'),
        'inverse-primary': withOpacity('--inverse-primary-rgb'),

        secondary: withOpacity('--secondary-rgb'),
        'secondary-container': withOpacity('--secondary-container-rgb'),
        'secondary-fixed': withOpacity('--secondary-fixed-rgb'),
        'secondary-fixed-dim': withOpacity('--secondary-fixed-dim-rgb'),
        'on-secondary': withOpacity('--on-secondary-rgb'),
        'on-secondary-container': withOpacity('--on-secondary-container-rgb'),
        'on-secondary-fixed': withOpacity('--on-secondary-fixed-rgb'),
        'on-secondary-fixed-variant': withOpacity('--on-secondary-fixed-variant-rgb'),

        tertiary: withOpacity('--tertiary-rgb'),
        'tertiary-container': withOpacity('--tertiary-container-rgb'),
        'tertiary-fixed': withOpacity('--tertiary-fixed-rgb'),
        'tertiary-fixed-dim': withOpacity('--tertiary-fixed-dim-rgb'),
        'on-tertiary': withOpacity('--on-tertiary-rgb'),
        'on-tertiary-container': withOpacity('--on-tertiary-container-rgb'),
        'on-tertiary-fixed': withOpacity('--on-tertiary-fixed-rgb'),
        'on-tertiary-fixed-variant': withOpacity('--on-tertiary-fixed-variant-rgb'),

        background: withOpacity('--background-rgb'),
        'on-background': withOpacity('--on-background-rgb'),
        'on-surface': withOpacity('--on-surface-rgb'),
        'on-surface-variant': withOpacity('--on-surface-variant-rgb'),
        'inverse-surface': withOpacity('--inverse-surface-rgb'),
        'inverse-on-surface': withOpacity('--inverse-on-surface-rgb'),

        outline: withOpacity('--outline-rgb'),
        'outline-variant': withOpacity('--outline-variant-rgb'),

        error: withOpacity('--error-rgb'),
        'error-container': withOpacity('--error-container-rgb'),
        'on-error': withOpacity('--on-error-rgb'),
        'on-error-container': withOpacity('--on-error-container-rgb'),
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2.5rem',
        'space-2xl': '4rem',
        'space-3xl': '6rem',
        'margin-mobile': '1.25rem',
        'margin-tablet': '2rem',
        margin: '3rem',
        'gutter-mobile': '1rem',
        gutter: '1.5rem',
      },
      fontFamily: {
        display: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        'headline-xl': ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        'headline-lg': ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        'headline-md': ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        'headline-sm': ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        'display-mobile': ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        'headline-xl-mobile': ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        'body-lg': ['var(--font-inter)', 'Inter', 'sans-serif'],
        'body-md': ['var(--font-inter)', 'Inter', 'sans-serif'],
        'body-sm': ['var(--font-inter)', 'Inter', 'sans-serif'],
        'label-lg': ['var(--font-inter)', 'Inter', 'sans-serif'],
        'label-md': ['var(--font-inter)', 'Inter', 'sans-serif'],
        'label-sm': ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'label-sm': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.04em', fontWeight: '700' }],
        'headline-lg': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.01em', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
        'display-mobile': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
        'body-md': ['1rem', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.005em', fontWeight: '400' }],
        'headline-xl-mobile': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['1.5rem', { lineHeight: '1.35', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-sm': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        display: ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '800' }],
        'label-md': ['0.75rem', { lineHeight: '1.35', letterSpacing: '0.02em', fontWeight: '600' }],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
