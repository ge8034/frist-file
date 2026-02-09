/**
 * 游戏大厅路由组布局
 * 基于 Retro-Futurism 设计系统
 */

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Gamepad2, Trophy } from 'lucide-react'

interface RoomsLayoutProps {
  children: ReactNode
}

export default function RoomsLayout({ children }: RoomsLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100">
      {/* CRT 扫描线效果 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.25)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-30"></div>
      </div>

      {/* 返回首页链接 */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all duration-300 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
          <span className="text-sm font-medium group-hover:text-purple-300 transition-colors">
            返回首页
          </span>
        </Link>
      </div>

      {/* 大厅导航 */}
      <div className="fixed top-6 right-6 z-50">
        <div className="flex items-center gap-2">
          <Link
            href="/rooms/lobby"
            className="group flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all duration-300 hover:border-purple-500"
          >
            <Users className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-purple-300 transition-colors">
              房间列表
            </span>
          </Link>
          <Link
            href="/game"
            className="group flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all duration-300 hover:border-purple-500"
          >
            <Gamepad2 className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-purple-300 transition-colors">
              快速开始
            </span>
          </Link>
          <Link
            href="/leaderboard"
            className="group flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all duration-300 hover:border-purple-500"
          >
            <Trophy className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-purple-300 transition-colors">
              排行榜
            </span>
          </Link>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* 标题区域 */}
          <div className="mb-8 text-center">
            <div className="inline-block mb-4">
              <div className="relative">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  游戏大厅
                </h1>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-mono">
              选择房间加入或创建新房间开始游戏
            </p>
          </div>

          {children}
        </div>
      </div>

      {/* 页脚信息 */}
      <div className="fixed bottom-6 left-0 right-0 text-center">
        <p className="text-gray-600 text-xs">
          © 2026 掼蛋游戏 · 复古未来主义设计 · 实时在线对战
        </p>
      </div>
    </div>
  )
}