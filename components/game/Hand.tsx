/**
 * Retro-Futurism 风格手牌展示组件
 * 显示玩家手牌，支持选择、排序和操作
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Card } from '@/components/ui/Card'
import { Card as CardEntity } from '@/lib/domain/entities/Card'
import { ArrowsUpDownIcon, SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export interface HandProps {
  /** 手牌列表 */
  cards: CardEntity[]
  /** 选中的卡牌索引列表 */
  selectedIndices: number[]
  /** 卡牌点击回调 */
  onCardClick?: (index: number) => void
  /** 多选模式 */
  multiSelect?: boolean
  /** 是否显示卡牌背面 */
  showFaceDown?: boolean
  /** 是否可操作 */
  interactive?: boolean
  /** 排序方式：rank, suit, custom */
  sortBy?: 'rank' | 'suit' | 'custom'
  /** 是否显示排序按钮 */
  showSortControls?: boolean
  /** 排序回调 */
  onSort?: (sortBy: 'rank' | 'suit') => void
  /** 是否显示提示按钮 */
  showHintButton?: boolean
  /** 提示回调 */
  onHint?: () => void
  /** 是否显示隐藏按钮 */
  showHideButton?: boolean
  /** 隐藏/显示回调 */
  onToggleHide?: (hidden: boolean) => void
  /** 手牌标题 */
  title?: string
  /** 手牌描述 */
  description?: string
  /** 最大显示卡牌数量（超过时显示更多指示） */
  maxVisibleCards?: number
  /** CRT边框效果 */
  crt?: boolean
  /** 霓辉光效果 */
  glow?: boolean
}

/**
 * Retro-Futurism 手牌组件
 *
 * @example
 * ```tsx
 * <Hand
 *   cards={playerHand}
 *   selectedIndices={selectedCards}
 *   onCardClick={handleCardSelect}
 *   title="我的手牌"
 *   description="点击选择要打出的牌"
 *   showSortControls
 *   showHintButton
 *   interactive
 *   crt
 * />
 * ```
 */
export function Hand({
  cards,
  selectedIndices = [],
  onCardClick,
  multiSelect = false,
  showFaceDown = false,
  interactive = true,
  sortBy = 'custom',
  showSortControls = false,
  onSort,
  showHintButton = false,
  onHint,
  showHideButton = false,
  onToggleHide,
  title = '手牌',
  description,
  maxVisibleCards = 15,
  crt = true,
  glow = false,
}: HandProps) {
  const isHandEmpty = cards.length === 0
  const isHidden = showFaceDown
  const showMoreIndicator = maxVisibleCards > 0 && cards.length > maxVisibleCards

  // 处理卡牌点击
  const handleCardClick = (index: number) => {
    if (!interactive) return
    onCardClick?.(index)
  }

  // 处理排序
  const handleSort = (type: 'rank' | 'suit') => {
    onSort?.(type)
  }

  // 处理提示
  const handleHint = () => {
    onHint?.()
  }

  // 处理隐藏/显示切换
  const handleToggleHide = () => {
    onToggleHide?.(!showFaceDown)
  }

  // 显示卡牌（可能截断）
  const displayCards = showMoreIndicator
    ? cards.slice(0, maxVisibleCards)
    : cards

  // 选中的卡牌数量
  const selectedCount = selectedIndices.length

  return (
    <SurfaceCard
      variant="dark"
      elevation="medium"
      crt={crt}
      glow={glow}
      className="p-4"
    >
      {/* 手牌头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-retro-heading font-bold text-retro-text-primary">
              {title}
            </h3>

            {/* 手牌数量指示器 */}
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-retro-digital px-2 py-1 rounded',
                'bg-retro-surface/50',
                'text-retro-primary-400'
              )}>
                {cards.length} CARDS
              </span>

              {/* 选中卡牌指示器 */}
              {selectedCount > 0 && (
                <span className="text-sm font-retro-digital px-2 py-1 rounded bg-retro-primary-900/50 text-retro-primary-400 animate-pulse">
                  {selectedCount} SELECTED
                </span>
              )}
            </div>
          </div>

          {/* 描述 */}
          {description && (
            <p className="text-sm font-retro-body text-retro-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-2">
          {/* 排序按钮 */}
          {showSortControls && interactive && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSort('rank')}
                className={cn(
                  'p-2 rounded-lg',
                  'text-retro-text-secondary hover:text-retro-text-primary',
                  'hover:bg-retro-primary-500/10',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-retro-primary-500',
                  'cursor-pointer',
                  sortBy === 'rank' && 'bg-retro-primary-500/20 text-retro-primary-400'
                )}
                aria-label="按点数排序"
                title="按点数排序"
              >
                <span className="text-xs font-retro-mono">RANK</span>
              </button>
              <button
                type="button"
                onClick={() => handleSort('suit')}
                className={cn(
                  'p-2 rounded-lg',
                  'text-retro-text-secondary hover:text-retro-text-primary',
                  'hover:bg-retro-primary-500/10',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-retro-primary-500',
                  'cursor-pointer',
                  sortBy === 'suit' && 'bg-retro-primary-500/20 text-retro-primary-400'
                )}
                aria-label="按花色排序"
                title="按花色排序"
              >
                <span className="text-xs font-retro-mono">SUIT</span>
              </button>
              <ArrowsUpDownIcon className="w-4 h-4 text-retro-text-secondary" />
            </div>
          )}

          {/* 提示按钮 */}
          {showHintButton && interactive && (
            <button
              type="button"
              onClick={handleHint}
              className={cn(
                'p-2 rounded-lg',
                'text-retro-text-secondary hover:text-retro-text-primary',
                'hover:bg-retro-primary-500/10',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-retro-primary-500',
                'cursor-pointer'
              )}
              aria-label="获取提示"
              title="获取提示"
            >
              <SparklesIcon className="w-5 h-5" />
            </button>
          )}

          {/* 隐藏/显示按钮 */}
          {showHideButton && (
            <button
              type="button"
              onClick={handleToggleHide}
              className={cn(
                'p-2 rounded-lg',
                'text-retro-text-secondary hover:text-retro-text-primary',
                'hover:bg-retro-primary-500/10',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-retro-primary-500',
                'cursor-pointer'
              )}
              aria-label={isHidden ? "显示手牌" : "隐藏手牌"}
              title={isHidden ? "显示手牌" : "隐藏手牌"}
            >
              {isHidden ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 手牌内容 */}
      <div className={cn(
        'min-h-[180px]',
        'rounded-lg',
        'p-4',
        'bg-retro-surface/30',
        'border border-retro-primary-500/20',
        'transition-all duration-300',
        isHandEmpty && 'flex items-center justify-center'
      )}>
        {isHandEmpty ? (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">🃏</div>
            <p className="text-retro-text-secondary font-retro-body">
              手牌为空
            </p>
            <p className="text-sm text-retro-text-secondary/70 mt-1">
              等待发牌...
            </p>
          </div>
        ) : isHidden ? (
          // 隐藏状态：显示卡牌背面
          <div className="flex flex-wrap gap-3 justify-center">
            {Array.from({ length: Math.min(5, cards.length) }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-16 h-24 rounded-lg',
                  'bg-gradient-to-br from-retro-primary-900/30 to-retro-secondary-900/30',
                  'border-2 border-retro-primary-500/30',
                  'flex items-center justify-center',
                  'crt-border'
                )}
              >
                <span className="text-xs font-retro-mono text-retro-primary-400/50">
                  HIDDEN
                </span>
              </div>
            ))}
            {cards.length > 5 && (
              <div className="flex items-center justify-center">
                <span className="text-sm font-retro-mono text-retro-text-secondary">
                  +{cards.length - 5} more
                </span>
              </div>
            )}
          </div>
        ) : (
          // 显示手牌
          <div className="flex flex-wrap gap-2 justify-center">
            {displayCards.map((card, index) => (
              <div
                key={index}
                className={cn(
                  'transition-transform duration-200',
                  selectedIndices.includes(index) && 'transform -translate-y-4'
                )}
              >
                <Card
                  card={card}
                  selected={selectedIndices.includes(index)}
                  onClick={() => handleCardClick(index)}
                  disabled={!interactive}
                  size="medium"
                  crt={crt}
                  glow={glow && selectedIndices.includes(index)}
                  playable={interactive}
                  className={cn(
                    'transition-all duration-200',
                    interactive && 'hover:scale-105'
                  )}
                />
              </div>
            ))}

            {/* 更多指示器 */}
            {showMoreIndicator && (
              <div className="flex items-center justify-center w-16 h-24">
                <div className="text-center">
                  <div className="text-2xl mb-1">+</div>
                  <div className="text-xs font-retro-mono text-retro-text-secondary">
                    {cards.length - maxVisibleCards} MORE
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 手牌状态栏 */}
      <div className="mt-4 pt-3 border-t border-retro-primary-500/20">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {/* 选择模式指示 */}
            <div className="flex items-center gap-1">
              <span className="text-retro-text-secondary">选择模式:</span>
              <span className="font-retro-mono text-retro-primary-400">
                {multiSelect ? 'MULTI' : 'SINGLE'}
              </span>
            </div>

            {/* 交互状态指示 */}
            <div className="flex items-center gap-1">
              <span className="text-retro-text-secondary">交互:</span>
              <span className={cn(
                'font-retro-mono',
                interactive ? 'text-game-success' : 'text-game-danger'
              )}>
                {interactive ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>

          {/* 排序状态指示 */}
          {showSortControls && (
            <div className="flex items-center gap-1">
              <span className="text-retro-text-secondary">排序:</span>
              <span className="font-retro-mono text-retro-primary-400">
                {sortBy.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 操作提示 */}
      {interactive && !isHandEmpty && !isHidden && (
        <div className="mt-3 p-2 rounded bg-retro-surface/50 border border-retro-primary-500/20">
          <div className="text-xs font-retro-mono text-retro-text-secondary flex items-center justify-center gap-4">
            <span>点击选择卡牌</span>
            <span className="text-retro-primary-400">•</span>
            <span>{multiSelect ? '可多选' : '单选模式'}</span>
            <span className="text-retro-primary-400">•</span>
            <span>按ESC取消选择</span>
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
