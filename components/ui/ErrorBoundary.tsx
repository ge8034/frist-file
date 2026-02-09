/**
 * Retro-Futurism 风格错误边界组件
 * 用于捕获React组件错误并提供友好的错误界面
 */

'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Loading } from './Loading'

interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode
  /** 自定义错误消息 */
  errorMessage?: string
  /** 自定义重试函数 */
  onRetry?: () => void
  /** 是否显示重试按钮 */
  showRetry?: boolean
  /** 是否显示错误详情 */
  showDetails?: boolean
  /** 错误时显示的备用组件 */
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  isRetrying: boolean
}

/**
 * Retro-Futurism 错误边界组件
 *
 * @example
 * ```tsx
 * // 基本用法
 * <ErrorBoundary>
 *   <GameCanvas roomId="123" />
 * </ErrorBoundary>
 *
 * // 自定义错误处理
 * <ErrorBoundary
 *   errorMessage="游戏加载失败"
 *   showRetry
 *   onRetry={() => window.location.reload()}
 *   showDetails={process.env.NODE_ENV === 'development'}
 * />
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    })

    // 在生产环境中可以发送错误到监控服务
    if (process.env.NODE_ENV === 'production') {
      console.error('ErrorBoundary 捕获到错误:', error, errorInfo)
      // 这里可以集成错误监控服务，如 Sentry、LogRocket 等
    }
  }

  handleRetry = async (): Promise<void> => {
    this.setState({ isRetrying: true })

    try {
      // 如果有自定义重试函数，调用它
      if (this.props.onRetry) {
        await this.props.onRetry()
      } else {
        // 默认重试行为：重置错误状态
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
        })
      }
    } catch (error) {
      console.error('重试失败:', error)
    } finally {
      this.setState({ isRetrying: false })
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    const { hasError, error, errorInfo, isRetrying } = this.state
    const { children, errorMessage, showRetry = true, showDetails = false, fallback } = this.props

    if (isRetrying) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <Loading
            variant="neon"
            size="lg"
            showText
            text="正在重试..."
            textPosition="bottom"
            crt
            glow
          />
        </div>
      )
    }

    if (hasError) {
      // 如果有自定义备用组件，使用它
      if (fallback) {
        return fallback
      }

      const displayMessage = errorMessage || '游戏加载时发生错误'
      const errorName = error?.name || '未知错误'
      const errorStack = error?.stack || '无堆栈信息'

      return (
        <div className="relative min-h-[400px] p-8 bg-retro-background crt-scanlines rounded-xl border-2 border-retro-primary-500/30 shadow-neon-primary">
          {/* CRT边框效果 */}
          <div className="absolute inset-4 crt-border rounded-lg crt-glow" />

          {/* 霓辉光背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-retro-primary-500/5 via-retro-secondary-500/3 to-retro-accent-500/5 rounded-xl" />

          {/* 内容 */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
            {/* 错误图标 */}
            <div className="relative">
              <div className="w-24 h-24 border-4 border-game-danger/50 rounded-full shadow-neon-danger"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
                ⚠️
              </div>
            </div>

            {/* 错误标题 */}
            <div className="space-y-2">
              <h2 className="text-2xl font-retro-display text-game-danger animate-pulse">
                {displayMessage}
              </h2>
              <p className="text-retro-primary-400 font-retro-body">
                系统检测到异常，请尝试以下操作
              </p>
            </div>

            {/* 错误详情（开发环境显示） */}
            {showDetails && error && (
              <div className="w-full max-w-2xl p-4 bg-retro-surface/50 rounded-lg border border-retro-primary-500/20 text-left">
                <div className="font-retro-mono text-sm space-y-2">
                  <div className="text-retro-primary-500">
                    <span className="text-retro-secondary-500">错误类型:</span> {errorName}
                  </div>
                  <div className="text-retro-primary-400">
                    <span className="text-retro-secondary-500">错误消息:</span> {error.message}
                  </div>
                  {errorInfo?.componentStack && (
                    <div className="text-retro-primary-300">
                      <div className="text-retro-secondary-500 mb-1">组件堆栈:</div>
                      <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40 p-2 bg-retro-background/50 rounded">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  <div className="text-retro-primary-300">
                    <div className="text-retro-secondary-500 mb-1">错误堆栈:</div>
                    <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40 p-2 bg-retro-background/50 rounded">
                      {errorStack}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              {showRetry && (
                <button
                  onClick={this.handleRetry}
                  className="px-6 py-3 bg-gradient-to-r from-retro-primary-600 to-retro-primary-500 text-white font-retro-heading rounded-lg hover:from-retro-primary-700 hover:to-retro-primary-600 transition-all duration-300 shadow-neon-primary hover:shadow-neon-primary-hover"
                >
                  🔄 重试
                </button>
              )}

              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-retro-secondary-600 to-retro-secondary-500 text-white font-retro-heading rounded-lg hover:from-retro-secondary-700 hover:to-retro-secondary-600 transition-all duration-300 shadow-neon-secondary hover:shadow-neon-secondary-hover"
              >
                🚀 重置
              </button>

              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gradient-to-r from-game-info to-retro-primary-500 text-white font-retro-heading rounded-lg hover:from-game-info/90 hover:to-retro-primary-600 transition-all duration-300 shadow-neon-info hover:shadow-neon-info"
              >
                🔄 刷新页面
              </button>
            </div>

            {/* 错误代码（用于调试） */}
            <div className="mt-8 pt-4 border-t border-retro-primary-900/30 w-full max-w-md">
              <div className="text-xs font-retro-mono text-retro-text-secondary/50 space-y-1">
                <div>错误代码: {Date.now().toString(36).toUpperCase()}</div>
                <div>时间戳: {new Date().toISOString()}</div>
                <div>环境: {process.env.NODE_ENV}</div>
              </div>
            </div>

            {/* 技术支持信息 */}
            <div className="text-sm font-retro-body text-retro-text-secondary/70">
              如果问题持续存在，请联系技术支持
            </div>
          </div>

          {/* 装饰角 */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-game-danger opacity-70"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-game-warning opacity-70"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-game-warning opacity-70"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-game-danger opacity-70"></div>
        </div>
      )
    }

    return children
  }
}

/**
 * 游戏特定错误边界组件
 * 针对Phaser游戏加载错误进行优化
 */
interface GameErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'fallback'> {
  /** 游戏房间ID */
  roomId?: string
  /** 是否显示游戏特定错误信息 */
  showGameTips?: boolean
}

/**
 * 游戏错误边界组件
 * 专门用于处理游戏相关的错误
 */
export function GameErrorBoundary({
  children,
  roomId,
  showGameTips = true,
  ...props
}: GameErrorBoundaryProps) {
  const gameFallback = (
    <div className="relative min-h-[400px] p-8 bg-retro-background crt-scanlines rounded-xl">
      <div className="absolute inset-4 crt-border rounded-lg crt-glow" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-retro-primary-500/50 rounded-full shadow-neon-primary animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl">
            🎮
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-retro-display text-retro-primary-400">
            游戏引擎加载失败
          </h2>
          <p className="text-retro-text-secondary font-retro-body">
            无法初始化Phaser游戏引擎
          </p>
        </div>

        {showGameTips && (
          <div className="w-full max-w-md p-4 bg-retro-surface/50 rounded-lg border border-retro-primary-500/20">
            <h3 className="text-lg font-retro-heading text-retro-secondary-500 mb-3">
              游戏加载问题排查
            </h3>
            <ul className="text-sm font-retro-body text-retro-text-secondary space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-retro-primary-500">✓</span>
                <span>检查网络连接是否正常</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-retro-primary-500">✓</span>
                <span>确保浏览器支持WebGL（Chrome/Firefox推荐）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-retro-primary-500">✓</span>
                <span>尝试禁用浏览器扩展程序</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-retro-primary-500">✓</span>
                <span>清除浏览器缓存后重试</span>
              </li>
              {roomId && (
                <li className="flex items-start gap-2">
                  <span className="text-retro-primary-500">✓</span>
                  <span>房间ID: <code className="bg-retro-background/50 px-2 py-1 rounded">{roomId}</code></span>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-retro-primary-600 to-retro-primary-500 text-white font-retro-heading rounded-lg hover:from-retro-primary-700 hover:to-retro-primary-600 transition-all duration-300 shadow-neon-primary"
          >
            🔄 重新加载游戏
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-retro-surface to-retro-primary-900 text-white font-retro-heading rounded-lg hover:from-retro-surface/90 hover:to-retro-primary-800 transition-all duration-300 shadow-neon-primary"
          >
            ↩️ 返回上一页
          </button>
        </div>

        <div className="text-xs font-retro-mono text-retro-text-secondary/50 mt-8">
          GuanDan2 • Phaser 3 • Retro-Futurism Edition
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary
      {...props}
      fallback={gameFallback}
      errorMessage="游戏加载失败"
      showRetry={true}
    >
      {children}
    </ErrorBoundary>
  )
}