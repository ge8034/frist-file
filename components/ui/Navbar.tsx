/**
 * 导航栏组件
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Gamepad2,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Trophy,
  Settings
} from 'lucide-react'
import { useAuthStore, getCurrentUserNickname, isGuestUser } from '@/lib/store/authStore'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [isGuest, setIsGuest] = useState(true)
  const [userNickname, setUserNickname] = useState('游客')

  useEffect(() => {
    setIsGuest(isGuestUser())
    setUserNickname(getCurrentUserNickname())
  }, [])

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/rooms/lobby', label: '游戏大厅', icon: Users },
    { href: '/game', label: '快速开始', icon: Gamepad2 },
    { href: '/leaderboard', label: '排行榜', icon: Trophy },
  ]

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  掼蛋游戏
                </h1>
                <p className="text-xs text-gray-500 font-mono">Retro-Futurism</p>
              </div>
            </Link>

            {/* 桌面导航 */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* 用户区域 - 始终显示游客信息，移除登录注册链接 */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {userNickname} (游客)
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-700/50 hover:text-white hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">切换身份</span>
              </button>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* 菜单内容 */}
          <div className="absolute right-0 top-16 w-64 h-[calc(100vh-4rem)] bg-gray-900/95 backdrop-blur-sm border-l border-gray-800 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* 用户信息 */}
              <div className="p-4 bg-gray-800/50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{userNickname}</p>
                    <p className="text-xs text-gray-500">
                      游客模式
                    </p>
                  </div>
                </div>
              </div>

              {/* 导航链接 */}
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* 分隔线 */}
              <div className="h-px bg-gray-800 my-4"></div>

              {/* 用户操作 - 始终显示游客信息，移除登录注册链接 */}
              <div className="space-y-2">
                <div className="p-4 bg-gray-800/50 rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{userNickname}</p>
                      <p className="text-xs text-gray-500">游客模式</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span>游戏设置</span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-5 h-5" />
                  <span>切换游客身份</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}