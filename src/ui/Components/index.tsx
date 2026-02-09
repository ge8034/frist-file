/**
 * 通用组件集合
 * 包含可复用的 UI 组件
 */

/**
 * 按钮组件
 */
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: ButtonProps): JSX.Element {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors'
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * 输入框组件
 */
interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
}: InputProps): JSX.Element {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
    />
  )
}

/**
 * 卡片组件
 */
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps): JSX.Element {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  )
}

/**
 * 标签组件
 */
interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info'
}

export function Badge({ children, variant = 'info' }: BadgeProps): JSX.Element {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

/**
 * 加载动画组件
 */
export function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )
}

/**
 * 通知组件
 */
interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose?: () => void
}

export function Notification({
  message,
  type,
  onClose,
}: NotificationProps): JSX.Element | null {
  if (!message) return null

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }

  return (
    <div
      className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white shadow-lg ${typeStyles[type]} z-50`}
      onClick={onClose}
    >
      {message}
    </div>
  )
}

/**
 * 模态框组件
 */
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps): JSX.Element | null {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
