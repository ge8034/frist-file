/**
 * AI 玩家展示组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { AIPlayer as AIEntity } from '@/lib/features/game/ai/AIPlayer'
import { Card } from '@/lib/domain/entities/Card'
import { PlayerArea } from './PlayerArea'

interface AIPlayerProps {
  /** AI玩家实体数据 */
  aiPlayer: AIEntity
  /** 手牌列表 */
  handCards?: Card[]
  /** 是否当前回合 */
  isCurrentTurn?: boolean
  /** 是否胜利者 */
  isWinner?: boolean
  /** 玩家状态：thinking, waiting, disconnected, ready */
  status?: 'thinking' | 'waiting' | 'disconnected' | 'ready'
  /** 思考时间（秒） */
  thinkTime?: number
  /** 位置：top, bottom, left, right */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** 是否显示手牌预览 */
  showHandPreview?: boolean
  /** 点击回调 */
  onClick?: () => void
  /** CRT边框效果 */
  crt?: boolean
  /** 霓辉光效果 */
  glow?: boolean
}

export default function AIPlayer({
  aiPlayer,
  handCards = [],
  isCurrentTurn = false,
  isWinner = false,
  status = 'waiting',
  thinkTime,
  position = 'bottom',
  showHandPreview = false,
  onClick,
  crt = true,
  glow = false,
}: AIPlayerProps) {
  // 获取AI策略类型 - 从config中获取
  const aiStrategy = aiPlayer?.getConfig ? aiPlayer.getConfig().strategy : 'random'

  // 获取名称
  const name = aiPlayer?.nickname || 'AI玩家'

  // 获取手牌数量
  const handCount = aiPlayer?.handCount || handCards.length

  // 分数 - AI玩家暂时没有得分，使用0
  const score = 0

  // 生成手牌预览内容
  const handPreview = showHandPreview ? (
    <div className="flex gap-1">
      {handCards.slice(0, 5).map((card, index) => (
        <div
          key={index}
          className="w-6 h-8 rounded bg-gradient-to-br from-purple-800 to-purple-900 border border-purple-700 flex items-center justify-center"
        >
          <span className="text-xs text-purple-200">
            {card.isJoker ? (card.jokerType === 'big' ? '王' : '小') : card.rank}
          </span>
        </div>
      ))}
      {handCards.length > 5 && (
        <div className="w-6 h-8 rounded bg-gradient-to-br from-purple-900 to-purple-950 border border-purple-800 flex items-center justify-center">
          <span className="text-xs text-purple-500">+{handCards.length - 5}</span>
        </div>
      )}
    </div>
  ) : undefined

  return (
    <PlayerArea
      name={name}
      type="ai"
      aiStrategy={aiStrategy}
      handCount={handCount}
      score={score}
      isCurrentTurn={isCurrentTurn}
      isWinner={isWinner}
      status={status}
      thinkTime={thinkTime}
      position={position}
      showHandPreview={showHandPreview}
      handPreview={handPreview}
      onClick={onClick}
      crt={crt}
      glow={glow}
    />
  )
}