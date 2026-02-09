/**
 * 游戏大厅页面
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  Plus,
  Users,
  Lock,
  Gamepad2,
  Trophy,
  Clock,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react'
import { useLobbyStore, type GameRoom } from '@/lib/store/lobbyStore'
import CreateRoomModal from '@/components/lobby/CreateRoomModal'
import RoomCard from '@/components/lobby/RoomCard'
import FilterPanel from '@/components/lobby/FilterPanel'

export default function LobbyPage() {
  const router = useRouter()
  const {
    rooms,
    filteredRooms,
    isLoading,
    error,
    fetchRooms,
    setSearchQuery,
    clearError
  } = useLobbyStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  // 初始加载房间列表
  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // 自动刷新房间列表
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRooms()
    }, 10000) // 每10秒刷新一次

    return () => clearInterval(interval)
  }, [fetchRooms])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  const handleQuickStart = () => {
    // 快速开始逻辑：自动匹配或创建房间
    router.push('/game')
  }

  const stats = {
    totalRooms: rooms.length,
    waitingRooms: rooms.filter(r => r.status === 'waiting').length,
    playingRooms: rooms.filter(r => r.status === 'playing').length,
    totalPlayers: rooms.reduce((sum, room) => sum + room.currentPlayers, 0),
  }

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

      {/* 快速操作区域 */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* 快速开始卡片 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <button
            onClick={handleQuickStart}
            className="relative w-full bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-left hover:border-purple-500 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">快速开始</h3>
                <p className="text-gray-400 text-sm">立即匹配对手开始游戏</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-400 text-sm font-medium">立即开始</span>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </div>
          </button>
        </div>

        {/* 创建房间卡片 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="relative w-full bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-left hover:border-blue-500 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">创建房间</h3>
                <p className="text-gray-400 text-sm">自定义设置，邀请好友</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-sm font-medium">开始创建</span>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
            </div>
          </button>
        </div>

        {/* 统计数据卡片 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative w-full bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">实时数据</h3>
                <p className="text-gray-400 text-sm">当前游戏状态</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalRooms}</div>
                <div className="text-xs text-gray-500">房间总数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalPlayers}</div>
                <div className="text-xs text-gray-500">在线玩家</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索房间名称、描述或房主..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                搜索
              </button>
            </div>
          </form>

          {/* 筛选和刷新按钮 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                showFilters
                  ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">筛选</span>
            </button>
            <button
              onClick={() => fetchRooms()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">刷新</span>
            </button>
          </div>
        </div>

        {/* 筛选面板 */}
        {showFilters && <FilterPanel />}
      </div>

      {/* 房间列表区域 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            可用房间
            <span className="text-gray-500 text-sm font-normal">
              ({filteredRooms.length} 个房间)
            </span>
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>每10秒自动刷新</span>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">加载房间列表中...</p>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-8 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">暂无可用房间</h3>
              <p className="text-gray-400 mb-6">您可以创建新房间或稍后再来查看</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                创建第一个房间
              </button>
            </div>
          </div>
        )}

        {/* 房间列表 */}
        {!isLoading && filteredRooms.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

      {/* 特色功能提示 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">特色功能</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">公平竞技环境</span>
              </div>
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">智能 AI 对手</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">排位赛系统</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 创建房间模态框 */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}