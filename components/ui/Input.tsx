/**
 * Retro-Futurism 风格输入框组件
 * 支持霓虹边框、CRT效果和故障状态
 */

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

// 输入框变体定义
const inputVariants = cva(
  // 基础样式
  cn(
    'w-full',
    'px-4 py-3',
    'rounded-lg',
    'font-retro-body',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-retro-primary-500 focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-retro-text-secondary/50',
  ),
  {
    variants: {
      variant: {
        // 默认输入框
        default: cn(
          'bg-retro-surface/80',
          'text-retro-text-primary',
          'border-2 border-retro-primary-500/30',
          'focus:shadow-neon-primary',
        ),
        // 霓虹输入框
        neon: cn(
          'bg-retro-surface/60',
          'text-retro-text-primary',
          'border-2 border-retro-primary-400',
          'shadow-neon-primary',
          'focus:shadow-neon-primary-hover',
          'focus:border-retro-primary-300',
        ),
        // 玻璃质感输入框
        glass: cn(
          'bg-white/10',
          'backdrop-blur-md',
          'text-white',
          'border border-white/20',
          'focus:bg-white/15',
          'focus:border-white/30',
        ),
        // 深色输入框
        dark: cn(
          'bg-retro-background/90',
          'text-retro-text-primary',
          'border border-retro-primary-500/40',
          'focus:border-retro-primary-300',
        ),
      },
      size: {
        sm: 'py-2 text-sm',
        md: 'py-3 text-base',
        lg: 'py-4 text-lg',
      },
      // 状态变体
      status: {
        default: '',
        error: cn(
          'border-game-danger',
          'focus:ring-game-danger',
          'focus:border-game-danger',
          'shadow-neon-danger',
        ),
        success: cn(
          'border-game-success',
          'focus:ring-game-success',
          'focus:border-game-success',
          'shadow-neon-success',
        ),
        warning: cn(
          'border-game-warning',
          'focus:ring-game-warning',
          'focus:border-game-warning',
          'shadow-neon-warning',
        ),
      },
      // CRT边框效果
      crt: {
        true: 'crt-border',
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
      size: 'md',
      status: 'default',
      crt: true,
      fullWidth: true,
    },
  }
)

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** 标签文本 */
  label?: string
  /** 标签说明 */
  description?: string
  /** 错误信息 */
  error?: string
  /** 成功信息 */
  success?: string
  /** 警告信息 */
  warning?: string
  /** 左侧图标 */
  leftIcon?: ReactNode
  /** 右侧图标 */
  rightIcon?: ReactNode
  /** 是否显示字符计数 */
  showCount?: boolean
  /** 最大字符数（用于字符计数） */
  maxLength?: number
}

/**
 * Retro-Futurism 输入框组件
 *
 * @example
 * ```tsx
 * // 默认输入框
 * <Input placeholder="请输入用户名" />
 *
 * // 带标签和错误状态的输入框
 * <Input
 *   label="邮箱"
 *   type="email"
 *   status="error"
 *   error="请输入有效的邮箱地址"
 *   variant="neon"
 *   crt
 * />
 *
 * // 带图标的输入框
 * <Input
 *   leftIcon={<EnvelopeIcon className="w-5 h-5" />}
 *   placeholder="输入邮箱"
 *   variant="glass"
 * />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    status,
    crt,
    fullWidth,
    label,
    description,
    error,
    success,
    warning,
    leftIcon,
    rightIcon,
    showCount,
    maxLength,
    value,
    disabled,
    id,
    ...props
  }, ref) => {
    // 生成唯一的ID（如果未提供）
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    // 确定显示的状态
    const displayStatus = error ? 'error' : success ? 'success' : warning ? 'warning' : status

    // 状态图标
    const statusIcon = {
      error: <ExclamationCircleIcon className="w-5 h-5 text-game-danger" />,
      success: <CheckCircleIcon className="w-5 h-5 text-game-success" />,
      warning: <ExclamationCircleIcon className="w-5 h-5 text-game-warning" />,
      default: null,
    }[displayStatus || 'default']

    // 状态消息
    const statusMessage = error || success || warning

    // 字符计数
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-retro-heading font-medium text-retro-text-primary"
          >
            {label}
          </label>
        )}

        {/* 描述 */}
        {description && (
          <p className="text-xs text-retro-text-secondary">{description}</p>
        )}

        {/* 输入框容器 */}
        <div className="relative">
          {/* 左侧图标 */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-retro-text-secondary">
              {leftIcon}
            </div>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, status: displayStatus, crt, fullWidth, className }),
              leftIcon && 'pl-10',
              (rightIcon || statusIcon) && 'pr-10',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            value={value}
            disabled={disabled}
            maxLength={maxLength}
            aria-invalid={displayStatus === 'error'}
            aria-describedby={
              statusMessage
                ? `${inputId}-message`
                : undefined
            }
            {...props}
          />

          {/* 右侧图标（状态图标或自定义图标） */}
          {(rightIcon || statusIcon) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {statusIcon || rightIcon}
            </div>
          )}

          {/* 字符计数 */}
          {showCount && maxLength && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-retro-mono text-retro-text-secondary">
              {currentLength}/{maxLength}
            </div>
          )}
        </div>

        {/* 状态消息 */}
        {statusMessage && (
          <p
            id={`${inputId}-message`}
            className={cn(
              'text-sm font-retro-body',
              displayStatus === 'error' && 'text-game-danger',
              displayStatus === 'success' && 'text-game-success',
              displayStatus === 'warning' && 'text-game-warning'
            )}
          >
            {statusMessage}
          </p>
        )}

        {/* 字符计数（底部显示） */}
        {showCount && maxLength && !statusMessage && (
          <div className="flex justify-end">
            <span className={cn(
              'text-xs font-retro-mono',
              currentLength > maxLength * 0.9
                ? 'text-game-warning'
                : currentLength > maxLength
                  ? 'text-game-danger'
                  : 'text-retro-text-secondary'
            )}>
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }