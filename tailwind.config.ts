import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0faf0',
          100: '#dcf5dc',
          200: '#baebbe',
          300: '#8dd994',
          400: '#5cc165',
          500: '#38a344',
          600: '#2a8234',
          700: '#236829',
          800: '#1e5222',
          900: '#1a4420',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'Inter',
          'SF Pro Display', 'SF Pro Text',
          'system-ui', 'Segoe UI', 'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};

export default config;
