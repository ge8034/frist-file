/**
 * 卡牌组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState } from 'react'

interface CardProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
  value: number
  isSelected?: boolean
  isPlayable?: boolean
  isFacedown?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export default function Card({
  suit,
  rank,
  value,
  isSelected = false,
  isPlayable = true,
  isFacedown = false,
  onClick,
  size = 'md'
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // 花色图标和颜色
  const suitConfig = {
    hearts: { icon: '♥', color: 'text-red-500', bgColor: 'bg-red-950/20', borderColor: 'border-red-700' },
    diamonds: { icon: '♦', color: 'text-red-400', bgColor: 'bg-red-900/20', borderColor: 'border-red-600' },
    clubs: { icon: '♣', color: 'text-gray-300', bgColor: 'bg-gray-900/20', borderColor: 'border-gray-700' },
    spades: { icon: '♠', color: 'text-gray-400', bgColor: 'bg-gray-950/20', borderColor: 'border-gray-800' }
  }

  // 大小配置
  const sizeConfig = {
    sm: { width: 'w-12', height: 'h-16', text: 'text-sm', icon: 'text-lg' },
    md: { width: 'w-16', height: 'h-24', text: 'text-base', icon: 'text-xl' },
    lg: { width: 'w-20', height: 'h-32', text: 'text-lg', icon: 'text-2xl' }
  }

  const config = suitConfig[suit]
  const sizeStyle = sizeConfig[size]

  // 牌面颜色（红心/方片为红色，梅花/黑桃为黑色）
  const isRed = suit === 'hearts' || suit === 'diamonds'

  // 卡牌数值显示
  const rankDisplay = rank === '10' ? '10' : rank

  // 悬停和选中效果
  const hoverEffect = isPlayable ? 'hover:-translate-y-2 hover:shadow-xl' : ''
  const selectedEffect = isSelected ? 'translate-y-4 shadow-2xl' : ''
  const playableEffect = isPlayable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'

  // 点击处理
  const handleClick = () => {
    if (isPlayable && onClick) {
      onClick()
    }
  }

  if (isFacedown) {
    // 背面朝上的卡牌
    return (
      <div
        className={`relative ${sizeStyle.width} ${sizeStyle.height} rounded-lg transition-all duration-300 ${hoverEffect} ${selectedEffect} ${playableEffect}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* 背面霓虹效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 rounded-lg"></div>

        {/* 背面图案 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-md rotate-45 opacity-60"></div>
        </div>

        {/* 边框 */}
        <div className="absolute inset-0 border-2 border-gray-700 rounded-lg"></div>

        {/* 悬停光晕 */}
        {isHovered && isPlayable && (
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur opacity-50"></div>
        )}

        {/* 选中指示器 */}
        {isSelected && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative ${sizeStyle.width} ${sizeStyle.height} rounded-lg transition-all duration-300 ${hoverEffect} ${selectedEffect} ${playableEffect}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* 卡牌背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg ${config.bgColor}`}></div>

      {/* 霓虹光晕效果 */}
      {isHovered && isPlayable && (
        <div className={`absolute -inset-2 bg-gradient-to-r ${isRed ? 'from-red-500/20 to-pink-500/20' : 'from-cyan-500/20 to-purple-500/20'} rounded-xl blur opacity-50`}></div>
      )}

      {/* 卡牌边框 */}
      <div className={`absolute inset-0 border-2 rounded-lg ${isSelected ? 'border-green-500' : config.borderColor} ${isHovered && isPlayable ? 'border-opacity-80' : 'border-opacity-50'}`}></div>

      {/* 左上角数值和花色 */}
      <div className="absolute top-2 left-2 flex flex-col items-center">
        <div className={`${sizeStyle.text} font-bold ${config.color}`}>
          {rankDisplay}
        </div>
        <div className={`${sizeStyle.icon} ${config.color}`}>
          {config.icon}
        </div>
      </div>

      {/* 中间大花色 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`${sizeStyle.icon} font-bold ${config.color} opacity-70`}>
          {config.icon}
        </div>
      </div>

      {/* 右下角数值和花色（旋转） */}
      <div className="absolute bottom-2 right-2 flex flex-col items-center rotate-180">
        <div className={`${sizeStyle.text} font-bold ${config.color}`}>
          {rankDisplay}
        </div>
        <div className={`${sizeStyle.icon} ${config.color}`}>
          {config.icon}
        </div>
      </div>

      {/* 卡牌数值指示器（小圆点） */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-500 font-mono">
            {value}
          </div>
          <div className="text-[8px] text-gray-600">
            点数
          </div>
        </div>
      </div>

      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
      )}

      {/* 不可用遮罩 */}
      {!isPlayable && (
        <div className="absolute inset-0 bg-gray-900/70 rounded-lg flex items-center justify-center">
          <div className="text-xs text-gray-500 rotate-45">不可用</div>
        </div>
      )}

      {/* 像素艺术装饰 */}
      <div className="absolute top-1 left-1 w-1 h-1 bg-gray-700 rounded-full"></div>
      <div className="absolute top-1 right-1 w-1 h-1 bg-gray-700 rounded-full"></div>
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-gray-700 rounded-full"></div>
      <div className="absolute bottom-1 right-1 w-1 h-1 bg-gray-700 rounded-full"></div>
    </div>
  )
}