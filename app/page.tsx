/**
 * 首页
 * 基于 Retro-Futurism 设计系统
 */

import Link from 'next/link'
import { Gamepad2, Users, Trophy, Zap, Sparkles, Shield, Clock, Star } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: '多人在线对战',
      description: '与全球玩家实时对战，体验刺激的掼蛋竞技',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: '智能 AI 对手',
      description: '三种难度 AI，从新手到高手都能找到合适对手',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '公平竞技环境',
      description: '完善的防作弊系统，确保游戏公平性',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '快速匹配',
      description: '30秒内找到对手，随时随地开始游戏',
      color: 'from-orange-500 to-red-500',
    },
  ]

  const stats = [
    { label: '在线玩家', value: '1,234', icon: <Users className="w-4 h-4" /> },
    { label: '总对局数', value: '45,678', icon: <Gamepad2 className="w-4 h-4" /> },
    { label: '平均评分', value: '4.8', icon: <Star className="w-4 h-4" /> },
    { label: '匹配速度', value: '<30s', icon: <Zap className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen">
      {/* 英雄区域 */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* 背景效果 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* 标题 */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">实时在线 · 经典掼蛋</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-gradient">掼蛋游戏</span>
                <br />
                <span className="text-white">复古未来主义体验</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                经典纸牌游戏与现代设计的完美融合，支持多人在线对战和智能 AI 对手，
                带来前所未有的游戏体验。
              </p>
            </div>

            {/* 行动按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/game"
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300 flex items-center justify-center gap-3 shadow-neon"
              >
                <Gamepad2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>快速开始游戏</span>
              </Link>
              <Link
                href="/rooms/lobby"
                className="group px-8 py-4 bg-gray-800/50 border-2 border-gray-700 text-white font-bold rounded-xl hover:bg-gray-700/50 hover:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>进入游戏大厅</span>
              </Link>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="text-purple-400">{stat.icon}</div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 特性介绍 */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              为什么选择我们的掼蛋游戏？
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              结合经典玩法与现代技术，为您带来最佳的游戏体验
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hover:border-purple-500 transition-all duration-300 card-hover"
              >
                {/* 图标背景 */}
                <div
                  className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <div className="text-white">{feature.icon}</div>
                </div>

                <div className="pt-8">
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>

                {/* 悬停效果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 游戏模式 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧内容 */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                多种游戏模式
                <br />
                <span className="text-gradient">满足不同需求</span>
              </h2>
              <p className="text-gray-400 mb-8">
                无论您是新手还是高手，都能找到适合自己的游戏模式。
                从休闲娱乐到竞技对战，我们提供全方位的游戏体验。
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">快速匹配</h3>
                    <p className="text-gray-400">
                      30秒内匹配到实力相当的对手，立即开始游戏
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">好友房间</h3>
                    <p className="text-gray-400">
                      创建私人房间，邀请好友一起游戏
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">排位赛</h3>
                    <p className="text-gray-400">
                      参与排位赛，提升段位，证明自己的实力
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧图片/卡片 */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-2xl p-8 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-neon">
                      <Gamepad2 className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-white font-bold text-lg">游戏预览</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {['新手', '普通', '高手'].map((level, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center"
                    >
                      <div className="text-sm text-gray-400 mb-1">AI难度</div>
                      <div className="text-white font-bold">{level}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 装饰元素 */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 召唤行动区域 */}
      <section className="py-20 bg-gradient-to-b from-transparent to-purple-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative">
              {/* 装饰元素 */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-30"></div>
              <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-xl opacity-30"></div>

              <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  立即开始您的
                  <span className="text-gradient"> 掼蛋之旅</span>
                </h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                  无需下载，直接在浏览器中开始游戏。支持游客模式，立即体验！
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/game"
                    className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>立即开始游戏</span>
                  </Link>
                  <Link
                    href="/rooms/lobby"
                    className="group px-8 py-4 bg-gray-800/50 border-2 border-gray-700 text-white font-bold rounded-xl hover:bg-gray-700/50 hover:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300"
                  >
                    <span>了解更多</span>
                  </Link>
                </div>

                <p className="text-gray-500 text-sm mt-6">
                  支持 Chrome, Firefox, Safari, Edge 等现代浏览器
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}