/**
 * Retro-Futurism 风格玩家区域组件
 * 显示玩家信息、手牌和状态
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { UserIcon, CpuChipIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline'

export interface PlayerAreaProps {
  /** 玩家名称 */
  name: string
  /** 玩家类型：human 或 ai */
  type: 'human' | 'ai'
  /** AI策略类型（仅对AI玩家有效） */
  aiStrategy?: 'random' | 'greedy' | 'memory'
  /** 玩家头像或图标 */
  avatar?: ReactNode
  /** 手牌数量 */
  handCount: number
  /** 玩家得分 */
  score?: number
  /** 是否当前回合 */
  isCurrentTurn?: boolean
  /** 是否胜利者 */
  isWinner?: boolean
  /** 玩家状态：thinking, waiting, disconnected */
  status?: 'thinking' | 'waiting' | 'disconnected' | 'ready'
  /** 思考时间（秒） */
  thinkTime?: number
  /** 位置：top, bottom, left, right */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** 是否显示手牌预览 */
  showHandPreview?: boolean
  /** 手牌预览内容 */
  handPreview?: ReactNode
  /** 点击回调 */
  onClick?: () => void
  /** CRT边框效果 */
  crt?: boolean
  /** 霓辉光效果 */
  glow?: boolean
}

// 位置样式映射
const positionStyles = {
  top: 'border-b-4 border-retro-primary-500 bg-gradient-to-b from-retro-primary-900/20 to-transparent',
  bottom: 'border-t-4 border-retro-primary-500 bg-gradient-to-t from-retro-primary-900/20 to-transparent',
  left: 'border-r-4 border-retro-primary-500 bg-gradient-to-r from-retro-primary-900/20 to-transparent',
  right: 'border-l-4 border-retro-primary-500 bg-gradient-to-l from-retro-primary-900/20 to-transparent',
}

// AI策略颜色映射
const strategyColors = {
  random: 'text-retro-primary-400',
  greedy: 'text-game-warning',
  memory: 'text-game-success',
}

// 状态颜色映射
const statusColors = {
  thinking: 'text-retro-secondary-400',
  waiting: 'text-retro-text-secondary',
  disconnected: 'text-game-danger',
  ready: 'text-game-success',
}

// 状态图标映射
const statusIcons = {
  thinking: (
    <div className="flex items-center gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-retro-secondary-400 animate-ping" />
      <div className="w-1.5 h-1.5 rounded-full bg-retro-secondary-400 animate-ping" style={{ animationDelay: '0.2s' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-retro-secondary-400 animate-ping" style={{ animationDelay: '0.4s' }} />
    </div>
  ),
  waiting: <ClockIcon className="w-4 h-4" />,
  disconnected: <div className="w-2 h-2 rounded-full bg-game-danger" />,
  ready: <div className="w-2 h-2 rounded-full bg-game-success" />,
}

/**
 * Retro-Futurism 玩家区域组件
 *
 * @example
 * ```tsx
 * // 人类玩家
 * <PlayerArea
 *   name="玩家1"
 *   type="human"
 *   handCount={13}
 *   score={250}
 *   isCurrentTurn
 *   position="bottom"
 *   crt
 * />
 *
 * // AI玩家
 * <PlayerArea
 *   name="AI对手"
 *   type="ai"
 *   aiStrategy="memory"
 *   handCount={10}
 *   status="thinking"
 *   thinkTime={5}
 *   position="right"
 *   glow
 * />
 * ```
 */
export function PlayerArea({
  name,
  type,
  aiStrategy,
  avatar,
  handCount,
  score = 0,
  isCurrentTurn = false,
  isWinner = false,
  status = 'waiting',
  thinkTime,
  position = 'bottom',
  showHandPreview = false,
  handPreview,
  onClick,
  crt = true,
  glow = false,
}: PlayerAreaProps) {
  const isAI = type === 'ai'
  const isThinking = status === 'thinking'

  return (
    <SurfaceCard
      variant={isAI ? 'ai' : 'player'}
      elevation={isCurrentTurn ? 'highest' : 'medium'}
      crt={crt}
      glow={glow || isCurrentTurn}
      hoverable={!!onClick}
      onClick={onClick}
      className={cn(
        'transition-all duration-300',
        positionStyles[position],
        isCurrentTurn && 'ring-2 ring-retro-primary-500 animate-pulse-slow',
        isWinner && 'ring-2 ring-game-success shadow-neon-success',
        isThinking && 'animate-pulse'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* 左侧：玩家信息 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* 头像/图标 */}
          <div className="relative">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isAI ? 'bg-retro-secondary-900/50' : 'bg-retro-primary-900/50',
              isCurrentTurn && 'ring-2 ring-retro-primary-500'
            )}>
              {avatar || (
                isAI ? (
                  <CpuChipIcon className="w-6 h-6 text-retro-secondary-400" />
                ) : (
                  <UserIcon className="w-6 h-6 text-retro-primary-400" />
                )
              )}
            </div>

            {/* 状态指示器 */}
            {status !== 'waiting' && (
              <div className="absolute -top-1 -right-1">
                {statusIcons[status]}
              </div>
            )}

            {/* 胜利者皇冠 */}
            {isWinner && (
              <div className="absolute -top-2 -left-2">
                <TrophyIcon className="w-5 h-5 text-game-warning" />
              </div>
            )}
          </div>

          {/* 玩家信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-retro-heading font-bold truncate',
                isCurrentTurn ? 'text-retro-primary-300' : 'text-retro-text-primary'
              )}>
                {name}
              </h3>

              {/* AI策略标签 */}
              {isAI && aiStrategy && (
                <span className={cn(
                  'text-xs font-retro-mono px-2 py-0.5 rounded',
                  'bg-retro-secondary-900/30',
                  strategyColors[aiStrategy]
                )}>
                  {aiStrategy.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1">
              {/* 手牌数量 */}
              <div className="flex items-center gap-1 text-sm">
                <span className="text-retro-text-secondary">手牌:</span>
                <span className="font-retro-digital text-retro-primary-400">{handCount}</span>
              </div>

              {/* 得分 */}
              {score > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-retro-text-secondary">得分:</span>
                  <span className="font-retro-digital text-game-success">{score}</span>
                </div>
              )}

              {/* 思考时间 */}
              {isThinking && thinkTime !== undefined && (
                <div className="flex items-center gap-1 text-sm">
                  <ClockIcon className="w-3 h-3 text-retro-secondary-400" />
                  <span className="font-retro-digital text-retro-secondary-400">{thinkTime}s</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：状态指示 */}
        <div className="flex flex-col items-end gap-1">
          {/* 当前回合指示 */}
          {isCurrentTurn && (
            <div className="text-xs font-retro-mono px-2 py-1 rounded bg-retro-primary-900/50 text-retro-primary-400 animate-pulse">
              TURN ACTIVE
            </div>
          )}

          {/* 状态标签 */}
          {status !== 'waiting' && (
            <div className={cn(
              'text-xs font-retro-mono px-2 py-1 rounded',
              status === 'thinking' && 'bg-retro-secondary-900/50 text-retro-secondary-400',
              status === 'disconnected' && 'bg-game-danger/20 text-game-danger',
              status === 'ready' && 'bg-game-success/20 text-game-success'
            )}>
              {status.toUpperCase()}
            </div>
          )}

          {/* 玩家类型标签 */}
          <div className={cn(
            'text-xs font-retro-mono px-2 py-1 rounded',
            isAI ? 'bg-retro-secondary-900/50 text-retro-secondary-400' : 'bg-retro-primary-900/50 text-retro-primary-400'
          )}>
            {isAI ? 'AI PLAYER' : 'HUMAN'}
          </div>
        </div>
      </div>

      {/* 手牌预览 */}
      {showHandPreview && handPreview && (
        <div className="mt-4 pt-3 border-t border-retro-primary-500/20">
          <div className="text-xs font-retro-mono text-retro-text-secondary mb-2">手牌预览</div>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {handPreview}
          </div>
        </div>
      )}

      {/* 思考进度条 */}
      {isThinking && (
        <div className="mt-3">
          <div className="h-1 bg-retro-surface/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-retro-secondary-500 to-retro-primary-500 rounded-full animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
          <div className="text-xs font-retro-mono text-retro-text-secondary mt-1 text-center">
            思考中...
          </div>
        </div>
      )}

      {/* CRT扫描线效果 */}
      {crt && (
        <div className="absolute inset-0 crt-scanlines pointer-events-none rounded-xl" />
      )}
    </SurfaceCard>
  )
}
