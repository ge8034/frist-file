/**
 * 创建房间模态框组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Gamepad2,
  Trophy,
  Shield,
  Users,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Info
} from 'lucide-react'
import { useLobbyStore, type GameRoom } from '@/lib/store/lobbyStore'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter()
  const { createRoom, isCreating, error, clearError } = useLobbyStore()

  const [form, setForm] = useState({
    name: '',
    description: '',
    gameMode: 'casual' as GameRoom['gameMode'],
    maxPlayers: 4,
    isPrivate: false,
    password: '',
    aiPlayers: 0,
  })

  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const roomData: Partial<GameRoom> = {
      name: form.name.trim(),
      description: form.description.trim(),
      gameMode: form.gameMode,
      maxPlayers: form.maxPlayers,
      isPrivate: form.isPrivate,
      password: form.isPrivate ? form.password : undefined,
      aiPlayers: form.aiPlayers,
    }

    const roomId = await createRoom(roomData)
    if (roomId) {
      router.push(`/rooms/${roomId}`)
      onClose()
    }
  }

  const handleClose = () => {
    clearError()
    onClose()
  }

  const gameModes = [
    {
      value: 'casual',
      label: '休闲模式',
      description: '轻松愉快的游戏体验',
      icon: <Gamepad2 className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      value: 'ranked',
      label: '排位赛',
      description: '提升段位，证明实力',
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      value: 'tournament',
      label: '锦标赛',
      description: '高手对决，赢取奖励',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 模态框内容 */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl">
          {/* 霓虹光晕效果 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30"></div>

          <div className="relative bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* 头部 */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">创建新房间</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    自定义房间设置，邀请好友一起游戏
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mx-6 mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* 表单内容 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 房间名称和描述 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    房间名称 *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例如：掼蛋高手对决"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    最多30个字符，建议使用有吸引力的名称
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    游戏模式 *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {gameModes.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setForm({ ...form, gameMode: mode.value as any })}
                        className={`relative p-3 rounded-lg border transition-all duration-300 ${
                          form.gameMode === mode.value
                            ? `border-transparent bg-gradient-to-br ${mode.color} text-white`
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {mode.icon}
                          <span className="text-xs font-medium">{mode.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 房间描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  房间描述
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={100}
                  rows={2}
                  placeholder="描述您的房间特色或游戏规则..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  最多100个字符，让其他玩家了解您的房间
                </p>
              </div>

              {/* 玩家设置 */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    最大玩家数
                  </label>
                  <div className="flex items-center gap-2">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setForm({ ...form, maxPlayers: count })}
                        className={`flex-1 py-3 rounded-lg border transition-all duration-300 ${
                          form.maxPlayers === count
                            ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs">玩家</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI 玩家数量
                  </label>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 3].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setForm({ ...form, aiPlayers: count })}
                        className={`flex-1 py-3 rounded-lg border transition-all duration-300 ${
                          form.aiPlayers === count
                            ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs">AI</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {form.aiPlayers > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      空缺位置将由 AI 自动补位
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    房间隐私
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isPrivate: false })}
                      className={`flex-1 py-3 rounded-lg border transition-all duration-300 ${
                        !form.isPrivate
                          ? 'border-green-500 bg-green-900/30 text-green-300'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium">公开</div>
                        <div className="text-xs">所有人可见</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isPrivate: true })}
                      className={`flex-1 py-3 rounded-lg border transition-all duration-300 ${
                        form.isPrivate
                          ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium">私密</div>
                        <div className="text-xs">需要密码</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* 密码输入 */}
              {form.isPrivate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    房间密码 *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={form.isPrivate}
                      minLength={4}
                      maxLength={20}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="请输入4-20位密码"
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
                    请设置一个安全的密码，并告知您的朋友
                  </p>
                </div>
              )}

              {/* 提示信息 */}
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      创建房间后，您可以：
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• 邀请好友通过房间ID或链接加入</li>
                      <li>• 设置AI玩家自动补位空缺位置</li>
                      <li>• 在房间内聊天和准备游戏</li>
                      <li>• 房主可以开始游戏或解散房间</li>
                    </ul>
                  </div>
                </div>
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
                  disabled={isCreating}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>创建中...</span>
                    </>
                  ) : (
                    <>
                      <span>创建房间</span>
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