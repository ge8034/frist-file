/**
 * 动作按钮组件
 * 游戏操作按钮集合
 */

'use client'

import { useState } from 'react'

interface ActionButtonsProps {
  /** 出牌回调 */
  onPlay?: (selectedCards: string[]) => void
  /** 过牌回调 */
  onPass?: () => void
  /** 提示回调 */
  onHint?: () => void
  /** 撤销回调 */
  onUndo?: () => void
  /** 设置回调 */
  onSettings?: () => void
  /** 退出回调 */
  onExit?: () => void
  /** 当前选中的卡牌ID */
  selectedCards?: string[]
  /** 是否是当前回合 */
  isCurrentTurn?: boolean
  /** 游戏状态 */
  gameStatus?: 'waiting' | 'playing' | 'paused' | 'finished'
  /** 是否显示AI提示 */
  showAIHint?: boolean
  /** AI提示文本 */
  aiHintText?: string
}

export default function ActionButtons({
  onPlay,
  onPass,
  onHint,
  onUndo,
  onSettings,
  onExit,
  selectedCards = [],
  isCurrentTurn = true,
  gameStatus = 'playing',
  showAIHint = false,
  aiHintText = '尝试出对子或顺子'
}: ActionButtonsProps) {
  const [isConfirmingExit, setIsConfirmingExit] = useState(false)
  const [showAdvancedActions, setShowAdvancedActions] = useState(false)

  // 处理出牌
  const handlePlay = () => {
    if (selectedCards.length === 0) {
      alert('请选择要出的牌！')
      return
    }
    if (onPlay) {
      onPlay(selectedCards)
    }
  }

  // 处理过牌
  const handlePass = () => {
    if (onPass) {
      onPass()
    }
  }

  // 处理提示
  const handleHint = () => {
    if (onHint) {
      onHint()
    }
  }

  // 处理退出
  const handleExit = () => {
    if (isConfirmingExit) {
      if (onExit) {
        onExit()
      }
      setIsConfirmingExit(false)
    } else {
      setIsConfirmingExit(true)
      setTimeout(() => setIsConfirmingExit(false), 3000)
    }
  }

  // 游戏状态文本
  const getStatusText = () => {
    switch (gameStatus) {
      case 'waiting': return '等待开始'
      case 'playing': return '游戏中'
      case 'paused': return '已暂停'
      case 'finished': return '已结束'
      default: return '未知'
    }
  }

  // 按钮是否禁用
  const isDisabled = !isCurrentTurn || gameStatus !== 'playing'

  return (
    <div className="relative w-full">
      {/* 主操作按钮区域 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* 出牌按钮 */}
        <button
          onClick={handlePlay}
          disabled={isDisabled || selectedCards.length === 0}
          className={`relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${
            isDisabled || selectedCards.length === 0
              ? 'bg-gray-800/50 border-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30 hover:from-green-600/30 hover:to-emerald-600/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/20'
          } border-2`}
        >
          <div className="text-2xl mb-2">🎴</div>
          <div className="font-retro-heading text-sm">出牌</div>
          {selectedCards.length > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-600 border border-purple-400 flex items-center justify-center">
              <span className="text-xs font-bold">{selectedCards.length}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </button>

        {/* 过牌按钮 */}
        <button
          onClick={handlePass}
          disabled={isDisabled}
          className={`relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${
            isDisabled
              ? 'bg-gray-800/50 border-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border-yellow-500/30 hover:from-yellow-600/30 hover:to-amber-600/30 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/20'
          } border-2`}
        >
          <div className="text-2xl mb-2">⏭️</div>
          <div className="font-retro-heading text-sm">过牌</div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </button>

        {/* 提示按钮 */}
        <button
          onClick={handleHint}
          disabled={isDisabled}
          className={`relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${
            isDisabled
              ? 'bg-gray-800/50 border-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:from-blue-600/30 hover:to-cyan-600/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20'
          } border-2`}
        >
          <div className="text-2xl mb-2">💡</div>
          <div className="font-retro-heading text-sm">提示</div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </button>

        {/* 撤销按钮 */}
        <button
          onClick={onUndo}
          disabled={isDisabled}
          className={`relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${
            isDisabled
              ? 'bg-gray-800/50 border-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20'
          } border-2`}
        >
          <div className="text-2xl mb-2">↩️</div>
          <div className="font-retro-heading text-sm">撤销</div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </button>
      </div>

      {/* 辅助操作区域 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* 游戏状态显示 */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                gameStatus === 'playing' ? 'bg-green-500 animate-pulse' :
                gameStatus === 'paused' ? 'bg-yellow-500' :
                gameStatus === 'finished' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-sm text-gray-300">{getStatusText()}</span>
            </div>
          </div>

          {/* 回合状态 */}
          {isCurrentTurn ? (
            <div className="px-3 py-1.5 bg-green-900/30 rounded-lg border border-green-700/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
                <span className="text-sm text-green-300">你的回合</span>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="text-sm text-gray-400">等待其他玩家</span>
              </div>
            </div>
          )}
        </div>

        {/* 高级操作切换 */}
        <button
          onClick={() => setShowAdvancedActions(!showAdvancedActions)}
          className="px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-2"
        >
          <span className="text-sm text-gray-300">高级操作</span>
          <span className={`transform transition-transform duration-300 ${showAdvancedActions ? 'rotate-180' : ''}`}>▼</span>
        </button>
      </div>

      {/* 高级操作区域 */}
      {showAdvancedActions && (
        <div className="mb-6 p-4 bg-gray-900/30 rounded-xl border border-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* 设置按钮 */}
            <button
              onClick={onSettings}
              className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors duration-200"
            >
              <div className="text-xl">⚙️</div>
              <div>
                <div className="font-retro-heading text-sm">设置</div>
                <div className="text-xs text-gray-500">游戏参数</div>
              </div>
            </button>

            {/* 退出按钮 */}
            <button
              onClick={handleExit}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors duration-200 ${
                isConfirmingExit
                  ? 'bg-red-900/30 border-red-700/50 hover:bg-red-800/30'
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
              }`}
            >
              <div className="text-xl">{isConfirmingExit ? '⚠️' : '🚪'}</div>
              <div>
                <div className="font-retro-heading text-sm">
                  {isConfirmingExit ? '确认退出?' : '退出游戏'}
                </div>
                <div className="text-xs text-gray-500">
                  {isConfirmingExit ? '3秒后取消' : '离开房间'}
                </div>
              </div>
            </button>

            {/* 快速操作 */}
            <button
              onClick={() => alert('快速操作功能开发中')}
              className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors duration-200"
            >
              <div className="text-xl">⚡</div>
              <div>
                <div className="font-retro-heading text-sm">快速操作</div>
                <div className="text-xs text-gray-500">快捷键</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* AI提示区域 */}
      {showAIHint && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-700/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center border border-blue-500/30">
              <span className="text-xl">🤖</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-retro-heading text-sm text-blue-300">AI 提示</span>
                <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded-full">智能分析</span>
              </div>
              <p className="text-sm text-gray-300">{aiHintText}</p>
            </div>
            <button
              onClick={() => alert('更多AI分析')}
              className="px-3 py-1 text-xs bg-blue-800/30 text-blue-300 rounded-lg border border-blue-700/50 hover:bg-blue-700/30 transition-colors duration-200"
            >
              详情
            </button>
          </div>
        </div>
      )}

      {/* 键盘快捷键提示 */}
      <div className="p-3 bg-gray-900/20 rounded-lg border border-gray-800/30">
        <div className="text-xs text-gray-500 mb-2">键盘快捷键</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700">Space</kbd>
            <span className="text-xs text-gray-400">出牌</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700">P</kbd>
            <span className="text-xs text-gray-400">过牌</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700">H</kbd>
            <span className="text-xs text-gray-400">提示</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700">Z</kbd>
            <span className="text-xs text-gray-400">撤销</span>
          </div>
        </div>
      </div>

      {/* Retro-Futurism 效果 */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/5 via-cyan-600/3 to-purple-600/5 rounded-xl blur opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 border border-gray-800/20 rounded-xl pointer-events-none"></div>
    </div>
  )
}