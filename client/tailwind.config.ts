import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        'gh-bg': '#0d1117',
        'gh-surface': '#161b22',
        'gh-surface-2': '#1c2129',
        'gh-border': '#30363d',
        'gh-border-light': '#3d444d',
        'gh-accent': '#238636',
        'gh-accent-hover': '#2ea043',
        'gh-text': '#e6edf3',
        'gh-muted': '#8b949e',
        'severity-critical': '#f85149',
        'severity-high': '#d29922',
        'severity-medium': '#388bfd',
        'severity-low': '#3fb950',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'score-fill': 'scoreFill 2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'glow': 'glow 2.5s ease-in-out infinite alternate',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'float': 'floatSmall 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(35, 134, 54, 0.2), 0 0 20px rgba(35, 134, 54, 0.05)' },
          '100%': { boxShadow: '0 0 20px rgba(35, 134, 54, 0.35), 0 0 40px rgba(35, 134, 54, 0.1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatSmall: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(35, 134, 54, 0.25)',
        'glow-blue': '0 0 20px rgba(56, 139, 253, 0.25)',
        'glow-red': '0 0 20px rgba(248, 81, 73, 0.25)',
        'glow-yellow': '0 0 20px rgba(210, 153, 34, 0.25)',
        'card': '0 4px 24px -6px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 12px 40px -12px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
export default config;
