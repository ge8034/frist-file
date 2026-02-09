import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Retro-Futurism 主题色
        retro: {
          primary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          secondary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          accent: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
          },
          background: '#0f0f23',
          surface: '#1a1a2e',
          text: {
            primary: '#e2e8f0',
            secondary: '#94a3b8',
          },
        },
        // 游戏状态色
        game: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        },
        // 卡牌颜色
        card: {
          red: '#f87171',
          black: '#cbd5e1',
          joker: '#8b5cf6',
        },
        // 保留原有主色作为兼容
        primary: {
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
        },
      },
      fontFamily: {
        'retro-display': ['Russo One', 'sans-serif'],
        'retro-heading': ['Chakra Petch', 'sans-serif'],
        'retro-body': ['Chakra Petch', 'sans-serif'],
        'retro-mono': ['Share Tech Mono', 'monospace'],
        'retro-digital': ['Orbitron', 'sans-serif'],
      },
      fontSize: {
        // 显示文字
        'retro-3xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'retro-2xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.01em' }],
        'retro-xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '0' }],
        // 标题
        'retro-lg': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0' }],
        'retro-md': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        'retro-sm': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        // 正文
        'retro-base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'retro-xs': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],
        // 游戏数据
        'retro-digital-lg': ['2rem', { lineHeight: '1' }],
        'retro-digital-md': ['1.5rem', { lineHeight: '1' }],
        'retro-digital-sm': ['1rem', { lineHeight: '1' }],
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem',
      },
      animation: {
        'deal-card': 'deal-card 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'play-card': 'play-card 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-glow': 'pulse-glow 2s infinite',
        'pulse-slow': 'pulse-slow 3s infinite',
        'scanline': 'scanline 2s linear infinite',
        'glitch': 'glitch 2s infinite',
        'glitch-image': 'glitch-image 5s infinite',
      },
      keyframes: {
        'deal-card': {
          '0%': {
            opacity: '0',
            transform: 'translateY(40px) rotate(-10deg) scale(0.8)',
          },
          '70%': {
            opacity: '1',
            transform: 'translateY(-10px) rotate(2deg) scale(1.05)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) rotate(0) scale(1)',
          },
        },
        'play-card': {
          '0%': {
            transform: 'scale(1) translateY(0)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.2) translateY(-20px)',
            opacity: '0.8',
          },
          '100%': {
            transform: 'scale(1) translateY(0)',
            opacity: '1',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px var(--tw-shadow-color)',
          },
          '50%': {
            boxShadow: '0 0 20px var(--tw-shadow-color), 0 0 40px color-mix(in srgb, var(--tw-shadow-color) 50%, transparent)',
          },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      boxShadow: {
        // 霓虹阴影
        'neon-primary': '0 0 10px rgba(124, 58, 237, 0.5), 0 0 20px rgba(124, 58, 237, 0.3)',
        'neon-primary-hover': '0 0 15px rgba(124, 58, 237, 0.7), 0 0 30px rgba(124, 58, 237, 0.5)',
        'neon-secondary': '0 0 10px rgba(20, 184, 166, 0.5), 0 0 20px rgba(20, 184, 166, 0.3)',
        'neon-secondary-hover': '0 0 15px rgba(20, 184, 166, 0.7), 0 0 30px rgba(20, 184, 166, 0.5)',
        'neon-success': '0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
        'neon-warning': '0 0 10px rgba(245, 158, 11, 0.5), 0 0 20px rgba(245, 158, 11, 0.3)',
        'neon-danger': '0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)',
        'neon-info': '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
        // 卡片阴影
        'neon-low': '0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -2px rgba(124, 58, 237, 0.1)',
        'neon-medium': '0 10px 15px -3px rgba(124, 58, 237, 0.1), 0 4px 6px -4px rgba(124, 58, 237, 0.1)',
        'neon-high': '0 20px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)',
        'neon-highest': '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
        // 卡牌效果
        'neon-red': '0 0 10px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.1)',
        'neon-black': '0 0 10px rgba(203, 213, 225, 0.3), 0 0 20px rgba(203, 213, 225, 0.1)',
        'neon-joker': '0 0 15px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.2)',
        'neon-card-hover': '0 10px 25px -5px rgba(124, 58, 237, 0.3), 0 8px 10px -6px rgba(124, 58, 237, 0.2)',
      },
      screens: {
        'retro-xs': '320px',
        'retro-sm': '480px',
        'retro-md': '768px',
        'retro-lg': '1024px',
        'retro-xl': '1280px',
        'retro-2xl': '1536px',
      },
    },
  },
  plugins: [],
}

export default config
