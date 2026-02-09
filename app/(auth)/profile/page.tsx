/**
 * 个人资料页面
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Award, Calendar, LogOut, Save, Edit2, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'

export default function ProfilePage() {
  const router = useRouter()
  const { user, guestNickname, setGuestNickname, logout, isLoading } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(guestNickname)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNickname = async () => {
    if (nickname.trim() && nickname !== guestNickname) {
      setIsSaving(true)
      setGuestNickname(nickname.trim())
      // 模拟保存延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const isGuest = !user

  return (
    <>
      {/* 页面标题 */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">个人资料</h2>
        <p className="text-gray-400 text-sm">管理您的账户信息和游戏设置</p>
      </div>

      {/* 用户信息卡片 */}
      <div className="mb-8">
        <div className="relative">
          {/* 霓虹光晕效果 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30"></div>

          <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            {/* 头像区域 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-30"></div>
              </div>
              <div className="flex-1">
                {isGuest ? (
                  <>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          placeholder="请输入昵称"
                          maxLength={20}
                        />
                        <button
                          onClick={handleSaveNickname}
                          disabled={isSaving || !nickname.trim()}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSaving ? '保存中...' : '保存'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setNickname(guestNickname)
                          }}
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{guestNickname}</h3>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                        游客模式
                      </span>
                      <span className="text-xs text-gray-500">
                        注册账户以保存进度
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white">{user.username}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full">
                        认证用户
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 详细信息 */}
            <div className="space-y-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-400">邮箱地址</p>
                      <p className="text-white">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-400">注册时间</p>
                      <p className="text-white">
                        {user.createdAt.toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-2">游客模式限制：</p>
                  <ul className="text-gray-500 text-sm space-y-1">
                    <li>• 游戏进度不会保存</li>
                    <li>• 无法创建私人房间</li>
                    <li>• 部分功能受限</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 游戏统计（占位符） */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          游戏统计
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">总游戏数</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">胜率</p>
            <p className="text-2xl font-bold text-white">0%</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">最高连胜</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">游戏时长</p>
            <p className="text-2xl font-bold text-white">0h</p>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-4">
        {isGuest ? (
          <>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              <span>注册完整账户</span>
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 px-4 bg-gray-800/50 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-700/50 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
            >
              登录已有账户
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-red-900/30 border border-red-700 text-red-300 font-medium rounded-lg hover:bg-red-800/30 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>登出中...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>退出登录</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </>
  )
}