/**
 * 根布局
 * 基于 Retro-Futurism 设计系统
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '掼蛋游戏 - 经典纸牌在线对战',
  description: '基于 Next.js 14 的掼蛋游戏平台，支持多人在线对战和AI对手，采用复古未来主义设计风格。',
  keywords: ['掼蛋', '纸牌游戏', '在线对战', 'AI游戏', '复古未来主义'],
  authors: [{ name: '掼蛋游戏开发团队' }],
  openGraph: {
    title: '掼蛋游戏 - 经典纸牌在线对战',
    description: '基于 Next.js 14 的掼蛋游戏平台，支持多人在线对战和AI对手',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <head>
        {/* 导入 Retro-Futurism 字体 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        {/* CRT 扫描线效果 */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.25)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
        </div>

        {/* 全局霓虹光晕效果 */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
        </div>
      </body>
    </html>
  )
}
