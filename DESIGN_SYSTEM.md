# GuanDan2 掼蛋游戏 - Retro-Futurism 设计系统

## 概述

本设计系统采用 **Retro-Futurism（复古未来主义）** 风格，专为掼蛋游戏项目打造。结合80年代科幻美学、霓虹发光效果和现代游戏交互，创造沉浸式的游戏体验。

## 设计原则

### 1. 复古未来主义美学
- **80年代科幻视觉**：CRT扫描线、霓虹发光、像素艺术
- **赛博朋克元素**：深色背景、高对比度、几何图案
- **合成波风格**：渐变色彩、网格背景、VHS效果

### 2. 游戏化体验
- **沉浸式界面**：减少UI干扰，聚焦游戏内容
- **动态反馈**：丰富的动画和音效反馈
- **直观操作**：清晰的操作指引和状态提示

### 3. 现代可用性
- **响应式设计**：适配各种设备尺寸
- **无障碍访问**：键盘导航、屏幕阅读器支持
- **性能优化**：流畅的动画和快速响应

## 色彩系统

### 核心色彩调色板
基于 Retro-Futurism 风格的霓虹色调：

```css
/* 主色调 - 霓虹紫色 */
--color-primary-50: #f5f3ff;
--color-primary-100: #ede9fe;
--color-primary-200: #ddd6fe;
--color-primary-300: #c4b5fd;
--color-primary-400: #a78bfa;
--color-primary-500: #8b5cf6;
--color-primary-600: #7c3aed;
--color-primary-700: #6d28d9;
--color-primary-800: #5b21b6;
--color-primary-900: #4c1d95;

/* 次要色 - 霓虹青色 */
--color-secondary-50: #f0fdfa;
--color-secondary-100: #ccfbf1;
--color-secondary-200: #99f6e4;
--color-secondary-300: #5eead4;
--color-secondary-400: #2dd4bf;
--color-secondary-500: #14b8a6;
--color-secondary-600: #0d9488;
--color-secondary-700: #0f766e;
--color-secondary-800: #115e59;
--color-secondary-900: #134e4a;

/* 强调色 - 霓虹粉色 */
--color-accent-50: #fdf2f8;
--color-accent-100: #fce7f3;
--color-accent-200: #fbcfe8;
--color-accent-300: #f9a8d4;
--color-accent-400: #f472b6;
--color-accent-500: #ec4899;
--color-accent-600: #db2777;
--color-accent-700: #be185d;
--color-accent-800: #9d174d;
--color-accent-900: #831843;

/* 游戏状态色 */
--color-game-success: #10b981;    /* 霓虹绿色 - 成功/胜利 */
--color-game-warning: #f59e0b;    /* 霓虹黄色 - 警告/提示 */
--color-game-danger: #ef4444;     /* 霓虹红色 - 危险/错误 */
--color-game-info: #3b82f6;       /* 霓虹蓝色 - 信息 */

/* 背景与文本 */
--color-background: #0f0f23;      /* 深空背景 */
--color-surface: #1a1a2e;         /* 表面颜色 */
--color-text-primary: #e2e8f0;    /* 主要文本 */
--color-text-secondary: #94a3b8;  /* 次要文本 */
```

### Tailwind 配置扩展
```typescript
// tailwind.config.ts 扩展
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
      red: '#f87171',      /* 霓虹红色 - 红桃/方块 */
      black: '#cbd5e1',    /* 霓虹灰色 - 黑桃/梅花 */
      joker: '#8b5cf6',    /* 霓虹紫色 - 王牌 */
    }
  }
}
```

## 排版系统

### 字体选择
Retro-Futurism 风格推荐使用具有科技感和复古感的字体：

```css
/* Google Fonts 导入 */
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Russo+One&family=Orbitron:wght@400;500;700;900&family=Share+Tech+Mono&display=swap');

/* 字体应用 */
--font-display: 'Russo One', sans-serif;      /* 标题和显示文字 */
--font-heading: 'Chakra Petch', sans-serif;   /* 标题 */
--font-body: 'Chakra Petch', sans-serif;      /* 正文 */
--font-mono: 'Share Tech Mono', monospace;    /* 代码和游戏数据 */
--font-digital: 'Orbitron', sans-serif;       /* 数字和计时器 */
```

### 字体大小层级
```typescript
// Tailwind 配置扩展
extend: {
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
    'retro-digital-lg': ['2rem', { lineHeight: '1', fontFamily: 'Orbitron' }],
    'retro-digital-md': ['1.5rem', { lineHeight: '1', fontFamily: 'Orbitron' }],
    'retro-digital-sm': ['1rem', { lineHeight: '1', fontFamily: 'Orbitron' }],
  }
}
```

## 视觉效果

### CRT 扫描线效果
```css
/* CRT 扫描线覆盖层 */
.crt-scanlines::before {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 0, 0, 0.15) 50%
  );
  background-size: 100% 4px;
  z-index: 2;
  pointer-events: none;
  mix-blend-mode: overlay;
}

/* CRT 光晕效果 */
.crt-glow {
  box-shadow:
    0 0 60px rgba(124, 58, 237, 0.3),
    0 0 100px rgba(124, 58, 237, 0.1),
    inset 0 0 20px rgba(124, 58, 237, 0.1);
}

/* CRT 边框 */
.crt-border {
  border: 2px solid rgba(124, 58, 237, 0.3);
  box-shadow:
    inset 0 0 20px rgba(124, 58, 237, 0.2),
    0 0 30px rgba(124, 58, 237, 0.1);
}
```

### 霓虹发光效果
```css
/* 霓虹文本发光 */
.neon-text {
  color: #fff;
  text-shadow:
    0 0 5px #fff,
    0 0 10px #fff,
    0 0 20px #7c3aed,
    0 0 40px #7c3aed,
    0 0 80px #7c3aed;
}

/* 霓虹边框发光 */
.neon-border {
  border: 2px solid #7c3aed;
  box-shadow:
    0 0 5px #7c3aed,
    0 0 10px #7c3aed,
    inset 0 0 5px #7c3aed,
    inset 0 0 10px #7c3aed;
}

/* 霓虹按钮发光 */
.neon-button {
  background: rgba(124, 58, 237, 0.1);
  border: 2px solid #7c3aed;
  color: #7c3aed;
  text-shadow: 0 0 5px rgba(124, 58, 237, 0.5);
  box-shadow:
    0 0 10px rgba(124, 58, 237, 0.5),
    inset 0 0 10px rgba(124, 58, 237, 0.1);
}

.neon-button:hover {
  background: rgba(124, 58, 237, 0.2);
  box-shadow:
    0 0 20px rgba(124, 58, 237, 0.7),
    inset 0 0 15px rgba(124, 58, 237, 0.2);
}
```

### 故障效果 (Glitch Effect)
```css
/* 文本故障效果 */
@keyframes glitch {
  0% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
                0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  14% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
                0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  15% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
                0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
                -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  49% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
                0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
                -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  50% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
                0.05em 0 0 rgba(0, 255, 0, 0.75),
                0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  99% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
                0.05em 0 0 rgba(0, 255, 0, 0.75),
                0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  100% {
    text-shadow: -0.025em 0 0 rgba(255, 0, 0, 0.75),
                -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
                -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
}

.glitch-text {
  animation: glitch 2s infinite;
}

/* 图像故障效果 */
@keyframes glitch-image {
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: translate(-2px, 2px);
  }
  5% {
    clip-path: inset(92% 0 1% 0);
    transform: translate(1px, -2px);
  }
  10% {
    clip-path: inset(43% 0 1% 0);
    transform: translate(-1px, 3px);
  }
  15% {
    clip-path: inset(25% 0 58% 0);
    transform: translate(2px, -1px);
  }
  20% {
    clip-path: inset(54% 0 7% 0);
    transform: translate(-2px, 2px);
  }
  45% {
    clip-path: inset(58% 0 43% 0);
    transform: translate(1px, -2px);
  }
  50% {
    clip-path: inset(98% 0 1% 0);
    transform: translate(-1px, 3px);
  }
  55% {
    clip-path: inset(48% 0 13% 0);
    transform: translate(2px, -1px);
  }
  60% {
    clip-path: inset(3% 0 46% 0);
    transform: translate(-2px, 2px);
  }
  65% {
    clip-path: inset(88% 0 2% 0);
    transform: translate(1px, -2px);
  }
  70% {
    clip-path: inset(34% 0 32% 0);
    transform: translate(-1px, 3px);
  }
  75% {
    clip-path: inset(76% 0 4% 0);
    transform: translate(2px, -1px);
  }
  80% {
    clip-path: inset(12% 0 33% 0);
    transform: translate(-2px, 2px);
  }
  85% {
    clip-path: inset(64% 0 8% 0);
    transform: translate(1px, -2px);
  }
  90% {
    clip-path: inset(9% 0 27% 0);
    transform: translate(-1px, 3px);
  }
  95% {
    clip-path: inset(87% 0 2% 0);
    transform: translate(2px, -1px);
  }
  100% {
    clip-path: inset(23% 0 58% 0);
    transform: translate(-2px, 2px);
  }
}

.glitch-image {
  animation: glitch-image 5s infinite;
}
```

## 组件设计规范

### 1. 按钮组件 (Button)
```typescript
// Retro-Futurism 按钮变体
const buttonVariants = {
  // 霓虹主按钮
  primary: `
    bg-retro-primary-600
    text-white
    font-retro-heading
    border-2 border-retro-primary-400
    shadow-neon-primary
    hover:bg-retro-primary-700
    hover:shadow-neon-primary-hover
    active:bg-retro-primary-800
    transition-all duration-200
  `,

  // 霓虹次按钮
  secondary: `
    bg-retro-secondary-600
    text-white
    font-retro-heading
    border-2 border-retro-secondary-400
    shadow-neon-secondary
    hover:bg-retro-secondary-700
    hover:shadow-neon-secondary-hover
    active:bg-retro-secondary-800
    transition-all duration-200
  `,

  // 霓虹轮廓按钮
  outline: `
    bg-transparent
    text-retro-primary-400
    font-retro-heading
    border-2 border-retro-primary-400
    shadow-neon-outline
    hover:bg-retro-primary-400/10
    hover:text-retro-primary-300
    hover:border-retro-primary-300
    hover:shadow-neon-outline-hover
    active:bg-retro-primary-400/20
    transition-all duration-200
  `,

  // 游戏操作按钮
  game: {
    play: `
      bg-game-success
      text-white
      font-retro-heading
      border-2 border-green-400
      shadow-neon-success
      hover:bg-green-600
      hover:shadow-neon-success-hover
      active:bg-green-700
      transition-all duration-200
    `,
    pass: `
      bg-game-warning
      text-white
      font-retro-heading
      border-2 border-yellow-400
      shadow-neon-warning
      hover:bg-yellow-600
      hover:shadow-neon-warning-hover
      active:bg-yellow-700
      transition-all duration-200
    `,
    hint: `
      bg-game-info
      text-white
      font-retro-heading
      border-2 border-blue-400
      shadow-neon-info
      hover:bg-blue-600
      hover:shadow-neon-info-hover
      active:bg-blue-700
      transition-all duration-200
    `,
  }
}

// 按钮尺寸
const buttonSizes = {
  sm: 'px-3 py-1.5 text-retro-xs',
  md: 'px-4 py-2 text-retro-base',
  lg: 'px-6 py-3 text-retro-lg',
  xl: 'px-8 py-4 text-retro-xl',
}

// 霓虹阴影工具类
const neonShadows = {
  'neon-primary': '0 0 10px theme(colors.retro.primary.500), 0 0 20px theme(colors.retro.primary.500/0.5)',
  'neon-primary-hover': '0 0 15px theme(colors.retro.primary.400), 0 0 30px theme(colors.retro.primary.400/0.7)',
  'neon-secondary': '0 0 10px theme(colors.retro.secondary.500), 0 0 20px theme(colors.retro.secondary.500/0.5)',
  'neon-secondary-hover': '0 0 15px theme(colors.retro.secondary.400), 0 0 30px theme(colors.retro.secondary.400/0.7)',
  'neon-outline': '0 0 10px theme(colors.retro.primary.500/0.3), inset 0 0 10px theme(colors.retro.primary.500/0.1)',
  'neon-outline-hover': '0 0 15px theme(colors.retro.primary.500/0.5), inset 0 0 15px theme(colors.retro.primary.500/0.2)',
}
```

### 2. 卡片组件 (Card)
```typescript
// Retro-Futurism 卡片设计
const cardStyles = {
  base: `
    rounded-lg
    backdrop-blur-sm
    transition-all duration-300
    crt-border
  `,

  elevation: {
    low: 'shadow-neon-low',
    medium: 'shadow-neon-medium',
    high: 'shadow-neon-high',
    highest: 'shadow-neon-highest crt-glow',
  },

  variant: {
    default: 'bg-retro-surface/80 text-retro-text-primary',
    glass: 'bg-white/5 backdrop-blur-md border-white/10',
    dark: 'bg-retro-background/90 text-retro-text-primary',
  },

  // 游戏卡片变体
  game: {
    player: 'border-2 border-retro-primary-400 bg-retro-primary-900/20',
    ai: 'border-2 border-retro-secondary-400 bg-retro-secondary-900/20',
    current: 'ring-2 ring-retro-primary-500 shadow-neon-primary',
    winner: 'ring-2 ring-game-success shadow-neon-success',
  }
}

// 霓虹卡片阴影
const cardNeonShadows = {
  'neon-low': '0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -2px rgba(124, 58, 237, 0.1)',
  'neon-medium': '0 10px 15px -3px rgba(124, 58, 237, 0.1), 0 4px 6px -4px rgba(124, 58, 237, 0.1)',
  'neon-high': '0 20px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)',
  'neon-highest': '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
}
```

### 3. 游戏卡牌组件
```typescript
// 卡牌设计 - Retro-Futurism 风格
const cardDesign = {
  base: `
    w-16 h-24
    rounded-lg
    shadow-lg
    cursor-pointer
    transition-all duration-150
    backdrop-blur-sm
    crt-border
  `,

  size: {
    small: 'w-12 h-18 text-xs',
    medium: 'w-16 h-24 text-sm',
    large: 'w-20 h-30 text-base',
  },

  color: {
    red: `
      bg-gradient-to-br from-red-900/30 to-red-950/50
      border-red-500/30
      text-card-red
      shadow-neon-red
    `,
    black: `
      bg-gradient-to-br from-gray-900/30 to-gray-950/50
      border-gray-400/30
      text-card-black
      shadow-neon-black
    `,
    joker: `
      bg-gradient-to-br from-purple-900/30 to-purple-950/50
      border-purple-500/30
      text-card-joker
      shadow-neon-joker
      animate-pulse
    `,
  },

  state: {
    normal: 'hover:-translate-y-2 hover:shadow-neon-card-hover',
    selected: `
      ring-2 ring-retro-primary-500
      -translate-y-4
      shadow-neon-primary
      z-10
    `,
    disabled: 'opacity-50 cursor-not-allowed grayscale',
    playable: 'animate-pulse-slow cursor-pointer',
  },

  // 卡牌符号样式
  suit: {
    heart: 'text-card-red',
    diamond: 'text-card-red',
    spade: 'text-card-black',
    club: 'text-card-black',
  }
}

// 卡牌霓虹阴影
const cardNeonEffects = {
  'neon-red': '0 0 10px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.1)',
  'neon-black': '0 0 10px rgba(203, 213, 225, 0.3), 0 0 20px rgba(203, 213, 225, 0.1)',
  'neon-joker': '0 0 15px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.2)',
  'neon-card-hover': '0 10px 25px -5px rgba(124, 58, 237, 0.3), 0 8px 10px -6px rgba(124, 58, 237, 0.2)',
}
```

### 4. 玩家区域组件
```typescript
// 玩家区域设计
const playerAreaStyles = {
  base: `
    rounded-xl
    p-4
    transition-all duration-300
    backdrop-blur-sm
    crt-border
  `,

  position: {
    bottom: `
      border-t-4 border-retro-primary-500
      bg-gradient-to-t from-retro-primary-900/20 to-transparent
    `,
    left: `
      border-r-4 border-retro-primary-500
      bg-gradient-to-r from-retro-primary-900/20 to-transparent
    `,
    right: `
      border-l-4 border-retro-primary-500
      bg-gradient-to-l from-retro-primary-900/20 to-transparent
    `,
    top: `
      border-b-4 border-retro-primary-500
      bg-gradient-to-b from-retro-primary-900/20 to-transparent
    `,
  },

  status: {
    active: `
      ring-2 ring-retro-primary-500
      bg-retro-primary-900/30
      shadow-neon-primary
      animate-pulse-slow
    `,
    inactive: 'bg-retro-surface/50',
    winner: `
      ring-2 ring-game-success
      bg-green-900/30
      shadow-neon-success
    `,
    thinking: `
      bg-retro-secondary-900/30
      animate-pulse
    `,
  },

  // 玩家类型
  type: {
    human: 'border-retro-primary-400',
    ai: 'border-retro-secondary-400',
  }
}
```

### 5. 游戏棋盘组件
```typescript
// 游戏棋盘设计
const gameBoardStyles = {
  base: `
    relative
    rounded-2xl
    p-6
    backdrop-blur-md
    bg-gradient-to-br from-retro-background via-retro-surface to-retro-background
    crt-border
    crt-glow
    min-h-[500px]
  `,

  // 网格背景
  grid: `
    absolute inset-0
    bg-[linear-gradient(rgba(124,58,237,0.1)_1px,transparent_1px),
         linear-gradient(90deg,rgba(124,58,237,0.1)_1px,transparent_1px)]
    bg-[size:20px_20px]
    rounded-2xl
    opacity-30
  `,

  // 中心区域
  center: `
    absolute top-1/2 left-1/2
    transform -translate-x-1/2 -translate-y-1/2
    w-48 h-48
    rounded-full
    bg-gradient-to-br from-retro-primary-900/20 to-retro-secondary-900/20
    border-2 border-retro-primary-500/30
    shadow-neon-primary
    flex items-center justify-center
  `,

  // 出牌区域
  playArea: `
    mt-8
    p-4
    rounded-xl
    bg-retro-surface/50
    border border-retro-primary-500/20
    min-h-[120px]
  `,
}
```

## 动画系统

### 基础动画
```css
/* 缓动函数 */
:root {
  --ease-retro: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-glitch: cubic-bezier(0.5, 0, 0.75, 0);
}

/* 基础过渡类 */
.transition-retro {
  transition: all 200ms var(--ease-retro);
}

.transition-bounce {
  transition: all 300ms var(--ease-bounce);
}

/* 悬停效果 */
.hover-lift {
  transition: transform 150ms var(--ease-retro);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

.hover-glow {
  transition: box-shadow 200ms var(--ease-retro);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
}

/* 点击效果 */
.active-press:active {
  transform: scale(0.95);
}
```

### 游戏特定动画
```css
/* 卡牌发牌动画 */
@keyframes deal-card {
  0% {
    opacity: 0;
    transform: translateY(40px) rotate(-10deg) scale(0.8);
  }
  70% {
    opacity: 1;
    transform: translateY(-10px) rotate(2deg) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0) scale(1);
  }
}

.animate-deal {
  animation: deal-card 500ms var(--ease-bounce) forwards;
}

/* 卡牌打出动画 */
@keyframes play-card {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) translateY(-20px);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.animate-play {
  animation: play-card 400ms var(--ease-bounce);
}

/* 脉冲发光动画 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px theme('colors.retro.primary.500');
  }
  50% {
    box-shadow: 0 0 20px theme('colors.retro.primary.500'),
                0 0 40px theme('colors.retro.primary.500/0.5);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}

/* 慢速脉冲 */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite;
}

/* 扫描线动画 */
@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.animate-scanline {
  position: relative;
  overflow: hidden;
}

.animate-scanline::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    theme('colors.retro.primary.500'),
    transparent
  );
  animation: scanline 2s linear infinite;
}
```

### Tailwind 动画配置
```typescript
// tailwind.config.ts 扩展
extend: {
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
        transform: 'translateY(40px) rotate(-10deg) scale(0.8)'
      },
      '70%': {
        opacity: '1',
        transform: 'translateY(-10px) rotate(2deg) scale(1.05)'
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0) rotate(0) scale(1)'
      },
    },
    'play-card': {
      '0%': {
        transform: 'scale(1) translateY(0)',
        opacity: '1'
      },
      '50%': {
        transform: 'scale(1.2) translateY(-20px)',
        opacity: '0.8'
      },
      '100%': {
        transform: 'scale(1) translateY(0)',
        opacity: '1'
      },
    },
    'pulse-glow': {
      '0%, 100%': {
        boxShadow: '0 0 5px theme(colors.retro.primary.500)'
      },
      '50%': {
        boxShadow: '0 0 20px theme(colors.retro.primary.500), 0 0 40px theme(colors.retro.primary.500/0.5)'
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
}
```

## 响应式设计

### 断点系统
```typescript
// Tailwind 配置 - Retro-Futurism 优化断点
screens: {
  'retro-xs': '320px',   // 小手机
  'retro-sm': '480px',   // 手机横屏
  'retro-md': '768px',   // 平板竖屏
  'retro-lg': '1024px',  // 平板横屏
  'retro-xl': '1280px',  // 桌面
  'retro-2xl': '1536px', // 大桌面
}
```

### 游戏布局响应式
```typescript
// 游戏棋盘布局 - Retro-Futurism 风格
const gameLayout = {
  mobile: {
    players: 'grid grid-cols-2 gap-3 p-2',
    board: 'mt-6 p-4',
    controls: `
      fixed bottom-0 left-0 right-0
      bg-retro-surface/95 backdrop-blur-lg
      border-t border-retro-primary-500/30
      p-4
      crt-border-t
    `,
    cardSize: 'w-12 h-18',
  },
  tablet: {
    players: 'grid grid-cols-4 gap-4 p-4',
    board: 'mt-8 p-6',
    controls: `
      absolute bottom-8 left-1/2
      transform -translate-x-1/2
      bg-retro-surface/90 backdrop-blur-md
      rounded-2xl p-4
      crt-border crt-glow
    `,
    cardSize: 'w-16 h-24',
  },
  desktop: {
    players: 'flex justify-around p-6',
    board: 'mt-12 p-8',
    controls: `
      absolute bottom-12 left-1/2
      transform -translate-x-1/2
      bg-retro-surface/80 backdrop-blur-sm
      rounded-2xl p-6
      crt-border crt-glow
    `,
    cardSize: 'w-20 h-30',
  }
}

// 响应式工具类
const responsiveUtils = {
  // CRT 效果响应式
  crt: {
    mobile: 'crt-scanlines',
    tablet: 'crt-scanlines crt-border',
    desktop: 'crt-scanlines crt-border crt-glow',
  },

  // 霓虹效果响应式
  neon: {
    mobile: 'shadow-neon-low',
    tablet: 'shadow-neon-medium',
    desktop: 'shadow-neon-high',
  },

  // 字体大小响应式
  typography: {
    mobile: {
      display: 'text-retro-lg',
      heading: 'text-retro-md',
      body: 'text-retro-xs',
    },
    tablet: {
      display: 'text-retro-xl',
      heading: 'text-retro-lg',
      body: 'text-retro-sm',
    },
    desktop: {
      display: 'text-retro-2xl',
      heading: 'text-retro-xl',
      body: 'text-retro-base',
    },
  }
}
```

## 无障碍设计

### 键盘导航
```typescript
// 焦点样式 - Retro-Futurism 风格
const focusStyles = {
  base: `
    focus:outline-none
    focus:ring-2
    focus:ring-retro-primary-500
    focus:ring-offset-2
    focus:ring-offset-retro-background
    focus:shadow-neon-primary
  `,

  button: `
    focus:outline-none
    focus:ring-2
    focus:ring-retro-primary-500
    focus:ring-offset-2
    focus:ring-offset-retro-background
    focus:shadow-neon-primary
    focus:translate-y-[-2px]
  `,

  input: `
    focus:outline-none
    focus:ring-2
    focus:ring-retro-primary-500
    focus:border-transparent
    focus:shadow-neon-primary
  `,

  card: `
    focus:outline-none
    focus:ring-2
    focus:ring-retro-primary-500
    focus:shadow-neon-primary
    focus:translate-y-[-4px]
  `,
}

// 跳过链接
const skipLink = `
  sr-only
  focus:not-sr-only
  focus:absolute
  focus:top-4
  focus:left-4
  focus:z-50
  focus:px-4
  focus:py-2
  focus:bg-retro-surface
  focus:text-retro-text-primary
  focus:rounded-lg
  focus:crt-border
`
```

### ARIA 标签
```typescript
// 游戏状态 ARIA - 中文
const ariaLabels = {
  // 玩家状态
  playerTurn: (playerName: string) => `${playerName}的回合`,
  playerThinking: (playerName: string) => `${playerName}正在思考`,
  playerWinner: (playerName: string) => `${playerName}获胜`,

  // 卡牌操作
  cardPlayed: (cardName: string, playerName: string) => `${playerName}出了${cardName}`,
  cardSelected: (cardName: string) => `已选择${cardName}`,
  cardPlayable: (cardName: string) => `${cardName}可以打出`,

  // 游戏状态
  gamePhase: (phase: string) => `当前游戏阶段：${phase}`,
  gameScore: (score: number) => `当前得分：${score}`,
  gameTime: (time: string) => `游戏时间：${time}`,

  // UI 元素
  button: {
    play: '出牌',
    pass: '跳过',
    hint: '提示',
    undo: '撤销',
    settings: '设置',
    exit: '退出游戏',
  },

  // 游戏区域
  area: {
    hand: '手牌区域',
    play: '出牌区域',
    discard: '弃牌堆',
    deck: '牌堆',
  }
}
```

### 减少动画支持
```css
/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .crt-scanlines::before {
    display: none;
  }

  .animate-pulse,
  .animate-pulse-glow,
  .animate-pulse-slow {
    animation: none;
  }
}
```

## 图标系统

### 图标库选择
使用 **Heroicons v2.0** + **Lucide React** 组合：

```bash
# 安装图标库
npm install @heroicons/react lucide-react
```

### Retro-Futurism 风格图标
```typescript
import {
  // Heroicons - 实心图标用于重要操作
  PlayCircleIcon,
  PauseCircleIcon,
  TrophyIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  UsersIcon,
  CpuChipIcon,
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,

  // Heroicons - 轮廓图标用于常规UI
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  HomeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'

import {
  // Lucide - 游戏特定图标
  Cards,
  Crown,
  Sword,
  Shield,
  Zap,
  Target,
  Brain,
  Sparkles,
  Gamepad2,
  Volume2,
  VolumeX,
  Settings,
  User,
  Users as Users2,
  Bot,
  Star,
  Clock,
  Award,
} from 'lucide-react'
```

### 图标使用规范
```typescript
// 图标大小规范
const iconSizes = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
  '2xl': 'w-12 h-12',
}

// 图标颜色规范
const iconColors = {
  primary: 'text-retro-primary-400',
  secondary: 'text-retro-secondary-400',
  accent: 'text-retro-accent-400',
  success: 'text-game-success',
  warning: 'text-game-warning',
  danger: 'text-game-danger',
  info: 'text-game-info',
  muted: 'text-retro-text-secondary',
}

// 图标动画
const iconAnimations = {
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  ping: 'animate-ping',
}
```

## 实施指南

### 1. 安装依赖
```bash
# 核心依赖
npm install @heroicons/react lucide-react

# 动画库（推荐）
npm install framer-motion

# 工具类
npm install clsx tailwind-merge

# 字体
npm install @fontsource/chakra-petch @fontsource/russo-one @fontsource/orbitron @fontsource/share-tech-mono
```

### 2. 更新全局样式
```css
/* globals.css - Retro-Futurism 主题 */
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Russo+One&family=Orbitron:wght@400;500;700;900&family=Share+Tech+Mono&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Retro-Futurism 颜色变量 */
  --color-background: #0f0f23;
  --color-surface: #1a1a2e;
  --color-text-primary: #e2e8f0;
  --color-text-secondary: #94a3b8;

  /* 霓虹色 */
  --color-neon-primary: #7c3aed;
  --color-neon-secondary: #14b8a6;
  --color-neon-accent: #ec4899;

  /* CRT 效果 */
  --crt-scanline-color: rgba(0, 0, 0, 0.15);
  --crt-glow-color: rgba(124, 58, 237, 0.3);
}

body {
  color: var(--color-text-primary);
  background: var(--color-background);
  font-family: 'Chakra Petch', sans-serif;
  overflow-x: hidden;
}

/* CRT 扫描线全局效果 */
.crt-effect::before {
  content: " ";
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    var(--crt-scanline-color) 50%
  );
  background-size: 100% 4px;
  z-index: 9999;
  pointer-events: none;
  mix-blend-mode: overlay;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 10px;
  background: var(--color-surface);
}

::-webkit-scrollbar-track {
  background: var(--color-surface);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background: var(--color-neon-primary);
  border-radius: 5px;
  border: 2px solid var(--color-surface);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-neon-secondary);
}
```

### 3. 更新 Tailwind 配置
将本设计系统中的所有扩展配置添加到 `tailwind.config.ts` 文件中。

### 4. 创建基础组件
按照设计规范创建以下基础组件：
- `Button` - 各种霓虹按钮变体
- `Card` - CRT边框卡片
- `Modal` - 故障效果模态框
- `Input` - 霓虹边框输入框
- `Toast` - 发光提示组件

### 5. 实现游戏组件
基于基础组件构建游戏特定组件：
- `GameCard` - 卡牌组件
- `PlayerArea` - 玩家区域
- `GameBoard` - 游戏棋盘
- `ScoreBoard` - 计分板
- `ChatPanel` - 聊天面板

### 6. 测试和优化
- 在不同设备上测试响应式布局
- 使用屏幕阅读器测试无障碍功能
- 测试动画性能
- 收集用户反馈并迭代优化

## 性能优化指南

### 1. 动画性能
```css
/* 使用 transform 和 opacity 进行动画（GPU加速） */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* 避免布局抖动 */
.stable-layout {
  will-change: transform, opacity;
}

/* 限制动画数量 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

### 2. 图像优化
```typescript
// 使用 WebP 格式
const imageConfig = {
  card: {
    format: 'webp',
    quality: 80,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  background: {
    format: 'webp',
    quality: 60,
    lazy: true,
  }
}
```

### 3. 字体优化
```css
/* 字体显示设置 */
.font-display-swap {
  font-display: swap;
}

/* 子集字体 */
@font-face {
  font-family: 'Chakra Petch Subset';
  src: url('/fonts/chakra-petch-subset.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0000-00FF; /* 仅拉丁字符 */
}
```

## 维护指南

### 1. 设计一致性检查
- 每月检查组件是否符合设计规范
- 确保颜色、间距、字体使用一致
- 验证无障碍功能正常工作

### 2. 性能监控
- 监控页面加载时间
- 检查动画帧率（目标60fps）
- 优化资源加载策略

### 3. 用户反馈收集
- 定期收集用户UI/UX反馈
- A/B测试新设计变体
- 分析用户行为数据

### 4. 设计系统更新
- 每季度回顾和更新设计系统
- 添加新的组件变体
- 优化现有组件

---

## 版本历史

### v1.0.0 (2026-02-07)
- 初始 Retro-Futurism 设计系统创建
- 完整的色彩、排版、组件规范
- 游戏特定组件设计
- CRT效果、霓虹发光、故障效果实现
- 响应式设计和无障碍支持

---

**设计系统负责人**：UI/UX 团队
**最后更新**：2026-02-07
**状态**：活跃维护
**风格**：Retro-Futurism（复古未来主义）