/**
 * 房间卡片组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Lock,
  Gamepad2,
  Trophy,
  Clock,
  ChevronRight,
  User,
  Sparkles,
  Shield
} from 'lucide-react'
import { useLobbyStore, type GameRoom } from '@/lib/store/lobbyStore'
import JoinRoomModal from './JoinRoomModal'

interface RoomCardProps {
  room: GameRoom
}

export default function RoomCard({ room }: RoomCardProps) {
  const router = useRouter()
  const { joinRoom, isJoining } = useLobbyStore()
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleJoinClick = () => {
    if (room.isPrivate) {
      setShowJoinModal(true)
    } else {
      handleJoinRoom()
    }
  }

  const handleJoinRoom = async (password?: string) => {
    const success = await joinRoom(room.id, password)
    if (success) {
      router.push(`/rooms/${room.id}`)
    }
  }

  // 游戏模式图标和颜色
  const getGameModeInfo = () => {
    switch (room.gameMode) {
      case 'ranked':
        return {
          icon: <Trophy className="w-4 h-4" />,
          color: 'from-yellow-500 to-orange-500',
          textColor: 'text-yellow-400',
          label: '排位赛',
        }
      case 'tournament':
        return {
          icon: <Shield className="w-4 h-4" />,
          color: 'from-green-500 to-emerald-500',
          textColor: 'text-green-400',
          label: '锦标赛',
        }
      default:
        return {
          icon: <Gamepad2 className="w-4 h-4" />,
          color: 'from-blue-500 to-cyan-500',
          textColor: 'text-blue-400',
          label: '休闲',
        }
    }
  }

  const gameModeInfo = getGameModeInfo()

  // 玩家进度条
  const playerProgress = (room.currentPlayers / room.maxPlayers) * 100

  return (
    <>
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 霓虹光晕效果 */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${gameModeInfo.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000`}></div>

        <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all duration-300">
          {/* 房间头部 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-white truncate">{room.name}</h3>
                {room.isPrivate && (
                  <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{room.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${gameModeInfo.color} bg-opacity-20`}>
                <div className="flex items-center gap-1">
                  {gameModeInfo.icon}
                  <span className={`text-xs font-medium ${gameModeInfo.textColor}`}>
                    {gameModeInfo.label}
                  </span>
                </div>
              </div>
              {room.aiPlayers > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded-lg">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-gray-400">{room.aiPlayers} AI</span>
                </div>
              )}
            </div>
          </div>

          {/* 房间信息 */}
          <div className="space-y-4">
            {/* 房主信息 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">房主</p>
                <p className="text-sm text-gray-300">{room.hostName}</p>
              </div>
              <div className="ml-auto flex items-center gap-2 text-gray-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  {Math.floor((Date.now() - room.createdAt.getTime()) / 60000)}分钟前
                </span>
              </div>
            </div>

            {/* 玩家进度条 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {room.currentPlayers}/{room.maxPlayers} 玩家
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {room.status === 'playing' ? '游戏中' : '等待中'}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gameModeInfo.color} transition-all duration-500`}
                  style={{ width: `${playerProgress}%` }}
                />
              </div>
            </div>

            {/* 加入按钮 */}
            <button
              onClick={handleJoinClick}
              disabled={isJoining || room.status !== 'waiting' || room.currentPlayers >= room.maxPlayers}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {isJoining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>加入中...</span>
                </>
              ) : (
                <>
                  <span>
                    {room.status !== 'waiting'
                      ? '游戏中'
                      : room.currentPlayers >= room.maxPlayers
                      ? '已满'
                      : '加入房间'}
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* 悬停效果 */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-500/10 rounded-xl pointer-events-none"></div>
          )}
        </div>
      </div>

      {/* 加入房间模态框 */}
      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        room={room}
        onJoin={handleJoinRoom}
      />
    </>
  )
}