/**
 * Retro-Futurism 风格消息提示组件
 * 支持霓虹发光、CRT边框和故障效果
 */

import { ReactNode, useEffect, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

// Toast变体定义
const toastVariants = cva(
  // 基础样式
  cn(
    'relative',
    'max-w-md',
    'rounded-xl',
    'p-4',
    'shadow-2xl',
    'backdrop-blur-md',
    'transition-all duration-300',
    'animate-in slide-in-from-right-full',
    'flex items-start gap-3',
  ),
  {
    variants: {
      variant: {
        // 默认Toast
        default: cn(
          'bg-retro-surface/90',
          'text-retro-text-primary',
          'border border-retro-primary-500/30',
        ),
        // 成功Toast
        success: cn(
          'bg-green-900/80',
          'text-white',
          'border-2 border-game-success',
          'shadow-neon-success',
        ),
        // 错误Toast
        error: cn(
          'bg-red-900/80',
          'text-white',
          'border-2 border-game-danger',
          'shadow-neon-danger',
        ),
        // 警告Toast
        warning: cn(
          'bg-yellow-900/80',
          'text-white',
          'border-2 border-game-warning',
          'shadow-neon-warning',
        ),
        // 信息Toast
        info: cn(
          'bg-blue-900/80',
          'text-white',
          'border-2 border-game-info',
          'shadow-neon-info',
        ),
        // 霓虹Toast
        neon: cn(
          'bg-retro-surface/80',
          'text-retro-text-primary',
          'border-2 border-retro-primary-400',
          'shadow-neon-primary',
        ),
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
      // 故障效果
      glitch: {
        true: 'animate-glitch',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      crt: true,
      glow: false,
      glitch: false,
    },
  }
)

// Toast图标映射
const toastIcons = {
  default: InformationCircleIcon,
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  neon: InformationCircleIcon,
}

// Toast属性接口
export interface ToastProps extends VariantProps<typeof toastVariants> {
  /** Toast标题 */
  title?: string
  /** Toast内容 */
  message: string
  /** 自动关闭时间（毫秒），0表示不自动关闭 */
  duration?: number
  /** 关闭回调函数 */
  onClose?: () => void
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 自定义图标 */
  icon?: ReactNode
  /** 自定义操作按钮 */
  action?: ReactNode
}

/**
 * Retro-Futurism Toast组件
 *
 * @example
 * ```tsx
 * // 简单使用
 * <Toast message="操作成功" variant="success" />
 *
 * // 完整配置
 * <Toast
 *   title="系统提示"
 *   message="游戏即将开始，请做好准备"
 *   variant="neon"
 *   crt
 *   glow
 *   duration={5000}
 *   closable
 * />
 * ```
 */
export function Toast({
  title,
  message,
  variant = 'default',
  duration = 5000,
  onClose,
  closable = true,
  icon,
  action,
  crt,
  glow,
  glitch,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  // 自动关闭定时器
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300) // 等待动画结束
  }

  // 如果不显示，返回null
  if (!isVisible) return null

  const IconComponent = toastIcons[variant || 'default']
  const defaultIcon = <IconComponent className="w-6 h-6 flex-shrink-0" />

  return (
    <div
      className={cn(
        toastVariants({ variant, crt, glow, glitch }),
        'animate-in slide-in-from-right-full fade-in-0 duration-300'
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* 图标 */}
      <div className="flex-shrink-0">
        {icon || defaultIcon}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        {/* 标题 */}
        {title && (
          <h3 className="text-lg font-retro-heading font-bold mb-1">
            {title}
          </h3>
        )}

        {/* 消息 */}
        <p className="text-sm font-retro-body text-current">
          {message}
        </p>

        {/* 操作按钮 */}
        {action && (
          <div className="mt-3">
            {action}
          </div>
        )}
      </div>

      {/* 关闭按钮 */}
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          className={cn(
            'ml-2 p-1 rounded-lg',
            'text-current/70 hover:text-current',
            'hover:bg-white/10',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-current',
            'cursor-pointer flex-shrink-0'
          )}
          aria-label="关闭提示"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}

      {/* 进度条（如果设置了duration） */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-current/20 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-current/50 transition-all duration-1000 ease-linear"
            style={{
              width: isVisible ? '0%' : '100%',
            }}
          />
        </div>
      )}

      {/* CRT扫描线效果 */}
      {crt && (
        <div className="absolute inset-0 crt-scanlines pointer-events-none rounded-xl" />
      )}
    </div>
  )
}

// Toast容器组件
export interface ToastContainerProps {
  /** Toast列表 */
  toasts: ToastProps[]
  /** 移除Toast的回调函数 */
  onRemoveToast?: (index: number) => void
  /** 容器位置 */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

// 位置类名映射
const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
}

/**
 * Toast容器组件
 * 用于管理多个Toast的显示位置和堆叠
 */
export function ToastContainer({
  toasts,
  onRemoveToast,
  position = 'top-right',
}: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className={cn(
        'fixed z-[100]',
        'flex flex-col gap-3',
        positionClasses[position],
        'max-h-screen overflow-y-auto',
        'p-4'
      )}
    >
      {toasts.map((toast, index) => (
        <Toast
          key={index}
          {...toast}
          onClose={() => onRemoveToast?.(index)}
        />
      ))}
    </div>
  )
}
