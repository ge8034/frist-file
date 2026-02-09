/**
 * 加入房间模态框组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState } from 'react'
import { X, Lock, Eye, EyeOff, Users, Gamepad2, User } from 'lucide-react'
import { useLobbyStore, type GameRoom } from '@/lib/store/lobbyStore'

interface JoinRoomModalProps {
  isOpen: boolean
  onClose: () => void
  room: GameRoom
  onJoin: (password?: string) => Promise<void>
}

export default function JoinRoomModal({ isOpen, onClose, room, onJoin }: JoinRoomModalProps) {
  const { isJoining, error, clearError } = useLobbyStore()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    await onJoin(password)
  }

  const handleClose = () => {
    clearError()
    setPassword('')
    onClose()
  }

  // 游戏模式信息
  const getGameModeInfo = () => {
    switch (room.gameMode) {
      case 'ranked':
        return { color: 'from-yellow-500 to-orange-500', label: '排位赛' }
      case 'tournament':
        return { color: 'from-green-500 to-emerald-500', label: '锦标赛' }
      default:
        return { color: 'from-blue-500 to-cyan-500', label: '休闲模式' }
    }
  }

  const gameModeInfo = getGameModeInfo()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 模态框内容 */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* 霓虹光晕效果 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30"></div>

          <div className="relative bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* 头部 */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">加入私密房间</h2>
                    <p className="text-gray-400 text-sm">请输入密码以加入房间</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 房间信息 */}
            <div className="p-6 border-b border-gray-800">
              <div className="space-y-4">
                {/* 房间名称 */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{room.name}</h3>
                  <p className="text-gray-400 text-sm">{room.description}</p>
                </div>

                {/* 房间详情 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">房主</p>
                      <p className="text-sm text-gray-300">{room.hostName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">玩家</p>
                      <p className="text-sm text-gray-300">
                        {room.currentPlayers}/{room.maxPlayers}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">模式</p>
                      <p className="text-sm text-gray-300">{gameModeInfo.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gameModeInfo.color}`}></div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">状态</p>
                      <p className="text-sm text-gray-300">
                        {room.status === 'waiting' ? '等待中' : '游戏中'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mx-6 mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* 密码表单 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  房间密码
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入房间密码"
                    className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  请向房主获取正确的房间密码
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 border border-gray-700 rounded-lg transition-all duration-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>加入中...</span>
                    </>
                  ) : (
                    <>
                      <span>加入房间</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}