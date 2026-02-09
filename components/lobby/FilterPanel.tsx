/**
 * 筛选面板组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { Gamepad2, Trophy, Shield, Users, LockOpen, Lock } from 'lucide-react'
import { useLobbyStore } from '@/lib/store/lobbyStore'

export default function FilterPanel() {
  const { filters, setFilters } = useLobbyStore()

  const gameModes = [
    { value: 'all', label: '全部模式', icon: <Gamepad2 className="w-4 h-4" /> },
    { value: 'casual', label: '休闲模式', icon: <Gamepad2 className="w-4 h-4" /> },
    { value: 'ranked', label: '排位赛', icon: <Trophy className="w-4 h-4" /> },
    { value: 'tournament', label: '锦标赛', icon: <Shield className="w-4 h-4" /> },
  ]

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'waiting', label: '等待中' },
    { value: 'playing', label: '游戏中' },
  ]

  const maxPlayersOptions = [2, 3, 4]

  return (
    <div className="mt-6 pt-6 border-t border-gray-800">
      <div className="grid md:grid-cols-4 gap-6">
        {/* 游戏模式筛选 */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            游戏模式
          </h4>
          <div className="space-y-2">
            {gameModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setFilters({ gameMode: mode.value as any })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  filters.gameMode === mode.value
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                {mode.icon}
                <span className="text-sm">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 房间状态筛选 */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">房间状态</h4>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setFilters({ status: status.value as any })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  filters.status === status.value
                    ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    status.value === 'waiting'
                      ? 'bg-green-500'
                      : status.value === 'playing'
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }`}
                />
                <span className="text-sm">{status.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 最大人数筛选 */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            最大人数
          </h4>
          <div className="space-y-2">
            {maxPlayersOptions.map((count) => (
              <button
                key={count}
                onClick={() => setFilters({ maxPlayers: count })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 ${
                  filters.maxPlayers === count
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                <span className="text-sm">{count} 人房间</span>
                <div className="flex items-center gap-1">
                  {[...Array(count)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        filters.maxPlayers === count
                          ? 'bg-green-400'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 密码筛选 */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">房间类型</h4>
          <div className="space-y-2">
            <button
              onClick={() => setFilters({ hasPassword: !filters.hasPassword })}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                filters.hasPassword
                  ? 'bg-gray-800/50 text-gray-300 border border-gray-700'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              {filters.hasPassword ? (
                <>
                  <LockOpen className="w-4 h-4" />
                  <span className="text-sm">仅显示公开房间</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">显示所有房间</span>
                </>
              )}
            </button>

            {/* 重置筛选按钮 */}
            <button
              onClick={() =>
                setFilters({
                  gameMode: 'all',
                  status: 'all',
                  hasPassword: false,
                  maxPlayers: 4,
                })
              }
              className="w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg border border-gray-700 transition-all duration-300 text-sm"
            >
              重置所有筛选
            </button>
          </div>
        </div>
      </div>

      {/* 当前筛选状态 */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">当前筛选：</span>
            <div className="flex flex-wrap gap-2">
              {filters.gameMode !== 'all' && (
                <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full">
                  {gameModes.find(m => m.value === filters.gameMode)?.label}
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full">
                  {statusOptions.find(s => s.value === filters.status)?.label}
                </span>
              )}
              {filters.hasPassword && (
                <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                  仅公开房间
                </span>
              )}
              <span className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded-full">
                {filters.maxPlayers}人房间
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}