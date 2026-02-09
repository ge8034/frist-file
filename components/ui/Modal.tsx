/**
 * Retro-Futurism 风格模态框组件
 * 支持CRT效果、霓虹发光和故障动画
 */

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { XMarkIcon } from '@heroicons/react/24/outline'

// 模态框组件类型
export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** 是否显示模态框 */
  isOpen: boolean
  /** 关闭模态框的回调函数 */
  onClose: () => void
  /** 模态框标题 */
  title?: string
  /** 标题右侧内容 */
  titleExtra?: ReactNode
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean
  /** 点击遮罩层是否关闭 */
  closeOnOverlayClick?: boolean
  /** 模态框大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** CRT边框效果 */
  crt?: boolean
  /** 霓辉光效果 */
  glow?: boolean
  /** 故障效果 */
  glitch?: boolean
  /** 阻止滚动 */
  preventScroll?: boolean
}

// 尺寸映射
const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
}

/**
 * Retro-Futurism 模态框组件
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="游戏设置"
 *   size="md"
 *   crt
 *   glow
 * >
 *   <SettingsForm />
 * </Modal>
 * ```
 */
const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    isOpen,
    onClose,
    title,
    titleExtra,
    showCloseButton = true,
    closeOnOverlayClick = true,
    size = 'md',
    crt = true,
    glow = false,
    glitch = false,
    preventScroll = true,
    className,
    children,
    ...props
  }, ref) => {
    // 阻止滚动
    if (preventScroll && isOpen) {
      document.body.style.overflow = 'hidden'
    } else if (preventScroll && !isOpen) {
      document.body.style.overflow = 'unset'
    }

    // 如果不显示，返回null
    if (!isOpen) return null

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose()
      }
    }

    const handleClose = () => {
      if (preventScroll) {
        document.body.style.overflow = 'unset'
      }
      onClose()
    }

    return (
      <>
        {/* 遮罩层 */}
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
          aria-hidden="true"
        >
          {/* CRT扫描线全局效果 */}
          {crt && <div className="absolute inset-0 crt-scanlines pointer-events-none" />}

          {/* 霓虹辉光背景 */}
          {glow && (
            <div className="absolute inset-0 bg-gradient-to-r from-retro-primary-900/20 via-retro-secondary-900/10 to-retro-primary-900/20 backdrop-blur-xl" />
          )}

          {/* 故障效果层 */}
          {glitch && <div className="absolute inset-0 animate-glitch pointer-events-none" />}

          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* 模态框内容 */}
          <div
            ref={ref}
            className={cn(
              'relative z-10',
              'w-full',
              sizeClasses[size],
              'bg-retro-surface/95 backdrop-blur-lg',
              'rounded-2xl',
              'shadow-2xl',
              crt && 'crt-border',
              glow && 'crt-glow',
              'transform transition-all duration-300',
              'animate-in fade-in-0 zoom-in-95',
              className
            )}
            {...props}
          >
            {/* 标题栏 */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 pb-4 border-b border-retro-primary-500/20">
                {title && (
                  <div className="flex-1">
                    <h2 className="text-2xl font-retro-heading font-bold text-retro-text-primary">
                      {title}
                    </h2>
                    {glitch && <div className="text-xs font-retro-mono text-retro-primary-400 animate-pulse">SYSTEM_MODAL_ACTIVE</div>}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {titleExtra}
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={handleClose}
                      className={cn(
                        'p-2 rounded-lg',
                        'text-retro-text-secondary hover:text-retro-text-primary',
                        'hover:bg-retro-primary-500/10',
                        'transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-retro-primary-500',
                        'cursor-pointer'
                      )}
                      aria-label="关闭模态框"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 内容区域 */}
            <div className="p-6">
              {children}
            </div>

            {/* 底部扫描线效果 */}
            {crt && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-retro-primary-500 to-transparent animate-scanline" />
            )}
          </div>
        </div>
      </>
    )
  }
)
Modal.displayName = 'Modal'

export { Modal }
