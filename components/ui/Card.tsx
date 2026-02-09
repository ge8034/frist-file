/**
 * Retro-Futurism 风格卡牌组件
 *
 * 功能：
 * - 渲染卡牌（花色、点数、大小王）
 * - 支持点击选择交互
 * - 选中状态视觉反馈
 * - 完整的可访问性支持
 * - CRT边框、霓虹发光效果
 */

import { Card as CardEntity } from '../../lib/domain/entities/Card'
import { cn } from '@/lib/utils'

/**
 * 卡牌组件属性接口
 */
export interface CardProps {
  /** 卡牌数据（来自领域实体） */
  card: CardEntity
  /** 是否被选中 */
  selected?: boolean
  /** 点击回调函数 */
  onClick?: () => void
  /** 是否禁用（不可点击） */
  disabled?: boolean
  /** 自定义样式类 */
  className?: string
  /** 卡牌尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** CRT边框效果 */
  crt?: boolean
  /** 霓辉光效果 */
  glow?: boolean
  /** 是否可打出 */
  playable?: boolean
}

/**
 * 获取卡牌颜色类名
 * - 红桃/方块为霓虹红色
 * - 梅花/黑桃为霓虹灰色
 * - 大小王为霓虹紫色
 */
const getCardColorClasses = (suit: string, jokerType?: string): string => {
  if (jokerType) {
    return 'text-card-joker border-card-joker/30 bg-gradient-to-br from-purple-900/30 to-purple-950/50'
  }

  const suitColors: Record<string, string> = {
    heart: 'text-card-red border-card-red/30 bg-gradient-to-br from-red-900/30 to-red-950/50',
    diamond: 'text-card-red border-card-red/30 bg-gradient-to-br from-red-900/30 to-red-950/50',
    club: 'text-card-black border-card-black/30 bg-gradient-to-br from-gray-900/30 to-gray-950/50',
    spade: 'text-card-black border-card-black/30 bg-gradient-to-br from-gray-900/30 to-gray-950/50',
  }

  return suitColors[suit] || 'text-card-black border-card-black/30 bg-gradient-to-br from-gray-900/30 to-gray-950/50'
}

/**
 * 获取卡牌阴影效果
 */
const getCardShadow = (suit: string, jokerType?: string, selected?: boolean, playable?: boolean): string => {
  if (jokerType) {
    return selected ? 'shadow-neon-joker shadow-neon-primary' : 'shadow-neon-joker'
  }

  if (suit === 'heart' || suit === 'diamond') {
    return selected ? 'shadow-neon-red shadow-neon-primary' : (playable ? 'shadow-neon-red' : '')
  }

  if (suit === 'club' || suit === 'spade') {
    return selected ? 'shadow-neon-black shadow-neon-primary' : (playable ? 'shadow-neon-black' : '')
  }

  return ''
}

/**
 * 获取卡牌尺寸类名
 */
const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: 'w-12 h-18 text-xs',
    medium: 'w-16 h-24 text-sm',
    large: 'w-20 h-30 text-base',
  }
  return sizes[size]
}

/**
 * 获取花色符号
 */
const getSuitSymbol = (suit: string) => {
  const symbols: Record<string, string> = {
    heart: '♥',
    diamond: '♦',
    club: '♣',
    spade: '♠',
  }
  return symbols[suit] || ''
}

/**
 * Retro-Futurism 卡牌组件
 */
export const Card = ({
  card,
  selected = false,
  onClick,
  disabled = false,
  playable = false,
  size = 'medium',
  crt = true,
  glow = false,
  className = '',
}: CardProps) => {
  // 基础样式类
  const baseClasses = cn(
    'rounded-lg',
    'cursor-pointer',
    'transition-all duration-150',
    'select-none relative overflow-hidden',
    'backdrop-blur-sm',
    'border-2',
    getSizeClasses(size),
    getCardColorClasses(card.suit, card.jokerType),
    getCardShadow(card.suit, card.jokerType, selected, playable),
    crt && 'crt-border',
    glow && 'crt-glow',
    // 状态类
    selected && cn(
      'ring-2 ring-retro-primary-500',
      '-translate-y-4',
      'z-10',
      'animate-pulse-glow'
    ),
    playable && !selected && 'animate-pulse-slow',
    disabled && 'opacity-50 cursor-not-allowed grayscale',
    !disabled && 'hover:-translate-y-2 hover:shadow-neon-card-hover'
  )

  // 禁用时不响应点击
  const handleCardClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  // 禁用时不设置 tabindex
  const tabIndex = disabled ? -1 : 0

  // 卡牌显示文本
  const cardLabel = card.isJoker
    ? `${card.jokerType === 'big' ? '大王' : '小王'}`
    : `${card.rank}${getSuitSymbol(card.suit)}`

  return (
    <div
      className={cn(baseClasses, className)}
      onClick={handleCardClick}
      tabIndex={tabIndex}
      role="button"
      aria-label={cardLabel}
      aria-pressed={selected}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* 卡牌背面图案 */}
      {!card.isFaceUp && (
        <div className="absolute inset-0 bg-gradient-to-br from-retro-primary-900/30 to-retro-secondary-900/30 flex items-center justify-center crt-border">
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <div className="text-2xl mb-1 font-retro-digital text-retro-primary-400">🎴</div>
            <div className="text-xs font-retro-mono text-retro-primary-400/70">CARD BACK</div>
            <div className="absolute bottom-2 text-[8px] font-retro-mono text-retro-primary-400/50">
              GUANDAN2
            </div>
          </div>
        </div>
      )}

      {/* 卡牌正面内容 */}
      {card.isFaceUp && (
        <div className="h-full w-full flex flex-col p-2">
          {/* 左上角点数 */}
          <div className="flex justify-between items-start">
            <span className="font-retro-heading font-bold leading-none">
              {card.rank}
            </span>
            {card.suit !== 'joker' && (
              <span className="text-xs">
                {getSuitSymbol(card.suit)}
              </span>
            )}
          </div>

          {/* 卡牌中间 */}
          <div className="flex-1 flex items-center justify-center">
            {card.isJoker ? (
              <div className="text-center">
                <div className="text-lg font-retro-heading font-bold">
                  {card.jokerType === 'big' ? 'KING' : 'JOKER'}
                </div>
                <div className="text-sm mt-1 font-retro-mono">
                  {card.jokerType === 'big' ? '🤡' : '🎭'}
                </div>
                <div className="text-[10px] mt-1 font-retro-mono text-retro-primary-400/70">
                  {card.jokerType === 'big' ? 'BIG' : 'SMALL'}
                </div>
              </div>
            ) : (
              <div className={cn(
                'text-4xl',
                (card.suit === 'heart' || card.suit === 'diamond') ? 'text-card-red' : 'text-card-black'
              )}>
                {getSuitSymbol(card.suit)}
              </div>
            )}
          </div>

          {/* 右下角点数（旋转180度） */}
          <div className="flex justify-between items-end flex-row-reverse">
            <span className="font-retro-heading font-bold leading-none transform rotate-180">
              {card.rank}
            </span>
            {card.suit !== 'joker' && (
              <span className="text-xs transform rotate-180">
                {getSuitSymbol(card.suit)}
              </span>
            )}
          </div>

          {/* 卡牌底部装饰 */}
          <div className="absolute bottom-1 left-1 right-1 h-1 bg-gradient-to-r from-transparent via-current/30 to-transparent rounded-full" />

          {/* CRT扫描线效果 */}
          {crt && (
            <div className="absolute inset-0 crt-scanlines pointer-events-none rounded-lg" />
          )}
        </div>
      )}

      {/* 选中状态指示器 */}
      {selected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-retro-primary-500 rounded-full animate-ping" />
      )}

      {/* 可打出状态指示器 */}
      {playable && !selected && (
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-game-success rounded-full animate-pulse" />
      )}
    </div>
  )
}
