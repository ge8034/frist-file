/**
 * 回合指示器组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Clock, User, Cpu, Zap, AlertTriangle } from 'lucide-react'

interface TurnIndicatorProps {
  /** 当前回合玩家名称 */
  currentPlayerName: string
  /** 玩家类型：human 或 ai */
  playerType: 'human' | 'ai'
  /** 剩余时间（秒） */
  timeRemaining?: number
  /** 总时间（秒） */
  totalTime?: number
  /** 回合序号 */
  turnNumber?: number
  /** 是否超时 */
  isTimeout?: boolean
  /** 是否显示动画 */
  animated?: boolean
  /** 位置：top, bottom, left, right, center */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  /** CRT边框效果 */
  crt?: boolean
  /** 霓辉光效果 */
  glow?: boolean
}

export default function TurnIndicator({
  currentPlayerName,
  playerType,
  timeRemaining,
  totalTime = 30,
  turnNumber = 1,
  isTimeout = false,
  animated = true,
  position = 'top',
  crt = true,
  glow = true,
}: TurnIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState(timeRemaining || totalTime)
  const [pulse, setPulse] = useState(false)

  // 更新时间剩余
  useEffect(() => {
    if (timeRemaining !== undefined) {
      setTimeLeft(timeRemaining)
    }
  }, [timeRemaining])

  // 脉冲动画
  useEffect(() => {
    if (!animated) return

    const interval = setInterval(() => {
      setPulse(prev => !prev)
    }, 1000)

    return () => clearInterval(interval)
  }, [animated])

  // 位置样式
  const positionStyles = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2',
    right: 'right-4 top-1/2 -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  }

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 计算时间百分比
  const timePercentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0

  // 时间颜色
  const getTimeColor = () => {
    if (isTimeout) return 'text-game-danger'
    if (timePercentage < 30) return 'text-game-warning'
    if (timePercentage < 60) return 'text-game-info'
    return 'text-game-success'
  }

  return (
    <div className={cn(
      'fixed z-50',
      positionStyles[position]
    )}>
      <div className={cn(
        'relative',
        'p-4',
        'rounded-xl',
        'backdrop-blur-sm',
        'border-2',
        crt && 'crt-border',
        glow && 'crt-glow',
        'transition-all duration-300',
        animated && pulse && 'shadow-neon-primary',
        isTimeout
          ? 'border-game-danger/50 bg-game-danger/10'
          : playerType === 'ai'
            ? 'border-retro-secondary/50 bg-retro-secondary/10'
            : 'border-retro-primary/50 bg-retro-primary/10'
      )}>
        {/* 霓虹辉光背景 */}
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current/5 to-transparent rounded-xl pointer-events-none" />
        )}

        <div className="flex items-center gap-4">
          {/* 左侧：玩家信息 */}
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              'transition-all duration-300',
              playerType === 'ai'
                ? 'bg-retro-secondary/20 border-2 border-retro-secondary/50'
                : 'bg-retro-primary/20 border-2 border-retro-primary/50',
              animated && pulse && 'scale-110'
            )}>
              {playerType === 'ai' ? (
                <Cpu className="w-6 h-6 text-retro-secondary-400" />
              ) : (
                <User className="w-6 h-6 text-retro-primary-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  'font-retro-heading font-bold text-lg',
                  playerType === 'ai' ? 'text-retro-secondary-400' : 'text-retro-primary-400'
                )}>
                  {currentPlayerName}
                </h3>
                <div className={cn(
                  'px-2 py-1 rounded text-xs font-retro-mono',
                  playerType === 'ai'
                    ? 'bg-retro-secondary/20 text-retro-secondary-400'
                    : 'bg-retro-primary/20 text-retro-primary-400'
                )}>
                  {playerType === 'ai' ? 'AI PLAYER' : 'HUMAN'}
                </div>
              </div>
              <p className="text-sm text-retro-text-secondary mt-1">
                回合 #{turnNumber}
              </p>
            </div>
          </div>

          {/* 中间：时间进度 */}
          {timeRemaining !== undefined && (
            <div className="flex flex-col items-center gap-2 min-w-[120px]">
              <div className="flex items-center gap-2">
                <Clock className={cn('w-4 h-4', getTimeColor())} />
                <span className={cn('font-retro-digital text-lg font-bold', getTimeColor())}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* 时间进度条 */}
              <div className="w-full h-2 bg-retro-surface/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-out',
                    isTimeout
                      ? 'bg-game-danger'
                      : timePercentage < 30
                      ? 'bg-game-warning'
                      : timePercentage < 60
                      ? 'bg-game-info'
                      : 'bg-game-success'
                  )}
                  style={{ width: `${timePercentage}%` }}
                />
              </div>

              {isTimeout && (
                <div className="flex items-center gap-1 text-xs text-game-danger animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  超时！
                </div>
              )}
            </div>
          )}

          {/* 右侧：回合状态 */}
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              'px-3 py-2 rounded-lg',
              'transition-all duration-300',
              animated && pulse && 'scale-105',
              playerType === 'ai'
                ? 'bg-retro-secondary/20 text-retro-secondary-400'
                : 'bg-retro-primary/20 text-retro-primary-400'
            )}>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="font-retro-mono text-sm">
                  {animated ? 'ACTIVE TURN' : 'TURN'}
                </span>
              </div>
            </div>

            {/* 倒计时警告 */}
            {timeRemaining !== undefined && timePercentage < 30 && !isTimeout && (
              <div className="text-xs text-game-warning animate-pulse">
                时间紧迫
              </div>
            )}
          </div>
        </div>

        {/* 扫描动画 */}
        {animated && (
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current/30 to-transparent animate-scan" />
          </div>
        )}

        {/* CRT扫描线效果 */}
        {crt && (
          <div className="absolute inset-0 crt-scanlines pointer-events-none rounded-xl" />
        )}
      </div>
    </div>
  )
}