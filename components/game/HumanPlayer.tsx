/**
 * 人类玩家展示组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { Player } from '@/lib/domain/entities/Player'
import { Card } from '@/lib/domain/entities/Card'
import { PlayerArea } from './PlayerArea'

interface HumanPlayerProps {
  /** 玩家实体数据 */
  player: Player
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

export default function HumanPlayer({
  player,
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
}: HumanPlayerProps) {
  // 生成手牌预览内容
  const handPreview = showHandPreview ? (
    <div className="flex gap-1">
      {handCards.slice(0, 5).map((card, index) => (
        <div
          key={index}
          className="w-6 h-8 rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center"
        >
          <span className="text-xs">
            {card.isJoker ? (card.jokerType === 'big' ? '王' : '小') : card.rank}
          </span>
        </div>
      ))}
      {handCards.length > 5 && (
        <div className="w-6 h-8 rounded bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 flex items-center justify-center">
          <span className="text-xs text-gray-500">+{handCards.length - 5}</span>
        </div>
      )}
    </div>
  ) : undefined

  return (
    <PlayerArea
      name={player.nickname}
      type="human"
      handCount={handCards.length}
      score={player.score}
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