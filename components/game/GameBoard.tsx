/**
 * Retro-Futurism 风格游戏棋盘组件
 * 核心游戏界面，包含玩家区域、出牌区域和控制面板
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SurfaceCard } from '@/components/ui/SurfaceCard'

export interface GameBoardProps {
  /** 顶部玩家区域 */
  topPlayer: ReactNode
  /** 左侧玩家区域 */
  leftPlayer: ReactNode
  /** 右侧玩家区域 */
  rightPlayer: ReactNode
  /** 底部玩家区域（当前玩家） */
  bottomPlayer: ReactNode
  /** 出牌区域 */
  playArea: ReactNode
  /** 控制面板 */
  controlPanel: ReactNode
  /** 游戏状态信息 */
  gameStatus: ReactNode
  /** 聊天面板 */
  chatPanel?: ReactNode
  /** 是否显示网格背景 */
  showGrid?: boolean
  /** CRT边框效果 */
  crt?: boolean
  /** 霓辉光效果 */
  glow?: boolean
}

/**
 * Retro-Futurism 游戏棋盘组件
 *
 * @example
 * ```tsx
 * <GameBoard
 *   topPlayer={<PlayerArea player={northPlayer} />}
 *   leftPlayer={<PlayerArea player={westPlayer} />}
 *   rightPlayer={<PlayerArea player={eastPlayer} />}
 *   bottomPlayer={<PlayerArea player={currentPlayer} />}
 *   playArea={<PlayArea cards={playedCards} />}
 *   controlPanel={<ActionButtons onPlay={handlePlay} />}
 *   gameStatus={<GameStatus phase={phase} />}
 *   crt
 *   glow
 * />
 * ```
 */
export function GameBoard({
  topPlayer,
  leftPlayer,
  rightPlayer,
  bottomPlayer,
  playArea,
  controlPanel,
  gameStatus,
  chatPanel,
  showGrid = true,
  crt = true,
  glow = true,
}: GameBoardProps) {
  return (
    <div className="relative min-h-screen bg-retro-background p-4 md:p-6">
      {/* CRT扫描线全局效果 */}
      {crt && <div className="fixed inset-0 crt-scanlines pointer-events-none" />}

      {/* 网格背景 */}
      {showGrid && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.1)_1px,transparent_1px),
          linear-gradient(90deg,rgba(124,58,237,0.1)_1px,transparent_1px)]
          bg-[size:40px_40px]
          opacity-20" />
      )}

      {/* 霓虹辉光背景 */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-retro-primary-900/10 via-retro-secondary-900/5 to-retro-accent-900/10" />
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 游戏标题区域 */}
        <div className="mb-6 md:mb-8">
          <SurfaceCard
            variant="neon"
            crt={crt}
            glow={glow}
            className="text-center py-4"
          >
            <h1 className="text-3xl md:text-4xl font-retro-display text-retro-primary-400">
              GUANDAN2
            </h1>
            <div className="text-sm font-retro-mono text-retro-text-secondary mt-2">
              RETRO-FUTURISM EDITION • 4 PLAYERS • AI SUPPORTED
            </div>
            {gameStatus}
          </SurfaceCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* 左侧玩家区域 */}
          <div className="lg:col-span-1 lg:row-span-2 flex items-center justify-center">
            <div className="w-full max-w-xs">
              {leftPlayer}
            </div>
          </div>

          {/* 主游戏区域 */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* 顶部玩家区域 */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {topPlayer}
              </div>
            </div>

            {/* 出牌区域 */}
            <SurfaceCard
              variant="glass"
              elevation="high"
              crt={crt}
              glow={glow}
              className="min-h-[200px] md:min-h-[250px] flex items-center justify-center"
            >
              <div className="w-full">
                {playArea}
              </div>
            </SurfaceCard>

            {/* 控制面板 */}
            <SurfaceCard
              variant="default"
              crt={crt}
              className="p-4"
            >
              {controlPanel}
            </SurfaceCard>

            {/* 底部玩家区域 */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {bottomPlayer}
              </div>
            </div>
          </div>

          {/* 右侧区域（玩家 + 聊天） */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* 右侧玩家区域 */}
            <div className="w-full">
              {rightPlayer}
            </div>

            {/* 聊天面板 */}
            {chatPanel && (
              <SurfaceCard
                variant="dark"
                crt={crt}
                className="h-[300px] flex flex-col"
              >
                {chatPanel}
              </SurfaceCard>
            )}
          </div>
        </div>

        {/* 底部信息栏 */}
        <div className="mt-6 md:mt-8">
          <SurfaceCard
            variant="dark"
            crt={crt}
            className="p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-retro-mono text-retro-text-secondary">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-game-success animate-pulse" />
                  当前玩家
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-retro-primary-500" />
                  AI玩家
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-retro-secondary-500" />
                  人类玩家
                </span>
              </div>
              <div className="text-right">
                <span className="text-retro-primary-400">SYSTEM_ACTIVE</span>
                <span className="mx-2">•</span>
                <span>FRAME_RATE: 60FPS</span>
                <span className="mx-2">•</span>
                <span>PING: 24ms</span>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>

      {/* CRT边框效果 */}
      {crt && (
        <div className="fixed inset-4 pointer-events-none crt-border rounded-2xl" />
      )}
    </div>
  )
}
