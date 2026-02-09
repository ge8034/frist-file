/**
 * 游戏画布组件
 * Phaser 3 游戏引擎集成
 * 基于 Retro-Futurism 设计系统
 * 掼蛋游戏主界面
 */

'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useGameStoreWithRules } from '@/lib/store/gameStoreWithRules'
import { useAuthStore } from '@/lib/store/authStore'
import { Loading } from '@/components/ui/Loading'

interface GameCanvasProps {
  roomId: string
}

// 卡牌接口
interface CardData {
  id: string
  rank: string
  suit: string
  value: number
}

// 玩家接口
interface PlayerData {
  id: string
  name: string
  position: 'top' | 'left' | 'right' | 'bottom'
  isCurrent: boolean
  isAI: boolean
  score: number
  handCount: number
}

// Retro-Futurism 设计系统颜色常量
// 基于 tailwind.config.ts 中定义的设计系统token
const COLORS = {
  // 背景与表面
  background: 0x0f0f23,      // retro.background
  surface: 0x1a1a2e,         // retro.surface

  // 主色调 - 霓虹紫色
  primary: {
    600: 0x7c3aed,           // retro.primary.600
    500: 0x8b5cf6,           // retro.primary.500
    400: 0xa78bfa,           // retro.primary.400
    900: 0x4c1d95,           // retro.primary.900
  },

  // 次要色 - 霓虹青色
  secondary: {
    500: 0x14b8a6,           // retro.secondary.500
    400: 0x2dd4bf,           // retro.secondary.400
  },

  // 强调色 - 霓虹粉色
  accent: {
    500: 0xec4899,           // retro.accent.500
  },

  // 游戏状态色
  game: {
    success: 0x10b981,       // game.success
    warning: 0xf59e0b,       // game.warning
    danger: 0xef4444,        // game.danger
    info: 0x3b82f6,          // game.info
  },

  // 文本颜色 - 与设计系统保持一致
  text: {
    primary: 0xe2e8f0,       // retro.text.primary
    secondary: 0x94a3b8,     // retro.text.secondary
  },

  // 卡牌颜色
  card: {
    red: 0xf87171,           // card.red
    black: 0xcbd5e1,         // card.black
    joker: 0x8b5cf6,         // card.joker
  },

  // 中性色
  neutral: {
    900: 0x0a0a0a,
    800: 0x1f2937,
    700: 0x374151,
    600: 0x4b5563,
  }
}

// Retro-Futurism 设计系统字体族
// 基于 tailwind.config.ts 中定义的字体族
const FONTS = {
  display: 'Russo One, sans-serif',        // font-retro-display
  heading: 'Chakra Petch, sans-serif',     // font-retro-heading
  body: 'Chakra Petch, sans-serif',        // font-retro-body
  mono: 'Share Tech Mono, monospace',      // font-retro-mono
  digital: 'Orbitron, sans-serif',         // font-retro-digital
}

export default function GameCanvas({ roomId }: GameCanvasProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)
  const [gameReady, setGameReady] = useState(false)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [phaserLoading, setPhaserLoading] = useState(true)
  const [phaserError, setPhaserError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // 状态管理
  const { user } = useAuthStore()
  const {
    currentGame,
    playerStates,
    tableCards,
    isLoading,
    error,
    playCards,
    validatePlay,
    subscribeToGameChanges,
    fetchGameState,
    clearError
  } = useGameStoreWithRules()

  // 转换玩家数据为GameCanvas格式
  const players = useMemo(() => {
    if (!playerStates.length) return []

    // 位置映射：按玩家索引分配位置
    const positions: Array<'top' | 'left' | 'right' | 'bottom'> = ['top', 'left', 'right', 'bottom']

    return playerStates.map((player, index) => ({
      id: player.playerId,
      name: player.nickname || `玩家${index + 1}`,
      position: positions[index] || 'top',
      isCurrent: player.isCurrentPlayer,
      isAI: player.playerId.includes('ai') || player.playerId.includes('AI'), // 简单判断AI
      score: player.score,
      handCount: player.hand?.length || 0
    }))
  }, [playerStates])

  // 当前玩家的手牌
  const handCards = useMemo(() => {
    if (!user || !playerStates.length) return []

    const currentPlayer = playerStates.find(p => p.playerId === user.id)
    if (!currentPlayer || !currentPlayer.hand) return []

    // 转换Card实体为CardData格式
    return currentPlayer.hand.map((card: any, index: number) => {
      // 处理大小王
      if (card.isJoker && card.jokerType) {
        return {
          id: card.id || `joker${index + 1}`,
          rank: card.jokerType === 'big' ? '大王' : '小王',
          suit: 'joker',
          value: card.jokerType === 'big' ? 17 : 16
        }
      }

      // 映射花色到符号期望的格式
      const suitMap: Record<string, string> = {
        heart: 'hearts',
        diamond: 'diamonds',
        club: 'clubs',
        spade: 'spades',
        joker: 'joker'
      }

      return {
        id: card.id || `card${index + 1}`,
        rank: card.rank || 'A',
        suit: suitMap[card.suit] || 'hearts',
        value: card.value || 14
      }
    })
  }, [playerStates, user])

  // 出牌区域的卡牌
  const playAreaCards = useMemo(() => {
    if (!tableCards.length) return []

    return tableCards.map((card: any, index: number) => {
      // 处理大小王
      if (card.isJoker && card.jokerType) {
        return {
          id: card.id || `joker${index + 1}`,
          rank: card.jokerType === 'big' ? '大王' : '小王',
          suit: 'joker',
          value: card.jokerType === 'big' ? 17 : 16
        }
      }

      // 映射花色到符号期望的格式
      const suitMap: Record<string, string> = {
        heart: 'hearts',
        diamond: 'diamonds',
        club: 'clubs',
        spade: 'spades',
        joker: 'joker'
      }

      return {
        id: card.id || `play${index + 1}`,
        rank: card.rank || '?',
        suit: suitMap[card.suit] || 'hearts',
        value: card.value || 0
      }
    })
  }, [tableCards])

  // 初始化和订阅游戏状态
  useEffect(() => {
    if (!roomId) return

    // 获取游戏状态
    fetchGameState(roomId)

    // 订阅游戏变化
    const unsubscribe = subscribeToGameChanges(roomId)

    // 组件卸载时取消订阅
    return () => {
      unsubscribe()
    }
  }, [roomId, fetchGameState, subscribeToGameChanges])

  useEffect(() => {
    // 动态导入 Phaser 以避免服务端渲染问题
    const initGame = async () => {
      if (!gameRef.current || phaserGameRef.current) return

      setPhaserLoading(true)
      setPhaserError(null)

      try {
        const Phaser = await import('phaser')

        // 掼蛋游戏主场景
        class MainGameScene extends Phaser.Scene {
          private players: PlayerData[]
          private handCards: CardData[]
          private playAreaCards: CardData[]
          private cardSprites: Map<string, Phaser.GameObjects.Container>
          private playerAreas: Map<string, Phaser.GameObjects.Container>
          private selectedCardIds: Set<string>

          constructor(
            players: PlayerData[],
            handCards: CardData[],
            playAreaCards: CardData[]
          ) {
            super({ key: 'MainGameScene' })
            this.players = players
            this.handCards = handCards
            this.playAreaCards = playAreaCards
            this.cardSprites = new Map()
            this.playerAreas = new Map()
            this.selectedCardIds = new Set()
          }

          preload() {
            // 预加载字体和资源
            this.load.setBaseURL('/')

            // 加载自定义字体
            this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js')
          }

          create() {
            // 设置游戏区域尺寸
            const { width, height } = this.scale

            // 创建 Retro-Futurism 风格背景
            this.createRetroBackground(width, height)

            // 创建玩家区域
            this.createPlayerAreas(width, height)

            // 创建出牌区域
            this.createPlayArea(width, height)

            // 创建手牌区域（仅底部玩家）
            this.createHandCards(width, height)

            // 创建游戏信息显示
            this.createGameInfo(width, height)

            // 将场景实例存储到游戏注册表，供外部访问
            this.game.registry.set('mainScene', this)

            // 设置游戏为就绪状态
            setGameReady(true)
          }

          createRetroBackground(width: number, height: number) {
            // 深空背景 - 使用设计系统颜色
            const bg = this.add.graphics()
            bg.fillStyle(COLORS.background, 1)
            bg.fillRect(0, 0, width, height)

            // CRT网格效果 - 使用设计系统主色调
            const grid = this.add.graphics()
            grid.lineStyle(1, COLORS.primary[600], 0.1)

            // 垂直线
            for (let x = 0; x <= width; x += 40) {
              grid.moveTo(x, 0)
              grid.lineTo(x, height)
            }

            // 水平线
            for (let y = 0; y <= height; y += 40) {
              grid.moveTo(0, y)
              grid.lineTo(width, y)
            }
            grid.strokePath()

            // 霓虹光晕 - 使用多个半透明矩形叠加
            const glow = this.add.graphics()

            // 紫色光晕（左上）- 使用设计系统主色调
            glow.fillStyle(COLORS.primary[600], 0.03)
            glow.fillRect(0, 0, width, height)

            // 青色光晕（中心）- 使用设计系统次要色
            glow.fillStyle(COLORS.secondary[500], 0.02)
            glow.fillRect(width * 0.25, height * 0.25, width * 0.5, height * 0.5)

            // 粉色光晕（右下）- 使用设计系统强调色
            glow.fillStyle(COLORS.accent[500], 0.03)
            glow.fillRect(width * 0.5, height * 0.5, width * 0.5, height * 0.5)

            // 游戏标题 - 使用设计系统字体和颜色
            const title = this.add.text(width / 2, 30, 'GUANDAN2', {
              fontSize: '32px',
              fontFamily: FONTS.display,
              color: `#${COLORS.primary[500].toString(16).padStart(6, '0')}`,
              stroke: `#${COLORS.primary[900].toString(16).padStart(6, '0')}`,
              strokeThickness: 4
            })
            title.setOrigin(0.5)
            title.setShadow(0, 0, `#${COLORS.primary[600].toString(16).padStart(6, '0')}`, 10, true, true)

            // 副标题 - 使用设计系统字体和颜色
            const subtitle = this.add.text(width / 2, 65, 'RETRO-FUTURISM EDITION', {
              fontSize: '14px',
              fontFamily: FONTS.body,
              color: `#${COLORS.secondary[500].toString(16).padStart(6, '0')}`
            })
            subtitle.setOrigin(0.5)
          }

          createPlayerAreas(width: number, height: number) {
            // 定义四个玩家区域的位置
            const positions = {
              top: { x: width / 2, y: 100 },
              left: { x: 100, y: height / 2 },
              right: { x: width - 100, y: height / 2 },
              bottom: { x: width / 2, y: height - 100 }
            }

            this.players.forEach(player => {
              const pos = positions[player.position]
              const container = this.add.container(pos.x, pos.y)

              // 玩家区域背景 - 使用设计系统颜色
              const bg = this.add.graphics()
              const bgColor = player.isCurrent ? COLORS.primary[600] : COLORS.surface
              const borderColor = player.isCurrent ? COLORS.primary[500] : COLORS.primary[900]

              bg.fillStyle(bgColor, 0.8)
              bg.fillRoundedRect(-80, -40, 160, 80, 10)
              bg.lineStyle(2, borderColor, 0.6)
              bg.strokeRoundedRect(-80, -40, 160, 80, 10)

              // 玩家名称 - 使用设计系统字体和颜色
              const nameText = this.add.text(0, -25, player.name, {
                fontSize: '16px',
                fontFamily: FONTS.heading,
                color: player.isCurrent
                  ? `#${COLORS.primary[500].toString(16).padStart(6, '0')}`
                  : `#${COLORS.text.primary.toString(16).padStart(6, '0')}`
              })
              nameText.setOrigin(0.5)

              // 玩家信息 - 使用设计系统字体和颜色
              const infoText = this.add.text(0, 0, `手牌: ${player.handCount}  积分: ${player.score}`, {
                fontSize: '12px',
                fontFamily: FONTS.body,
                color: player.isAI
                  ? `#${COLORS.secondary[500].toString(16).padStart(6, '0')}`
                  : `#${COLORS.text.secondary.toString(16).padStart(6, '0')}`
              })
              infoText.setOrigin(0.5)

              // AI标识 - 使用设计系统字体和颜色
              if (player.isAI) {
                const aiBadge = this.add.text(0, 20, '🤖 AI', {
                  fontSize: '10px',
                  fontFamily: FONTS.body,
                  color: `#${COLORS.secondary[500].toString(16).padStart(6, '0')}`
                })
                aiBadge.setOrigin(0.5)
                container.add(aiBadge)
              }

              // 当前玩家指示器 - 使用设计系统游戏状态色
              if (player.isCurrent) {
                const indicator = this.add.graphics()
                indicator.fillStyle(COLORS.game.success, 1)
                indicator.fillCircle(0, -45, 8)
                container.add(indicator)
              }

              container.add([bg, nameText, infoText])
              this.playerAreas.set(player.id, container)

              // 添加悬停效果
              bg.setInteractive(new Phaser.Geom.Rectangle(-80, -40, 160, 80), Phaser.Geom.Rectangle.Contains)
              bg.on('pointerover', () => {
                bg.clear()
                bg.fillStyle(bgColor, 0.9)
                bg.fillRoundedRect(-80, -40, 160, 80, 10)
                bg.lineStyle(3, borderColor, 0.8)
                bg.strokeRoundedRect(-80, -40, 160, 80, 10)
              })
              bg.on('pointerout', () => {
                bg.clear()
                bg.fillStyle(bgColor, 0.8)
                bg.fillRoundedRect(-80, -40, 160, 80, 10)
                bg.lineStyle(2, borderColor, 0.6)
                bg.strokeRoundedRect(-80, -40, 160, 80, 10)
              })
            })
          }

          createPlayArea(width: number, height: number) {
            const centerX = width / 2
            const centerY = height / 2

            // 出牌区域背景 - 使用设计系统颜色
            const playAreaBg = this.add.graphics()
            playAreaBg.fillStyle(COLORS.surface, 0.7)
            playAreaBg.fillRoundedRect(centerX - 200, centerY - 100, 400, 200, 15)
            playAreaBg.lineStyle(3, COLORS.primary[600], 0.4)
            playAreaBg.strokeRoundedRect(centerX - 200, centerY - 100, 400, 200, 15)

            // 出牌区域标题 - 使用设计系统字体和颜色
            const playAreaTitle = this.add.text(centerX, centerY - 80, '出牌区域', {
              fontSize: '18px',
              fontFamily: FONTS.heading,
              color: `#${COLORS.primary[500].toString(16).padStart(6, '0')}`
            })
            playAreaTitle.setOrigin(0.5)

            // 显示当前牌型（模拟）- 使用设计系统字体和颜色
            const patternText = this.add.text(centerX, centerY, '当前牌型: 对K', {
              fontSize: '14px',
              fontFamily: FONTS.body,
              color: `#${COLORS.secondary[500].toString(16).padStart(6, '0')}`
            })
            patternText.setOrigin(0.5)

            // 渲染出牌区域的卡牌
            this.renderPlayAreaCards(centerX, centerY)
          }

          renderPlayAreaCards(centerX: number, centerY: number) {
            const cardWidth = 40
            const cardHeight = 60
            const spacing = 10

            this.playAreaCards.forEach((card, index) => {
              const x = centerX - (this.playAreaCards.length * (cardWidth + spacing)) / 2 + index * (cardWidth + spacing) + cardWidth / 2
              const y = centerY + 20

              const cardContainer = this.createCardSprite(x, y, cardWidth, cardHeight, card, false)
              cardContainer.setScale(0.8)
            })
          }

          createHandCards(width: number, height: number) {
            const startX = width / 2 - (this.handCards.length * 35) / 2 + 17.5
            const y = height - 80

            this.handCards.forEach((card, index) => {
              const x = startX + index * 35
              const cardContainer = this.createCardSprite(x, y, 60, 90, card, true)
              this.cardSprites.set(card.id, cardContainer)
            })
          }

          createCardSprite(x: number, y: number, width: number, height: number, card: CardData, interactive: boolean) {
            const container = this.add.container(x, y)

            // 卡牌背景 - 使用设计系统卡牌颜色
            const bg = this.add.graphics()
            const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
            const bgColor = isRed ? COLORS.neutral[900] : COLORS.neutral[900]
            const borderColor = isRed ? COLORS.card.red : COLORS.card.black

            bg.fillStyle(bgColor, 1)
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
            bg.lineStyle(2, borderColor, 0.8)
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)

            // 卡牌数值 - 使用设计系统字体和颜色
            const rankText = this.add.text(-width / 2 + 8, -height / 2 + 8, card.rank, {
              fontSize: '14px',
              fontFamily: FONTS.body,
              color: isRed
                ? `#${COLORS.card.red.toString(16).padStart(6, '0')}`
                : `#${COLORS.card.black.toString(16).padStart(6, '0')}`,
              fontStyle: 'bold'
            })

            // 卡牌花色 - 使用设计系统字体和颜色
            const suitSymbol = this.getSuitSymbol(card.suit)
            const suitText = this.add.text(-width / 2 + 8, -height / 2 + 25, suitSymbol, {
              fontSize: '12px',
              fontFamily: FONTS.body,
              color: isRed
                ? `#${COLORS.card.red.toString(16).padStart(6, '0')}`
                : `#${COLORS.card.black.toString(16).padStart(6, '0')}`
            })

            // 中间大花色 - 使用设计系统字体和颜色
            const centerSuit = this.add.text(0, 0, suitSymbol, {
              fontSize: '24px',
              fontFamily: FONTS.body,
              color: isRed
                ? `#${COLORS.card.red.toString(16).padStart(6, '0')}`
                : `#${COLORS.card.black.toString(16).padStart(6, '0')}`,
              fontStyle: 'bold'
            })
            centerSuit.setOrigin(0.5)

            container.add([bg, rankText, suitText, centerSuit])

            // 添加交互
            if (interactive) {
              bg.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains)

              bg.on('pointerover', () => {
                container.y -= 10
                bg.clear()
                bg.fillStyle(bgColor, 1)
                bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
                bg.lineStyle(3, borderColor, 1)
                bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
              })

              bg.on('pointerout', () => {
                container.y += 10
                bg.clear()
                bg.fillStyle(bgColor, 1)
                bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
                bg.lineStyle(2, borderColor, 0.8)
                bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
              })

              bg.on('pointerdown', () => {
                this.toggleCardSelection(card.id, container, bg, width, height, bgColor, borderColor)
              })
            }

            return container
          }

          getSuitSymbol(suit: string): string {
            switch(suit) {
              case 'hearts': return '♥'
              case 'diamonds': return '♦'
              case 'clubs': return '♣'
              case 'spades': return '♠'
              case 'joker': return '★'
              default: return '?'
            }
          }

          toggleCardSelection(cardId: string, container: Phaser.GameObjects.Container, bg: Phaser.GameObjects.Graphics, width: number, height: number, bgColor: number, borderColor: number) {
            if (this.selectedCardIds.has(cardId)) {
              this.selectedCardIds.delete(cardId)
              container.y += 20
              bg.clear()
              bg.fillStyle(bgColor, 1)
              bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
              bg.lineStyle(2, borderColor, 0.8)
              bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
            } else {
              this.selectedCardIds.add(cardId)
              container.y -= 20
              bg.clear()
              bg.fillStyle(COLORS.primary[600], 0.3)
              bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
              bg.lineStyle(3, COLORS.primary[500], 1)
              bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
            }

            // 更新React状态
            setSelectedCards(Array.from(this.selectedCardIds))
          }

          createGameInfo(width: number, height: number) {
            // 房间信息 - 使用设计系统字体和颜色
            const roomInfo = this.add.text(20, height - 30, `房间: ${roomId}`, {
              fontSize: '12px',
              fontFamily: FONTS.mono,
              color: `#${COLORS.secondary[500].toString(16).padStart(6, '0')}`
            })

            // 游戏状态 - 使用设计系统字体和颜色
            const gameStatus = this.add.text(width - 20, height - 30, '状态: 游戏中', {
              fontSize: '12px',
              fontFamily: FONTS.mono,
              color: `#${COLORS.game.success.toString(16).padStart(6, '0')}`
            })
            gameStatus.setOrigin(1, 0)

            // 回合信息 - 使用设计系统字体和颜色
            const turnInfo = this.add.text(width / 2, height - 30, '第 3 轮 | 剩余时间: 01:23', {
              fontSize: '12px',
              fontFamily: FONTS.mono,
              color: `#${COLORS.text.primary.toString(16).padStart(6, '0')}`
            })
            turnInfo.setOrigin(0.5, 0)
          }

          updateGameData(newPlayers: PlayerData[], newHandCards: CardData[], newPlayAreaCards: CardData[]) {
            // 更新内部数据
            this.players = newPlayers
            this.handCards = newHandCards
            this.playAreaCards = newPlayAreaCards

            // 清除现有游戏对象并重新渲染
            this.clearGameObjects()
            this.renderGameObjects()
          }

          clearGameObjects() {
            // 清除玩家区域
            this.playerAreas.forEach(area => {
              area.destroy()
            })
            this.playerAreas.clear()

            // 清除卡牌精灵
            this.cardSprites.forEach(sprite => {
              sprite.destroy()
            })
            this.cardSprites.clear()

            // 清除出牌区域的卡牌（通过标签查找）
            this.children.each((child: any) => {
              if (child.getData && child.getData('isPlayAreaCard')) {
                child.destroy()
              }
            })
          }

          renderGameObjects() {
            const { width, height } = this.scale

            // 重新创建玩家区域
            this.createPlayerAreas(width, height)

            // 重新创建出牌区域（只创建卡牌，不创建背景）
            const centerX = width / 2
            const centerY = height / 2
            this.renderPlayAreaCards(centerX, centerY)

            // 重新创建手牌区域
            this.createHandCards(width, height)
          }

          update() {
            // 游戏逻辑更新
            // 可以在这里添加动画或状态更新
          }
        }

        // 游戏配置 - 响应式高度
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: gameRef.current.clientWidth,
          height: gameRef.current.clientHeight,
          parent: gameRef.current,
          backgroundColor: `#${COLORS.background.toString(16).padStart(6, '0')}`,
          scene: new MainGameScene([], [], []), // 初始化为空，数据通过updateGameData更新
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
          },
          physics: {
            default: 'arcade',
            arcade: {
              debug: false
            }
          }
        }

        // 创建游戏实例
        const game = new Phaser.Game(config)
        phaserGameRef.current = game

        // 响应窗口大小变化
        const handleResize = () => {
          if (game && game.scale && gameRef.current) {
            game.scale.resize(gameRef.current.clientWidth, gameRef.current.clientHeight)
          }
        }

        window.addEventListener('resize', handleResize)

        // 设置加载完成状态
        setPhaserLoading(false)
        setGameReady(true)

        // 清理函数
        return () => {
          window.removeEventListener('resize', handleResize)
        }
      } catch (error) {
        console.error('加载 Phaser 失败:', error)
        setPhaserError(`Phaser加载失败: ${error instanceof Error ? error.message : '未知错误'}`)
        setPhaserLoading(false)
      }
    }

    initGame()

    // 组件卸载时销毁游戏
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [roomId]) // 只在roomId变化时重新创建游戏

  // 处理游戏动作
  const handlePlayCards = async () => {
    if (selectedCards.length === 0) {
      alert('请选择要出的牌！')
      return
    }

    if (!user || !playerStates.length) {
      alert('请先登录！')
      return
    }

    // 获取当前玩家的手牌（Card实体数组）
    const currentPlayer = playerStates.find(p => p.playerId === user.id)
    if (!currentPlayer || !currentPlayer.hand) {
      alert('无法获取手牌数据！')
      return
    }

    // 根据选中的ID筛选出Card实体
    const cardsToPlay = currentPlayer.hand.filter((card: any) =>
      selectedCards.includes(card.id)
    )

    if (cardsToPlay.length !== selectedCards.length) {
      alert('部分选中的牌不在手牌中！')
      return
    }

    try {
      // 调用状态管理的出牌方法
      const result = await playCards(user.id, cardsToPlay)

      if (result.valid) {
        // 出牌成功，清空选中状态
        setSelectedCards([])
        // 可以显示成功消息
        console.log('出牌成功:', result.message)
      } else {
        // 出牌失败，显示错误
        alert(`出牌失败: ${result.message}`)
      }
    } catch (error) {
      console.error('出牌出错:', error)
      alert('出牌过程中发生错误')
    }
  }

  const handlePass = async () => {
    if (!user) {
      alert('请先登录！')
      return
    }

    try {
      // 过牌：传入空数组表示不出牌
      const result = await playCards(user.id, [])

      if (result.valid) {
        // 过牌成功，清空选中状态
        setSelectedCards([])
        console.log('过牌成功:', result.message)
      } else {
        // 过牌失败，显示错误
        alert(`过牌失败: ${result.message}`)
      }
    } catch (error) {
      console.error('过牌出错:', error)
      alert('过牌过程中发生错误')
    }
  }

  const handleHint = () => {
    alert('提示: 尝试出对子或顺子')
  }

  // 重试加载Phaser
  const handleRetryPhaser = () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true)
      phaserGameRef.current = null
    }

    setGameReady(false)
    setPhaserError(null)
    setRetryCount(prev => prev + 1)

    // 重新触发Phaser初始化
    const initGame = async () => {
      if (!gameRef.current) return

      setPhaserLoading(true)

      try {
        const Phaser = await import('phaser')

        // 重新创建游戏配置
        const config: any = {
          type: Phaser.AUTO,
          width: gameRef.current.clientWidth,
          height: gameRef.current.clientHeight,
          parent: gameRef.current,
          backgroundColor: `#${COLORS.background.toString(16).padStart(6, '0')}`,
          scene: new (class extends Phaser.Scene {
            constructor() {
              super({ key: 'RetryScene' })
            }
            create() {
              this.add.text(100, 100, '游戏重新加载中...', {
                fontSize: '24px',
                fontFamily: FONTS.display,
                color: `#${COLORS.primary[500].toString(16).padStart(6, '0')}`
              })
              setGameReady(true)
            }
          })(),
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
          }
        }

        const game = new Phaser.Game(config)
        phaserGameRef.current = game
        setPhaserLoading(false)
      } catch (error) {
        console.error('重试加载 Phaser 失败:', error)
        setPhaserError(`重试失败: ${error instanceof Error ? error.message : '未知错误'}`)
        setPhaserLoading(false)
      }
    }

    initGame()
  }

  // 监听游戏数据变化并更新Phaser场景
  useEffect(() => {
    if (!gameReady || !phaserGameRef.current) return

    try {
      // 从游戏注册表获取场景实例
      const game = phaserGameRef.current
      const scene = game.registry.get('mainScene')

      if (scene && scene.updateGameData) {
        scene.updateGameData(players, handCards, playAreaCards)
      }
    } catch (error) {
      console.error('更新游戏数据失败:', error)
    }
  }, [gameReady, players, handCards, playAreaCards])

  // 显示加载状态
  if (phaserLoading) {
    return (
      <div className="relative w-full min-h-[400px] md:h-[600px] rounded-xl overflow-hidden border-2 border-retro-primary-500/30 shadow-lg shadow-neon-primary">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-retro-background/90 crt-scanlines">
          <Loading
            variant="scanline"
            size="xl"
            showText
            text="正在加载游戏引擎..."
            textPosition="bottom"
            crt
            glow
            fullWidth
            fullHeight
          />
          <div className="mt-8 text-sm font-retro-mono text-retro-text-secondary">
            初始化 Phaser 3 游戏引擎...
          </div>
        </div>
      </div>
    )
  }

  // 显示错误状态
  if (phaserError) {
    return (
      <div className="relative w-full min-h-[400px] md:h-[600px] rounded-xl overflow-hidden border-2 border-game-danger/30 shadow-lg shadow-neon-danger">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-retro-background/90 crt-scanlines p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-game-danger/50 rounded-full shadow-neon-danger mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
                ⚠️
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-retro-display text-game-danger">
                游戏引擎加载失败
              </h3>
              <p className="text-retro-text-secondary font-retro-body">
                {phaserError}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleRetryPhaser}
                className="px-5 py-2.5 bg-gradient-to-r from-retro-primary-600 to-retro-primary-500 text-white font-retro-heading rounded-lg hover:from-retro-primary-700 hover:to-retro-primary-600 transition-all duration-300 shadow-neon-primary"
              >
                🔄 重试加载
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-gradient-to-r from-retro-surface to-retro-primary-900 text-white font-retro-heading rounded-lg hover:from-retro-surface/90 hover:to-retro-primary-800 transition-all duration-300 shadow-neon-primary"
              >
                🔄 刷新页面
              </button>
            </div>

            <div className="text-xs font-retro-mono text-retro-text-secondary/50 pt-4 border-t border-retro-primary-900/30">
              <div>重试次数: {retryCount}</div>
              <div>建议使用 Chrome 或 Firefox 浏览器</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* 游戏画布容器 - 响应式高度 */}
      <div
        ref={gameRef}
        className="w-full min-h-[300px] retro-sm:min-h-[350px] md:h-[600px] rounded-xl overflow-hidden border-2 border-retro-primary-500/30 shadow-lg shadow-neon-primary"
      >
        {/* Phaser 游戏将渲染在这里 */}
      </div>

      {/* 游戏控制面板 */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-retro-surface/50 backdrop-blur-sm border border-retro-primary-500/30 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <div className="text-sm text-retro-primary-400">
              已选择: <span className="text-retro-primary-500 font-bold">{selectedCards.length}</span> 张牌
            </div>
            <div className="text-sm text-retro-primary-400">
              房间: <span className="text-retro-secondary-500">{roomId}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handlePlayCards}
              disabled={selectedCards.length === 0}
              className="px-3 py-1.5 md:px-5 md:py-2.5 bg-gradient-to-r from-game-success to-retro-secondary-500 text-white font-medium rounded-lg hover:from-game-success/90 hover:to-retro-secondary-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-neon-success text-sm md:text-base"
            >
              🎴 出牌
            </button>

            <button
              onClick={handlePass}
              className="px-3 py-1.5 md:px-5 md:py-2.5 bg-gradient-to-r from-game-warning to-retro-accent-500 text-white font-medium rounded-lg hover:from-game-warning/90 hover:to-retro-accent-600 active:scale-95 transition-all duration-300 shadow-lg shadow-neon-warning text-sm md:text-base"
            >
              ⏭️ 过牌
            </button>

            <button
              onClick={handleHint}
              className="px-3 py-1.5 md:px-5 md:py-2.5 bg-gradient-to-r from-game-info to-retro-primary-500 text-white font-medium rounded-lg hover:from-game-info/90 hover:to-retro-primary-600 active:scale-95 transition-all duration-300 shadow-lg shadow-neon-info text-sm md:text-base"
            >
              💡 提示
            </button>

            <button
              onClick={() => setSelectedCards([])}
              className="px-3 py-1.5 md:px-5 md:py-2.5 bg-gradient-to-r from-retro-surface to-retro-primary-900 text-white font-medium rounded-lg hover:from-retro-surface/90 hover:to-retro-primary-800 active:scale-95 transition-all duration-300 shadow-lg shadow-neon-primary text-sm md:text-base"
            >
              ↩️ 取消选择
            </button>
          </div>
        </div>

        {/* 游戏状态信息 */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-retro-primary-900">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-retro-surface/50 rounded-lg">
              <div className="text-xs text-retro-primary-400">当前回合</div>
              <div className="text-base sm:text-lg font-bold text-white">3/8</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-retro-surface/50 rounded-lg">
              <div className="text-xs text-retro-primary-400">剩余时间</div>
              <div className="text-base sm:text-lg font-bold text-game-success">01:23</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-retro-surface/50 rounded-lg">
              <div className="text-xs text-retro-primary-400">炸弹数量</div>
              <div className="text-base sm:text-lg font-bold text-game-warning">2</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-retro-surface/50 rounded-lg">
              <div className="text-xs text-retro-primary-400">游戏状态</div>
              <div className="text-base sm:text-lg font-bold text-game-info">游戏中</div>
            </div>
          </div>
        </div>
      </div>

      {/* CRT扫描线效果 */}
      <div className="fixed inset-0 crt-scanlines pointer-events-none z-10"></div>

      {/* 霓辉光背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-retro-primary-500/5 via-retro-secondary-500/3 to-retro-accent-500/5 rounded-xl pointer-events-none"></div>

      {/* 画布装饰角 */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-retro-primary-500 opacity-70"></div>
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-retro-secondary-500 opacity-70"></div>
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-retro-secondary-500 opacity-70"></div>
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-retro-primary-500 opacity-70"></div>
    </div>
  )
}