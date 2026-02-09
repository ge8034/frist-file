/**
 * 认证路由组布局
 * 基于 Retro-Futurism 设计系统
 */

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
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

      {/* 主要内容 */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/标题区域 */}
          <div className="mb-8 text-center">
            <div className="inline-block mb-4">
              <div className="relative">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  掼蛋游戏
                </h1>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-mono">
              经典纸牌游戏 · 在线对战 · AI 对手
            </p>
          </div>

          {/* 认证卡片 */}
          <div className="relative">
            {/* 霓虹光晕效果 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

            <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-2xl">
              {children}
            </div>
          </div>

          {/* 页脚信息 */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs font-mono">
              使用游客模式无需注册，立即开始游戏
            </p>
            <p className="text-gray-600 text-xs mt-2">
              © 2026 掼蛋游戏 · 复古未来主义设计
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}