/**
 * Retro-Futurism 风格加载组件
 * 支持霓虹发光、CRT扫描线和故障效果
 */

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 加载组件变体定义
const loadingVariants = cva(
  // 基础样式
  'flex items-center justify-center',
  {
    variants: {
      variant: {
        // 默认加载器
        default: '',
        // 霓虹加载器
        neon: '',
        // 脉冲加载器
        pulse: '',
        // 扫描线加载器
        scanline: '',
        // 故障加载器
        glitch: '',
      },
      size: {
        xs: '',
        sm: '',
        md: '',
        lg: '',
        xl: '',
        '2xl': '',
      },
      // 完整宽度
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      // 完整高度
      fullHeight: {
        true: 'h-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
      fullHeight: false,
    },
  }
)

// 大小映射
const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
}

// 加载器内容映射
const loaderContent = {
  default: (
    <div className="relative">
      <div className="w-12 h-12 border-4 border-retro-primary-500/30 rounded-full"></div>
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-retro-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
  neon: (
    <div className="relative">
      <div className="w-16 h-16 border-4 border-retro-primary-500/50 rounded-full shadow-neon-primary"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-retro-primary-500 border-t-transparent rounded-full animate-spin shadow-neon-primary"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-retro-primary-500 rounded-full animate-ping"></div>
    </div>
  ),
  pulse: (
    <div className="space-x-2 flex">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-3 h-3 bg-retro-primary-500 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  ),
  scanline: (
    <div className="relative w-20 h-20 overflow-hidden rounded-lg crt-border">
      <div className="absolute inset-0 bg-gradient-to-br from-retro-primary-900/30 to-retro-secondary-900/30"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-retro-primary-500 to-transparent animate-scanline"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-retro-digital text-retro-primary-400 animate-pulse">LOADING</span>
      </div>
    </div>
  ),
  glitch: (
    <div className="relative">
      <div className="w-16 h-16 bg-gradient-to-br from-retro-primary-900 to-retro-secondary-900 rounded-lg animate-glitch"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-retro-mono text-white animate-pulse">SYNC</span>
      </div>
    </div>
  ),
}

// 加载文本映射
const loadingText = {
  default: '加载中...',
  neon: '系统初始化',
  pulse: '连接服务器',
  scanline: '数据同步',
  glitch: '系统校准',
}

export interface LoadingProps extends VariantProps<typeof loadingVariants> {
  /** 自定义类名 */
  className?: string
  /** 加载文本 */
  text?: string
  /** 是否显示文本 */
  showText?: boolean
  /** 文本位置 */
  textPosition?: 'bottom' | 'right' | 'top' | 'left'
  /** CRT边框效果 */
  crt?: boolean
  /** 霓辉光效果 */
  glow?: boolean
}

/**
 * Retro-Futurism 加载组件
 *
 * @example
 * ```tsx
 * // 默认加载器
 * <Loading />
 *
 * // 霓虹加载器带文本
 * <Loading variant="neon" text="游戏加载中" showText crt glow />
 *
 * // 扫描线加载器（全屏）
 * <Loading
 *   variant="scanline"
 *   size="xl"
 *   fullWidth
 *   fullHeight
 *   text="正在同步游戏数据..."
 *   textPosition="bottom"
 * />
 * ```
 */
export function Loading({
  className,
  variant = 'default',
  size = 'md',
  fullWidth,
  fullHeight,
  text,
  showText = false,
  textPosition = 'bottom',
  crt = false,
  glow = false,
}: LoadingProps) {
  const displayText = text || loadingText[variant || 'default']

  // 文本位置类名
  const textPositionClasses = {
    bottom: 'flex-col gap-3',
    right: 'flex-row gap-3',
    top: 'flex-col-reverse gap-3',
    left: 'flex-row-reverse gap-3',
  }[textPosition]

  return (
    <div
      className={cn(
        loadingVariants({ variant, size, fullWidth, fullHeight, className }),
        textPositionClasses,
        crt && 'crt-border p-6 rounded-xl',
        glow && 'crt-glow'
      )}
      role="status"
      aria-label="加载中"
    >
      {/* 加载器内容 */}
      <div className="relative">
        {loaderContent[variant || 'default']}
      </div>

      {/* 加载文本 */}
      {showText && (
        <div className={cn(
          'font-retro-body',
          'text-retro-text-secondary',
          sizeClasses[size || 'md'],
          'animate-pulse'
        )}>
          {displayText}
        </div>
      )}
    </div>
  )
}

// 骨架屏组件
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否显示动画 */
  animate?: boolean
  /** 形状 */
  shape?: 'rectangle' | 'circle' | 'text'
  /** 高度 */
  height?: string
  /** 宽度 */
  width?: string
  /** 圆角 */
  rounded?: string
}

/**
 * 骨架屏组件
 * 用于内容加载时的占位显示
 */
export function Skeleton({
  className,
  animate = true,
  shape = 'rectangle',
  height,
  width,
  rounded,
  ...props
}: SkeletonProps) {
  const shapeClasses = {
    rectangle: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded',
  }[shape]

  return (
    <div
      className={cn(
        'bg-retro-surface/50',
        shapeClasses,
        animate && 'animate-pulse',
        className
      )}
      style={{
        height: height || (shape === 'text' ? '1em' : 'auto'),
        width: width || (shape === 'circle' ? '3em' : '100%'),
        borderRadius: rounded,
      }}
      {...props}
    />
  )
}

// 页面加载组件
export interface PageLoadingProps {
  /** 页面标题 */
  title?: string
  /** 页面描述 */
  description?: string
  /** 进度值（0-100） */
  progress?: number
  /** 是否显示进度条 */
  showProgress?: boolean
}

/**
 * 页面加载组件
 * 用于整页加载场景
 */
export function PageLoading({
  title = 'GuanDan2',
  description = '正在加载游戏资源...',
  progress,
  showProgress = false,
}: PageLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-retro-background crt-scanlines">
      {/* CRT边框 */}
      <div className="absolute inset-8 crt-border rounded-2xl crt-glow" />

      {/* 内容 */}
      <div className="relative z-10 text-center space-y-8 p-8 max-w-2xl">
        {/* 标题 */}
        <h1 className="text-5xl font-retro-display text-retro-primary-400 animate-pulse">
          {title}
        </h1>

        {/* 扫描线加载器 */}
        <div className="mx-auto w-48 h-48">
          <Loading variant="scanline" size="xl" showText={false} />
        </div>

        {/* 描述 */}
        <p className="text-xl font-retro-body text-retro-text-secondary">
          {description}
        </p>

        {/* 进度条 */}
        {showProgress && (
          <div className="w-full max-w-md mx-auto space-y-2">
            <div className="h-2 bg-retro-surface/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-retro-primary-500 to-retro-secondary-500 transition-all duration-300"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-retro-mono text-retro-text-secondary">
              <span>系统初始化</span>
              <span>{progress || 0}%</span>
            </div>
          </div>
        )}

        {/* 故障效果文本 */}
        <div className="text-sm font-retro-mono text-retro-text-secondary animate-pulse">
          <div>正在连接游戏服务器...</div>
          <div className="mt-1">正在加载AI模型...</div>
          <div className="mt-1">正在初始化游戏引擎...</div>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="text-xs font-retro-mono text-retro-text-secondary/50">
          GuanDan2 v1.0 • Retro-Futurism Edition • 2026
        </div>
      </div>
    </div>
  )
}
