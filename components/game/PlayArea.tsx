/**
 * 出牌区域组件
 * 显示当前回合的出牌
 */

'use client'

import { useState, useEffect } from 'react'
import Card from './Card'

interface PlayAreaProps {
  /** 当前出牌的卡牌 */
  cards?: Array<{
    id: string
    rank: string
    suit: string
    value: number
  }>
  /** 出牌玩家 */
  playerName?: string
  /** 牌型描述 */
  patternDescription?: string
  /** 是否是当前回合 */
  isCurrentTurn?: boolean
  /** 自动清除时间（秒） */
  autoClearTime?: number
}

export default function PlayArea({
  cards = [],
  playerName = '玩家',
  patternDescription = '未出牌',
  isCurrentTurn = false,
  autoClearTime = 10
}: PlayAreaProps) {
  const [timeLeft, setTimeLeft] = useState(autoClearTime)
  const [isClearing, setIsClearing] = useState(false)

  // 自动清除计时器
  useEffect(() => {
    if (!isCurrentTurn || cards.length === 0 || autoClearTime <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsClearing(true)
          setTimeout(() => {
            // 这里应该触发清除出牌的回调
            setIsClearing(false)
            setTimeLeft(autoClearTime)
          }, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isCurrentTurn, cards.length, autoClearTime])

  // 重置时间
  useEffect(() => {
    if (cards.length > 0) {
      setTimeLeft(autoClearTime)
      setIsClearing(false)
    }
  }, [cards, autoClearTime])

  if (cards.length === 0) {
    return (
      <div className="relative w-full">
        {/* 空状态 */}
        <div className="min-h-[180px] flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-gray-900/30 to-gray-950/50 border-2 border-dashed border-gray-700/50 p-6">
          <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30">
            <span className="text-2xl text-gray-500">🃏</span>
          </div>
          <h3 className="text-lg font-retro-heading text-gray-400 mb-2">等待出牌</h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            当前没有出牌，等待玩家出牌或开始新的回合
          </p>
        </div>

        {/* CRT边框效果 */}
        <div className="absolute inset-0 border border-gray-800/30 rounded-xl pointer-events-none"></div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div className={`min-h-[180px] rounded-xl p-4 transition-all duration-500 ${isClearing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {/* 出牌信息头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center border border-purple-500/30">
              <span className="text-lg">🎴</span>
            </div>
            <div>
              <h3 className="font-retro-heading text-white flex items-center gap-2">
                {playerName} 的出牌
                {isCurrentTurn && (
                  <span className="px-2 py-0.5 text-xs bg-green-900/30 text-green-300 rounded-full border border-green-700/50 animate-pulse">
                    当前回合
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-400">{patternDescription}</p>
            </div>
          </div>

          {/* 自动清除计时器 */}
          {isCurrentTurn && autoClearTime > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">自动清除</div>
              <div className="px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="font-retro-digital text-cyan-400">{timeLeft}s</span>
              </div>
            </div>
          )}
        </div>

        {/* 出牌显示区域 */}
        <div className="relative">
          {/* 卡牌容器 */}
          <div className="flex flex-wrap gap-3 justify-center items-center min-h-[100px] p-4 rounded-lg bg-gradient-to-br from-gray-900/40 to-gray-950/60 border border-gray-700/30">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="transform transition-all duration-300 hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <Card
                  suit={card.suit as any}
                  rank={card.rank as any}
                  value={card.value}
                  size="md"
                  isPlayable={false}
                />
              </div>
            ))}
          </div>

          {/* 牌型分析 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <div className="px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
              <span className="text-xs text-gray-400">卡牌数量: </span>
              <span className="text-sm font-bold text-white ml-1">{cards.length}</span>
            </div>
            <div className="px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
              <span className="text-xs text-gray-400">牌型强度: </span>
              <span className="text-sm font-bold text-yellow-400 ml-1">
                {cards.length <= 2 ? '低' : cards.length <= 4 ? '中' : '高'}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
              <span className="text-xs text-gray-400">可被压制: </span>
              <span className="text-sm font-bold text-green-400 ml-1">需要更强牌型</span>
            </div>
          </div>
        </div>

        {/* 出牌动画效果 */}
        {!isClearing && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Retro-Futurism 效果 */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 via-cyan-600/5 to-purple-600/10 rounded-xl blur opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 border border-gray-800/30 rounded-xl pointer-events-none crt-border"></div>

      {/* 清除动画 */}
      {isClearing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-ping"></div>
        </div>
      )}
    </div>
  )
}