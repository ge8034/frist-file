/**
 * 游戏控制组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import {
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  Settings,
  Volume2,
  VolumeX,
  Zap,
  Trophy,
  Clock,
  Users,
  Flag
} from 'lucide-react'
import { useState } from 'react'

interface GameControlsProps {
  roomId: string
  gameStatus: 'waiting' | 'playing' | 'paused' | 'finished'
  currentRound: number
  totalRounds: number
  onGameAction: (action: 'pause' | 'resume' | 'restart' | 'next') => void
  isHost: boolean
}

export default function GameControls({
  roomId,
  gameStatus,
  currentRound,
  totalRounds,
  onGameAction,
  isHost
}: GameControlsProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [gameSpeed, setGameSpeed] = useState<'normal' | 'fast' | 'slow'>('normal')

  // 游戏状态标签
  const getStatusLabel = () => {
    switch (gameStatus) {
      case 'playing': return '游戏中'
      case 'paused': return '已暂停'
      case 'finished': return '已结束'
      default: return '等待中'
    }
  }

  // 游戏状态颜色
  const getStatusColor = () => {
    switch (gameStatus) {
      case 'playing': return 'bg-green-900/30 text-green-300 border-green-700'
      case 'paused': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700'
      case 'finished': return 'bg-purple-900/30 text-purple-300 border-purple-700'
      default: return 'bg-gray-800 text-gray-300 border-gray-700'
    }
  }

  return (
    <div className="relative">
      {/* 霓虹光晕效果 */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-cyan-600 rounded-2xl blur opacity-20"></div>

      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">游戏控制</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
                  {getStatusLabel()}
                </span>
                {isHost && (
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded-full">
                    房主
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-green-500 transition-all duration-300"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 游戏进度 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">游戏进度</span>
            </div>
            <span className="text-sm text-gray-400">
              第 {currentRound} / {totalRounds} 轮
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${(currentRound / totalRounds) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">开始</span>
            <span className="text-xs text-gray-500">结束</span>
          </div>
        </div>

        {/* 主要控制按钮 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => onGameAction(gameStatus === 'playing' ? 'pause' : 'resume')}
            disabled={!isHost && gameStatus === 'finished'}
            className={`p-4 rounded-lg border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
              gameStatus === 'playing'
                ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700 hover:bg-yellow-800/30'
                : gameStatus === 'paused'
                ? 'bg-green-900/30 text-green-300 border-green-700 hover:bg-green-800/30'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
            } ${(!isHost && gameStatus !== 'playing' && gameStatus !== 'paused') ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {gameStatus === 'playing' ? (
              <>
                <Pause className="w-6 h-6" />
                <span className="text-sm font-medium">暂停</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span className="text-sm font-medium">继续</span>
              </>
            )}
          </button>

          <button
            onClick={() => onGameAction('restart')}
            disabled={!isHost || gameStatus === 'waiting'}
            className={`p-4 rounded-lg border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
              isHost && gameStatus !== 'waiting'
                ? 'bg-blue-900/30 text-blue-300 border-blue-700 hover:bg-blue-800/30'
                : 'bg-gray-800 text-gray-300 border-gray-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-6 h-6" />
            <span className="text-sm font-medium">重开</span>
          </button>

          <button
            onClick={() => onGameAction('next')}
            disabled={!isHost || currentRound >= totalRounds || gameStatus !== 'playing'}
            className={`p-4 rounded-lg border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
              isHost && currentRound < totalRounds && gameStatus === 'playing'
                ? 'bg-purple-900/30 text-purple-300 border-purple-700 hover:bg-purple-800/30'
                : 'bg-gray-800 text-gray-300 border-gray-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <SkipForward className="w-6 h-6" />
            <span className="text-sm font-medium">下一轮</span>
          </button>

          <button
            onClick={() => {/* 打开设置 */}}
            className="p-4 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2"
          >
            <Settings className="w-6 h-6" />
            <span className="text-sm font-medium">设置</span>
          </button>
        </div>

        {/* 游戏速度控制 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">游戏速度</span>
            </div>
            <span className="text-xs text-gray-500">
              {gameSpeed === 'slow' ? '慢速' : gameSpeed === 'fast' ? '快速' : '正常'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGameSpeed('slow')}
              className={`flex-1 py-2 rounded-lg border transition-all duration-300 text-sm ${
                gameSpeed === 'slow'
                  ? 'bg-blue-900/30 text-blue-300 border-blue-700'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
              }`}
            >
              慢速
            </button>
            <button
              onClick={() => setGameSpeed('normal')}
              className={`flex-1 py-2 rounded-lg border transition-all duration-300 text-sm ${
                gameSpeed === 'normal'
                  ? 'bg-green-900/30 text-green-300 border-green-700'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
              }`}
            >
              正常
            </button>
            <button
              onClick={() => setGameSpeed('fast')}
              className={`flex-1 py-2 rounded-lg border transition-all duration-300 text-sm ${
                gameSpeed === 'fast'
                  ? 'bg-red-900/30 text-red-300 border-red-700'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
              }`}
            >
              快速
            </button>
          </div>
        </div>

        {/* 游戏信息 */}
        <div className="pt-6 border-t border-gray-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">玩家数量</span>
              </div>
              <span className="text-white text-sm">4/4</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">当前回合</span>
              </div>
              <span className="text-white text-sm">3</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">回合时间</span>
              </div>
              <span className="text-white text-sm">01:23</span>
            </div>
          </div>
        </div>

        {/* 操作提示 */}
        <div className="mt-6 p-3 bg-gray-800/30 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            {isHost
              ? '作为房主，您可以控制游戏进度和设置'
              : '只有房主可以控制游戏进度'}
          </p>
        </div>
      </div>
    </div>
  )
}