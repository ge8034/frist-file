/**
 * 房间详情页面
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Users,
  Gamepad2,
  Trophy,
  Shield,
  Clock,
  User,
  Check,
  X,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  Zap,
  Crown,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useLobbyStore, subscribeToRoomChanges, subscribeToRoomPlayers } from '@/lib/store/lobbyStore'
import { useAuthStore, getCurrentUserId } from '@/lib/store/authStore'
import ChatPanel from '@/components/lobby/ChatPanel'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const {
    currentRoom,
    roomPlayers,
    isLoading,
    error,
    fetchRooms,
    leaveRoom,
    updatePlayerReady,
    updateRoomStatus,
    clearError
  } = useLobbyStore()

  const { user } = useAuthStore()
  const currentUserId = getCurrentUserId()

  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // 初始加载和订阅
  useEffect(() => {
    if (!currentRoom || currentRoom.id !== roomId) {
      fetchRooms()
    }

    // 订阅房间变化
    const unsubscribeRoom = subscribeToRoomChanges(roomId, (room) => {
      // 更新房间状态
      if (room.status === 'playing') {
        // 房间开始游戏，跳转到游戏页面
        router.push(`/game/${roomId}`)
      }
    })

    // 订阅玩家变化
    const unsubscribePlayers = subscribeToRoomPlayers(roomId, (players) => {
      // 玩家列表更新处理
    })

    return () => {
      unsubscribeRoom()
      unsubscribePlayers()
    }
  }, [roomId, currentRoom, fetchRooms, router])

  // 检查是否在房间中
  useEffect(() => {
    if (!isLoading && (!currentRoom || currentRoom.id !== roomId)) {
      router.push('/rooms/lobby')
    }
  }, [currentRoom, roomId, isLoading, router])

  const handleReadyToggle = () => {
    const currentPlayer = roomPlayers.find(p => p.id === currentUserId)
    if (currentPlayer) {
      updatePlayerReady(currentUserId, !currentPlayer.isReady)
    }
  }

  const handleStartGame = async () => {
    if (!currentRoom) return

    // 检查所有玩家是否准备就绪
    const allReady = roomPlayers.every(player => player.isReady)
    if (!allReady) {
      alert('请等待所有玩家准备就绪')
      return
    }

    // 检查玩家数量
    if (roomPlayers.length < 2) {
      alert('至少需要2名玩家才能开始游戏')
      return
    }

    // 更新房间状态为游戏中
    await updateRoomStatus(currentRoom.id, 'playing')
    router.push(`/game/${currentRoom.id}`)
  }

  const handleLeaveRoom = async () => {
    await leaveRoom()
    router.push('/rooms/lobby')
  }

  const isHost = roomPlayers.find(p => p.id === currentUserId)?.isHost || false

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">加载房间信息中...</p>
        </div>
      </div>
    )
  }

  if (!currentRoom || currentRoom.id !== roomId) {
    return null
  }

  // 游戏模式信息
  const getGameModeInfo = () => {
    switch (currentRoom.gameMode) {
      case 'ranked':
        return {
          icon: <Trophy className="w-5 h-5" />,
          color: 'from-yellow-500 to-orange-500',
          label: '排位赛',
        }
      case 'tournament':
        return {
          icon: <Shield className="w-5 h-5" />,
          color: 'from-green-500 to-emerald-500',
          label: '锦标赛',
        }
      default:
        return {
          icon: <Gamepad2 className="w-5 h-5" />,
          color: 'from-blue-500 to-cyan-500',
          label: '休闲模式',
        }
    }
  }

  const gameModeInfo = getGameModeInfo()

  return (
    <div className="space-y-8">
      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 房间头部信息 */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${gameModeInfo.color} rounded-lg flex items-center justify-center`}>
                  {gameModeInfo.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{currentRoom.name}</h1>
                  <p className="text-gray-400">{currentRoom.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">房主：{currentRoom.hostName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">
                    {currentRoom.currentPlayers}/{currentRoom.maxPlayers} 玩家
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">
                    创建于 {currentRoom.createdAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {currentRoom.aiPlayers > 0 && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300">{currentRoom.aiPlayers} AI 玩家</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 transition-all duration-300"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLeaveRoom}
                className="p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-lg hover:bg-red-800/30 hover:border-red-600 transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">离开房间</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 左侧：玩家列表 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 玩家区域 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              玩家列表 ({roomPlayers.length}/{currentRoom.maxPlayers})
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {roomPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`relative p-4 rounded-xl border transition-all duration-300 ${
                    player.id === currentUserId
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 bg-gray-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      {player.isHost && (
                        <div className="absolute -top-1 -right-1">
                          <Crown className="w-5 h-5 text-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{player.nickname}</span>
                        {player.isHost && (
                          <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-300 text-xs rounded-full">
                            房主
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className="text-sm text-gray-400">
                          {player.isReady ? '已准备' : '未准备'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">位置 {index + 1}</div>
                      {player.isReady ? (
                        <Check className="w-5 h-5 text-green-500 mt-1" />
                      ) : (
                        <X className="w-5 h-5 text-gray-500 mt-1" />
                      )}
                    </div>
                  </div>

                  {/* AI 玩家提示 */}
                  {player.id.startsWith('ai_') && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300">AI 玩家</span>
                        <span className="text-xs text-gray-500 ml-auto">自动补位</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 空位显示 */}
              {Array.from({ length: currentRoom.maxPlayers - roomPlayers.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="p-4 border border-dashed border-gray-700 rounded-xl bg-gray-900/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-500">等待玩家加入</div>
                      <div className="text-sm text-gray-600 mt-1">空位 {index + 1}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 游戏设置 */}
          {showSettings && isHost && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">房间设置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    游戏模式
                  </label>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-2 bg-gradient-to-r ${gameModeInfo.color} bg-opacity-20 rounded-lg`}>
                      <span className="text-white">{gameModeInfo.label}</span>
                    </div>
                    <span className="text-sm text-gray-500">创建后不可更改</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    AI 玩家设置
                  </label>
                  <div className="text-gray-400 text-sm">
                    {currentRoom.aiPlayers > 0
                      ? `空缺位置将由 ${currentRoom.aiPlayers} 个 AI 玩家自动补位`
                      : '不启用 AI 玩家'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：操作面板 */}
        <div className="space-y-6">
          {/* 准备/开始按钮 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">游戏控制</h3>

            <div className="space-y-4">
              {/* 准备按钮 */}
              <button
                onClick={handleReadyToggle}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  roomPlayers.find(p => p.id === currentUserId)?.isReady
                    ? 'bg-green-900/30 text-green-300 border border-green-700 hover:bg-green-800/30'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {roomPlayers.find(p => p.id === currentUserId)?.isReady ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>已准备</span>
                  </>
                ) : (
                  <>
                    <span>点击准备</span>
                  </>
                )}
              </button>

              {/* 开始游戏按钮（仅房主） */}
              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={roomPlayers.length < 2 || !roomPlayers.every(p => p.isReady)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>开始游戏</span>
                </button>
              )}

              {/* 准备状态提示 */}
              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">准备状态</span>
                  <span className="text-white">
                    {roomPlayers.filter(p => p.isReady).length}/{roomPlayers.length}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{
                      width: `${(roomPlayers.filter(p => p.isReady).length / roomPlayers.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 房间信息 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">房间信息</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">房间ID</span>
                <span className="text-white font-mono text-sm">{currentRoom.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">游戏模式</span>
                <span className="text-white text-sm">{gameModeInfo.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">最大玩家</span>
                <span className="text-white text-sm">{currentRoom.maxPlayers} 人</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">AI 玩家</span>
                <span className="text-white text-sm">{currentRoom.aiPlayers} 个</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">房间状态</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  currentRoom.status === 'waiting'
                    ? 'bg-green-900/30 text-green-300'
                    : 'bg-yellow-900/30 text-yellow-300'
                }`}>
                  {currentRoom.status === 'waiting' ? '等待中' : '游戏中'}
                </span>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">快速操作</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm"
              >
                复制房间链接
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(currentRoom.id)}
                className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm"
              >
                复制房间ID
              </button>
              {currentRoom.isPrivate && (
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">房间密码</div>
                  <div className="font-mono text-white text-sm">******</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 聊天面板 */}
      <ChatPanel roomId={roomId} />
    </div>
  )
}