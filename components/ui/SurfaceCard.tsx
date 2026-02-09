/**
 * Retro-Futurism 风格卡片容器组件
 * 支持CRT边框、霓辉光效果和多种变体
 */

import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 卡片变体定义
const surfaceCardVariants = cva(
  // 基础样式
  cn(
    'rounded-xl',
    'backdrop-blur-sm',
    'transition-all duration-300',
    'p-6',
  ),
  {
    variants: {
      variant: {
        // 默认卡片
        default: cn(
          'bg-retro-surface/80',
          'text-retro-text-primary',
          'border border-retro-primary-500/20',
        ),
        // 玻璃质感卡片
        glass: cn(
          'bg-white/5',
          'backdrop-blur-md',
          'border border-white/10',
          'text-white',
        ),
        // 深色卡片
        dark: cn(
          'bg-retro-background/90',
          'text-retro-text-primary',
          'border border-retro-primary-500/30',
        ),
        // 霓虹边框卡片
        neon: cn(
          'bg-retro-surface/60',
          'text-retro-text-primary',
          'border-2 border-retro-primary-400',
          'shadow-neon-primary',
        ),
        // 游戏玩家卡片
        player: cn(
          'bg-retro-primary-900/20',
          'border-2 border-retro-primary-400',
        ),
        // 游戏AI卡片
        ai: cn(
          'bg-retro-secondary-900/20',
          'border-2 border-retro-secondary-400',
        ),
      },
      elevation: {
        none: '',
        low: 'shadow-neon-low',
        medium: 'shadow-neon-medium',
        high: 'shadow-neon-high',
        highest: 'shadow-neon-highest',
      },
      // CRT边框效果
      crt: {
        true: 'crt-border',
        false: '',
      },
      // 霓辉光效果
      glow: {
        true: 'crt-glow',
        false: '',
      },
      // 扫描线效果
      scanlines: {
        true: 'crt-scanlines',
        false: '',
      },
      // 悬停效果
      hoverable: {
        true: 'hover:shadow-neon-primary hover:-translate-y-1 cursor-pointer',
        false: '',
      },
      // 完整宽度
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      elevation: 'medium',
      crt: true,
      glow: false,
      scanlines: false,
      hoverable: false,
      fullWidth: false,
    },
  }
)

export interface SurfaceCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceCardVariants> {
  asChild?: boolean
}

/**
 * Retro-Futurism 卡片容器组件
 *
 * @example
 * ```tsx
 * // 默认卡片
 * <SurfaceCard>
 *   <h3>卡片标题</h3>
 *   <p>卡片内容</p>
 * </SurfaceCard>
 *
 * // 霓虹效果卡片
 * <SurfaceCard variant="neon" glow crt>
 *   <h3>霓虹卡片</h3>
 *   <p>带CRT边框和辉光效果</p>
 * </SurfaceCard>
 *
 * // 玩家区域卡片
 * <SurfaceCard variant="player" elevation="high" hoverable>
 *   <PlayerInfo player={player} />
 * </SurfaceCard>
 * ```
 */
const SurfaceCard = forwardRef<HTMLDivElement, SurfaceCardProps>(
  ({ className, variant, elevation, crt, glow, scanlines, hoverable, fullWidth, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          surfaceCardVariants({ variant, elevation, crt, glow, scanlines, hoverable, fullWidth, className })
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SurfaceCard.displayName = 'SurfaceCard'

export { SurfaceCard, surfaceCardVariants }