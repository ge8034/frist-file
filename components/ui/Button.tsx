/**
 * Retro-Futurism 风格按钮组件
 * 支持霓虹发光效果、CRT边框和故障动画
 */

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 按钮变体定义
const buttonVariants = cva(
  // 基础样式
  cn(
    'inline-flex items-center justify-center',
    'whitespace-nowrap rounded-lg',
    'font-retro-heading font-medium',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-retro-primary-500 focus:ring-offset-2 focus:ring-offset-retro-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-95',
    'cursor-pointer',
  ),
  {
    variants: {
      variant: {
        // 霓虹主按钮
        primary: cn(
          'bg-retro-primary-600 text-white',
          'border-2 border-retro-primary-400',
          'shadow-neon-primary hover:shadow-neon-primary-hover',
          'hover:bg-retro-primary-700',
          'active:bg-retro-primary-800',
        ),
        // 霓虹次按钮
        secondary: cn(
          'bg-retro-secondary-600 text-white',
          'border-2 border-retro-secondary-400',
          'shadow-neon-secondary hover:shadow-neon-secondary-hover',
          'hover:bg-retro-secondary-700',
          'active:bg-retro-secondary-800',
        ),
        // 霓虹轮廓按钮
        outline: cn(
          'bg-transparent text-retro-primary-400',
          'border-2 border-retro-primary-400',
          'shadow-neon-outline hover:shadow-neon-outline',
          'hover:bg-retro-primary-400/10',
          'hover:text-retro-primary-300',
          'hover:border-retro-primary-300',
          'active:bg-retro-primary-400/20',
        ),
        // 霓虹强调按钮
        accent: cn(
          'bg-retro-accent-600 text-white',
          'border-2 border-retro-accent-400',
          'shadow-neon-primary hover:shadow-neon-primary-hover',
          'hover:bg-retro-accent-700',
          'active:bg-retro-accent-800',
        ),
        // 幽灵按钮
        ghost: cn(
          'text-retro-primary-400',
          'hover:bg-retro-primary-400/10',
          'hover:text-retro-primary-300',
          'active:bg-retro-primary-400/20',
        ),
        // 游戏操作按钮
        gamePlay: cn(
          'bg-game-success text-white',
          'border-2 border-green-400',
          'shadow-neon-success hover:shadow-neon-success',
          'hover:bg-green-600',
          'active:bg-green-700',
        ),
        gamePass: cn(
          'bg-game-warning text-white',
          'border-2 border-yellow-400',
          'shadow-neon-warning hover:shadow-neon-warning',
          'hover:bg-yellow-600',
          'active:bg-yellow-700',
        ),
        gameHint: cn(
          'bg-game-info text-white',
          'border-2 border-blue-400',
          'shadow-neon-info hover:shadow-neon-info',
          'hover:bg-blue-600',
          'active:bg-blue-700',
        ),
        gameDanger: cn(
          'bg-game-danger text-white',
          'border-2 border-red-400',
          'shadow-neon-danger hover:shadow-neon-danger',
          'hover:bg-red-600',
          'active:bg-red-700',
        ),
      },
      size: {
        xs: 'h-7 px-2 text-retro-xs',
        sm: 'h-9 px-3 text-retro-xs',
        md: 'h-11 px-4 text-retro-sm',
        lg: 'h-13 px-6 text-retro-base',
        xl: 'h-15 px-8 text-retro-lg',
        '2xl': 'h-17 px-10 text-retro-xl',
      },
      // CRT效果
      crt: {
        true: 'crt-border',
        false: '',
      },
      // 霓辉光效果
      glow: {
        true: 'crt-glow',
        false: '',
      },
      // 故障效果
      glitch: {
        true: 'animate-glitch',
        false: '',
      },
      // 完整宽度
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      crt: true,
      glow: false,
      glitch: false,
      fullWidth: false,
    },
  }
)

// 阴影样式定义（在Tailwind中已定义，这里仅为类型引用）
// neon-outline 和 hover 效果需要在全局CSS中定义或使用自定义样式
// 我们将在全局CSS中添加这些样式

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

/**
 * Retro-Futurism 按钮组件
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" crt glow>
 *   开始游戏
 * </Button>
 *
 * <Button variant="gamePlay" size="md">
 *   出牌
 * </Button>
 *
 * <Button variant="outline" size="sm" glitch>
 *   设置
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, crt, glow, glitch, fullWidth, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, crt, glow, glitch, fullWidth, className }),
          loading && 'relative !text-transparent'
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
