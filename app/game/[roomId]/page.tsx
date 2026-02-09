/**
 * 游戏房间页面
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Users,
  Gamepad2,
  Trophy,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  LogOut,
  ChevronLeft,
  Zap,
  Crown,
  User,
  MessageSquare,
  BarChart3,
  Eye,
  EyeOff,
  SkipForward,
  Pause,
  Play,
  RefreshCw
} from 'lucide-react'
import { useLobbyStore, subscribeToRoomChanges } from '@/lib/store/lobbyStore'
import { useAuthStore, getCurrentUserId } from '@/lib/store/authStore'
import GameCanvas from '@/components/game/GameCanvas'
import GameChatPanel from '@/components/game/GameChatPanel'
import GameControls from '@/components/game/GameControls'
import { GameErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Loading } from '@/components/ui/Loading'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const {
    currentRoom,
    roomPlayers,
    isLoading,
    error,
    leaveRoom,
    clearError
  } = useLobbyStore()

  const { user } = useAuthStore()
  const currentUserId = getCurrentUserId()

  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'paused' | 'finished'>('playing')
  const [showSpectatorMode, setShowSpectatorMode] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(4)

  // 订阅房间变化
  useEffect(() => {
    const unsubscribeRoom = subscribeToRoomChanges(roomId, (room) => {
      if (room.status === 'waiting' || room.status === 'closed') {
        // 房间结束游戏，返回大厅
        router.push('/rooms/lobby')
      }
    })

    return () => {
      unsubscribeRoom()
    }
  }, [roomId, router])

  // 检查是否在房间中
  useEffect(() => {
    if (!isLoading && (!currentRoom || currentRoom.id !== roomId)) {
      router.push('/rooms/lobby')
    }
  }, [currentRoom, roomId, isLoading, router])

  const handleLeaveGame = async () => {
    await leaveRoom()
    router.push('/rooms/lobby')
  }

  const handleToggleSpectator = () => {
    setShowSpectatorMode(!showSpectatorMode)
  }

  const handleGameAction = (action: 'pause' | 'resume' | 'restart' | 'next') => {
    switch (action) {
      case 'pause':
        setGameStatus('paused')
        break
      case 'resume':
        setGameStatus('playing')
        break
      case 'restart':
        setCurrentRound(1)
        setGameStatus('playing')
        break
      case 'next':
        if (currentRound < totalRounds) {
          setCurrentRound(currentRound + 1)
        }
        break
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-background crt-scanlines">
        <div className="text-center space-y-6">
          <Loading
            variant="scanline"
            size="xl"
            showText
            text="正在加载游戏房间..."
            textPosition="bottom"
            crt
            glow
          />
          <div className="text-sm font-retro-mono text-retro-text-secondary">
            正在连接游戏服务器...
          </div>
        </div>
      </div>
    )
  }

  if (!currentRoom || currentRoom.id !== roomId) {
    return null
  }

  const isHost = roomPlayers.find(p => p.id === currentUserId)?.isHost || false
  const currentPlayer = roomPlayers.find(p => p.id === currentUserId)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-game-danger/10 border border-game-danger/30 rounded-xl shadow-neon-danger">
          <div className="flex items-center justify-between">
            <p className="text-game-danger text-sm font-retro-body">{error}</p>
            <button
              onClick={clearError}
              className="text-game-danger hover:text-game-danger/80 text-sm font-retro-body transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 游戏头部信息 */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-retro-primary-600 to-retro-secondary-600 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-retro-surface/90 backdrop-blur-sm border border-retro-primary-500/30 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-retro-primary-500 to-retro-secondary-500 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-retro-display">掼蛋游戏房间</h1>
                  <p className="text-retro-primary-400 font-retro-body">{currentRoom.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-retro-primary-500" />
                  <span className="text-retro-text-primary font-retro-body">房主：{currentRoom.hostName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-retro-primary-500" />
                  <span className="text-retro-text-primary font-retro-body">
                    {roomPlayers.length}/{currentRoom.maxPlayers} 玩家
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-retro-primary-500" />
                  <span className="text-retro-text-primary font-retro-body">第 {currentRound} 轮 / 共 {totalRounds} 轮</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-retro-primary-500" />
                  <span className="text-retro-text-primary font-retro-body">
                    {gameStatus === 'playing' ? '游戏中' :
                     gameStatus === 'paused' ? '已暂停' :
                     gameStatus === 'finished' ? '已结束' : '等待中'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-retro-surface/50 border border-retro-primary-500/30 rounded-lg text-retro-primary-400 hover:text-white hover:border-retro-secondary-500 transition-all duration-300"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 bg-retro-surface/50 border border-retro-primary-500/30 rounded-lg text-retro-primary-400 hover:text-white hover:border-retro-primary-500 transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLeaveGame}
                className="p-3 bg-game-danger/30 border border-game-danger text-game-danger rounded-lg hover:bg-game-danger/40 hover:border-game-danger/80 transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline font-retro-body">离开游戏</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 左侧：游戏画布和玩家信息 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 游戏画布区域 */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-retro-primary-500/20 to-retro-secondary-500/20 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-retro-surface/90 backdrop-blur-sm border border-retro-primary-500/30 rounded-xl overflow-hidden shadow-neon-primary">
              {/* 游戏画布头部 */}
              <div className="p-4 border-b border-retro-primary-900 bg-gradient-to-r from-retro-surface to-retro-primary-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-retro-primary-500 to-retro-secondary-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-retro-heading">游戏画布</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-retro-surface/50 rounded-lg">
                      <span className="text-xs text-retro-primary-400 font-retro-mono">60 FPS</span>
                    </div>
                    <div className={`px-3 py-1 rounded-lg ${
                      gameStatus === 'playing' ? 'bg-game-success/30 text-game-success' :
                      gameStatus === 'paused' ? 'bg-game-warning/30 text-game-warning' :
                      'bg-retro-surface text-retro-text-secondary'
                    }`}>
                      <span className="text-xs font-retro-mono">{gameStatus === 'playing' ? '运行中' : '已暂停'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 游戏画布内容 */}
              <div className="h-[500px] flex items-center justify-center bg-retro-background">
                <GameErrorBoundary roomId={roomId} showGameTips>
                  <GameCanvas roomId={roomId} />
                </GameErrorBoundary>
              </div>

              {/* 游戏画布控制栏 */}
              <div className="p-4 border-t border-retro-primary-900 bg-retro-surface/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGameAction('pause')}
                      disabled={gameStatus !== 'playing'}
                      className="px-4 py-2 bg-retro-surface text-retro-text-secondary rounded-lg hover:bg-retro-primary-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      <span className="text-sm font-retro-body">暂停</span>
                    </button>
                    <button
                      onClick={() => handleGameAction('resume')}
                      disabled={gameStatus !== 'paused'}
                      className="px-4 py-2 bg-retro-surface text-retro-text-secondary rounded-lg hover:bg-retro-primary-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-retro-body">继续</span>
                    </button>
                    <button
                      onClick={() => handleGameAction('restart')}
                      className="px-4 py-2 bg-retro-surface text-retro-text-secondary rounded-lg hover:bg-retro-primary-900 hover:text-white transition-all duration-300 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm font-retro-body">重开</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleSpectator}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                        showSpectatorMode
                          ? 'bg-retro-primary-900/30 text-retro-primary-300 border border-retro-primary-700'
                          : 'bg-retro-surface text-retro-text-secondary hover:bg-retro-primary-900 hover:text-white'
                      }`}
                    >
                      {showSpectatorMode ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span className="text-sm font-retro-body">退出观战</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-retro-body">观战模式</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 玩家区域 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              玩家状态
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {roomPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`relative p-4 rounded-xl border transition-all duration-300 ${
                    player.id === currentUserId
                      ? 'border-green-500 bg-green-900/20'
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
                        {player.id === currentUserId && (
                          <span className="px-2 py-0.5 bg-green-900/30 text-green-300 text-xs rounded-full">
                            我
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-400">在线</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-400">13 张牌</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-400">250 分</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">位置 {index + 1}</div>
                      <div className="text-sm text-green-400 mt-1">出牌中</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：游戏控制面板 */}
        <div className="space-y-6">
          {/* 游戏控制 */}
          <GameControls
            roomId={roomId}
            gameStatus={gameStatus}
            currentRound={currentRound}
            totalRounds={totalRounds}
            onGameAction={handleGameAction}
            isHost={isHost}
          />

          {/* 游戏聊天 */}
          <GameChatPanel roomId={roomId} />

          {/* 游戏统计 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              游戏统计
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">当前回合</span>
                <span className="text-white font-mono">3/8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">剩余时间</span>
                <span className="text-white font-mono">01:23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">出牌次数</span>
                <span className="text-white font-mono">42</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">炸弹数量</span>
                <span className="text-white font-mono">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">当前头游</span>
                <span className="text-green-300 font-medium">{currentRoom.hostName}</span>
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">快捷操作</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/rooms/${roomId}`)}
                className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                返回房间页面
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm"
              >
                复制游戏链接
              </button>
              <button
                onClick={handleToggleSpectator}
                className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm flex items-center gap-2"
              >
                {showSpectatorMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSpectatorMode ? '退出观战模式' : '进入观战模式'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-cyan-600 rounded-3xl blur opacity-30"></div>
              <div className="relative bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">游戏设置</h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      游戏音量
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="70"
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-green-500 [&::-webkit-slider-thumb]:to-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      动画效果
                    </label>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm">
                        流畅
                      </button>
                      <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm">
                        精简
                      </button>
                      <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm">
                        关闭
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      卡牌样式
                    </label>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm">
                        经典
                      </button>
                      <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm">
                        像素
                      </button>
                      <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 text-sm">
                        霓虹
                      </button>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-800">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-cyan-700 transition-all duration-300"
                    >
                      保存设置
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}