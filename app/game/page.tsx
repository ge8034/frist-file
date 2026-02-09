/**
 * 游戏入口页面 - 简化版
 * 点击开始游戏直接进入游戏大厅，无需任何选择
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Gamepad2,
  Users,
  Zap,
  Play,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Shield
} from 'lucide-react'
import { Loading } from '@/components/ui/Loading'

export default function GameEntryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)


  // 开始游戏 - 直接进入游戏大厅，无需认证
  const handleStartGame = async () => {
    setIsLoading(true)

    try {
      // 模拟游戏加载过程
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 直接跳转到游戏大厅，无需任何认证
      router.push('/rooms/lobby')
    } catch (error) {
      console.error('开始游戏失败:', error)
      setIsLoading(false)
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading
          variant="neon"
          size="xl"
          fullWidth
          fullHeight
          text="正在准备游戏..."
          showText
          textPosition="bottom"
          crt
          glow
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-retro-background via-retro-surface to-retro-background">
      {/* CRT扫描线效果 */}
      <div className="fixed inset-0 crt-scanlines pointer-events-none z-10"></div>

      <div className="container mx-auto px-4 py-8">
        {/* 主内容区域 */}
        <div className="max-w-4xl mx-auto">
          {/* 头部卡片 */}
          <div className="relative mb-12">
            <div className="absolute -inset-4 bg-gradient-to-r from-retro-primary-600/20 to-retro-accent-600/20 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-retro-surface/80 backdrop-blur-sm border border-retro-primary-500/30 rounded-2xl p-8 md:p-12 crt-border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-retro-primary-600 to-retro-accent-600 rounded-xl flex items-center justify-center shadow-neon-primary">
                      <Gamepad2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl md:text-5xl font-retro-display text-white mb-3">
                        开始游戏
                      </h1>
                      <p className="text-retro-text-secondary font-retro-body text-lg">
                        点击按钮，立即进入游戏大厅开始掼蛋对战
                      </p>
                    </div>
                  </div>

                  {/* 统计数据 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-retro-surface/50 border border-retro-primary-500/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-retro-primary-400"><Users className="w-4 h-4" /></div>
                        <div className="text-2xl font-retro-digital text-white">1,234</div>
                      </div>
                      <div className="text-xs text-retro-text-secondary">在线玩家</div>
                    </div>
                    <div className="bg-retro-surface/50 border border-retro-primary-500/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-retro-primary-400"><Gamepad2 className="w-4 h-4" /></div>
                        <div className="text-2xl font-retro-digital text-white">567</div>
                      </div>
                      <div className="text-xs text-retro-text-secondary">今日对局</div>
                    </div>
                    <div className="bg-retro-surface/50 border border-retro-primary-500/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-retro-primary-400"><Trophy className="w-4 h-4" /></div>
                        <div className="text-2xl font-retro-digital text-white">68%</div>
                      </div>
                      <div className="text-xs text-retro-text-secondary">AI胜率</div>
                    </div>
                    <div className="bg-retro-surface/50 border border-retro-primary-500/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-retro-primary-400"><Sparkles className="w-4 h-4" /></div>
                        <div className="text-2xl font-retro-digital text-white">15min</div>
                      </div>
                      <div className="text-xs text-retro-text-secondary">平均时长</div>
                    </div>
                  </div>
                </div>

                {/* 控制按钮 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-3 bg-retro-surface/50 border border-retro-primary-500/30 rounded-xl text-retro-text-secondary hover:text-white hover:border-retro-primary-500 transition-all duration-300"
                    aria-label={isMuted ? '取消静音' : '静音'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <Link
                    href="/rooms/lobby"
                    className="p-3 bg-retro-surface/50 border border-retro-primary-500/30 rounded-xl text-retro-text-secondary hover:text-white hover:border-retro-primary-500 transition-all duration-300"
                    aria-label="游戏设置"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 开始游戏主按钮区域 */}
          <div className="relative mb-12">
            <div className="absolute -inset-4 bg-gradient-to-r from-retro-primary-600/20 to-retro-secondary-600/20 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-retro-surface/80 backdrop-blur-sm border border-retro-primary-500/30 rounded-2xl p-8 md:p-12 crt-border crt-glow">
              <div className="text-center">
                <div className="mb-8">
                  <h2 className="text-3xl font-retro-display text-white mb-4">
                    立即开始游戏
                  </h2>
                  <p className="text-retro-text-secondary font-retro-body max-w-2xl mx-auto">
                    无需注册登录，点击按钮即可直接进入游戏大厅与玩家对战
                  </p>
                </div>

                {/* 主开始按钮 */}
                <button
                  onClick={handleStartGame}
                  disabled={isLoading}
                  className="group relative inline-block"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-retro-primary-600 to-retro-secondary-600 rounded-2xl blur opacity-70 group-hover:opacity-90 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-retro-primary-600 to-retro-secondary-600 text-white font-retro-heading text-xl md:text-2xl py-5 px-12 rounded-xl hover:from-retro-primary-700 hover:to-retro-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-4 shadow-neon-primary">
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>正在进入游戏...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6" />
                        <span>开始游戏</span>
                      </>
                    )}
                  </div>
                </button>

                {/* 游戏特色提示 */}
                <div className="mt-10 pt-8 border-t border-retro-primary-500/20">
                  <h3 className="text-lg font-retro-heading text-white mb-6">游戏特色</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center text-center p-4 bg-retro-surface/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-retro-primary-500 to-retro-accent-500 rounded-lg flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-retro-body text-white mb-2">快速开始</h4>
                      <p className="text-sm text-retro-text-secondary">无需注册登录，一键进入游戏大厅</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-retro-surface/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-retro-secondary-500 to-retro-primary-500 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-retro-body text-white mb-2">多人对战</h4>
                      <p className="text-sm text-retro-text-secondary">与真实玩家实时对战，体验竞技乐趣</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-retro-surface/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-game-success to-retro-secondary-500 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-retro-body text-white mb-2">公平竞技</h4>
                      <p className="text-sm text-retro-text-secondary">完善的游戏规则，确保公平对战环境</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 快捷入口 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/rooms/lobby"
              className="group relative p-6 bg-retro-surface/50 border border-retro-primary-500/20 rounded-2xl hover:bg-retro-primary-900/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-retro-primary-500 to-retro-accent-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-retro-heading text-white mb-1">游戏大厅</h3>
                  <p className="text-sm text-retro-text-secondary">查看所有可用房间</p>
                </div>
              </div>
            </Link>
            <Link
              href="/tutorial"
              className="group relative p-6 bg-retro-surface/50 border border-retro-primary-500/20 rounded-2xl hover:bg-retro-primary-900/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-retro-secondary-500 to-retro-primary-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-retro-heading text-white mb-1">新手教程</h3>
                  <p className="text-sm text-retro-text-secondary">学习掼蛋基本规则</p>
                </div>
              </div>
            </Link>
            <Link
              href="/leaderboard"
              className="group relative p-6 bg-retro-surface/50 border border-retro-primary-500/20 rounded-2xl hover:bg-retro-primary-900/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-game-success to-retro-secondary-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-retro-heading text-white mb-1">排行榜</h3>
                  <p className="text-sm text-retro-text-secondary">查看玩家排名</p>
                </div>
              </div>
            </Link>
          </div>

          {/* 底部信息 */}
          <footer className="pt-8 border-t border-retro-primary-500/20">
            <div className="text-center">
              <div className="text-sm text-retro-text-secondary/50 font-retro-mono mb-2">
                GuanDan2 • Retro-Futurism Edition • v1.0
              </div>
              <div className="text-xs text-retro-text-secondary/30">
                经典掼蛋游戏与现代设计的完美融合
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* 霓辉光背景效果 */}
      <div className="fixed inset-0 bg-gradient-to-br from-retro-primary-500/5 via-retro-secondary-500/3 to-retro-accent-500/5 pointer-events-none"></div>
    </div>
  )
}