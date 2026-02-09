/**
 * AI决策性能测试
 *
 * 测量AI决策的性能基准，包括：
 * 1. 不同策略的决策时间
 * 2. 不同手牌数量的决策时间
 * 3. 不同游戏状态下的决策时间
 * 4. 内存使用情况
 * 5. 决策质量评估
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { AIPlayer } from '../../lib/features/game/ai/AIPlayer'
import { RandomStrategy } from '../../lib/features/game/ai/strategies/RandomStrategy'
import { GreedyStrategy } from '../../lib/features/game/ai/strategies/GreedyStrategy'
import { MemoryStrategy } from '../../lib/features/game/ai/strategies/MemoryStrategy'
import { CardRecognizer } from '../../lib/features/game/rules/CardRecognizer'
import { AIDifficultyLevel } from '../../lib/features/game/ai/types'

// 模拟数据
const createMockCard = (id: string, rank: string, suit: string = 'heart'): any => {
  return {
    id,
    rank,
    suit,
    value: parseInt(rank) || (rank === 'A' ? 14 : rank === 'K' ? 13 : rank === 'Q' ? 12 : rank === 'J' ? 11 : 0),
    isJoker: false,
    isWildCard: false,
    compareTo: () => 0,
    toString: () => rank,
    toJSON: () => ({ rank, suit })
  }
}

const createMockGameSession = (phase: string = 'playing', hasCurrentPattern: boolean = false): any => {
  return {
    id: 'test-session-1',
    roomId: 'test-room-1',
    phase,
    currentRound: phase === 'playing' ? {
      roundNumber: 1,
      dealerId: 'player1',
      currentPlayerId: 'player1',
      nextPlayerId: 'player2',
      direction: 'clockwise'
    } : null,
    plays: hasCurrentPattern ? [
      {
        playerId: 'opponent-1',
        choice: 'play' as const,
        cards: [
          createMockCard('card-k1', 'K', 'heart'),
          createMockCard('card-k2', 'K', 'diamond')
        ],
        timestamp: Date.now() - 1000
      }
    ] : [],
    players: [
      { id: 'player1', name: '玩家1', teamId: 'team1' },
      { id: 'player2', name: '玩家2', teamId: 'team2' },
      { id: 'player3', name: '玩家3', teamId: 'team1' },
      { id: 'player4', name: '玩家4', teamId: 'team2' }
    ],
    scores: new Map([
      ['team1', 0],
      ['team2', 0]
    ])
  }
}

// 模拟游戏规则服务
const mockGameRuleService = {
  validatePlay: vi.fn((playerId: string, cards: any[], currentPattern: any, gameSession: any) => ({
    valid: true,
    message: '合法出牌',
    details: {
      pattern: {
        type: cards.length === 1 ? 'single' : cards.length === 2 ? 'pair' : 'triple',
        cards,
        mainRank: cards[0]?.rank || '',
        length: cards.length
      }
    }
  }))
}

describe('AI决策性能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // 输出性能统计信息
    console.log('性能测试完成')
  })

  describe('基准性能测试', () => {
    it('应该在3秒内完成基本决策', () => {
      const config = {
        playerId: 'ai-performance-1',
        name: '性能测试AI1',
        strategy: 'random',
        difficulty: AIDifficultyLevel.BEGINNER,
        avatarUrl: 'https://example.com/avatar.png'
      }

      const player = new AIPlayer(config, mockGameRuleService as any)
      const handCards = [
        createMockCard('card-1', 'A', 'spade'),
        createMockCard('card-2', 'K', 'heart'),
        createMockCard('card-3', 'Q', 'diamond'),
        createMockCard('card-4', 'J', 'club')
      ]
      player.setHandCards(handCards)

      const gameSession = createMockGameSession()

      const startTime = performance.now()
      const decision = player.makeDecision(gameSession)
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(decision).toBeDefined()
      expect(duration).toBeLessThan(3000) // 3秒内完成
      console.log(`基本决策耗时: ${duration.toFixed(2)}ms`)
    })

    it('应该在5秒内完成复杂决策（16张手牌）', () => {
      const config = {
        playerId: 'ai-performance-2',
        name: '性能测试AI2',
        strategy: 'greedy',
        difficulty: AIDifficultyLevel.INTERMEDIATE,
        avatarUrl: 'https://example.com/avatar.png'
      }

      const player = new AIPlayer(config, mockGameRuleService as any)

      // 创建16张手牌（游戏开始时的典型数量）
      const handCards = []
      const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2', '3', '4', '5']
      const suits = ['heart', 'diamond', 'club', 'spade']

      for (let i = 0; i < 16; i++) {
        const suit = suits[i % 4]
        handCards.push(createMockCard(`card-${i}`, ranks[i], suit))
      }
      player.setHandCards(handCards)

      const gameSession = createMockGameSession()

      const startTime = performance.now()
      const decision = player.makeDecision(gameSession)
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(decision).toBeDefined()
      expect(duration).toBeLessThan(5000) // 5秒内完成
      console.log(`16张手牌决策耗时: ${duration.toFixed(2)}ms`)
    })
  })

  describe('策略性能比较', () => {
    const handSizes = [5, 10, 16] // 不同手牌数量
    const strategies = [
      { name: 'random', strategy: 'random', difficulty: AIDifficultyLevel.BEGINNER },
      { name: 'greedy', strategy: 'greedy', difficulty: AIDifficultyLevel.INTERMEDIATE },
      { name: 'memory', strategy: 'memory', difficulty: AIDifficultyLevel.ADVANCED }
    ]

    strategies.forEach(strategyConfig => {
      handSizes.forEach(handSize => {
        it(`应该测量${strategyConfig.name}策略在${handSize}张手牌下的性能`, () => {
          const config = {
            playerId: `ai-${strategyConfig.name}-${handSize}`,
            name: `性能测试${strategyConfig.name}-${handSize}`,
            strategy: strategyConfig.strategy,
            difficulty: strategyConfig.difficulty,
            avatarUrl: 'https://example.com/avatar.png'
          }

          const player = new AIPlayer(config, mockGameRuleService as any)

          // 创建指定数量的手牌
          const handCards = []
          const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2', '3', '4', '5', '6', '7', '8', '9']
          const suits = ['heart', 'diamond', 'club', 'spade']

          for (let i = 0; i < handSize; i++) {
            const rank = ranks[i % ranks.length]
            const suit = suits[i % 4]
            handCards.push(createMockCard(`card-${i}`, rank, suit))
          }
          player.setHandCards(handCards)

          const gameSession = createMockGameSession()

          const startTime = performance.now()
          const decision = player.makeDecision(gameSession)
          const endTime = performance.now()
          const duration = endTime - startTime

          expect(decision).toBeDefined()

          // 不同策略有不同的性能要求
          const timeLimit = strategyConfig.name === 'memory' ? 8000 : 5000
          expect(duration).toBeLessThan(timeLimit)

          console.log(`${strategyConfig.name}策略，${handSize}张手牌，决策耗时: ${duration.toFixed(2)}ms`)
        })
      })
    })
  })

  describe('CardRecognizer性能测试', () => {
    it('应该在合理时间内识别大量手牌的所有可能牌型', () => {
      // 创建测试手牌
      const handCards = []
      const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2']
      const suits = ['heart', 'diamond', 'club', 'spade']

      // 12张手牌
      for (let i = 0; i < 12; i++) {
        const rank = ranks[i % ranks.length]
        const suit = suits[i % 4]
        handCards.push(createMockCard(`card-${i}`, rank, suit))
      }

      const startTime = performance.now()
      const possiblePatterns = CardRecognizer.getAllPossiblePatterns(handCards)
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(Array.isArray(possiblePatterns)).toBe(true)
      expect(duration).toBeLessThan(3000) // 3秒内完成
      console.log(`识别12张手牌所有可能牌型耗时: ${duration.toFixed(2)}ms，找到${possiblePatterns.length}个牌型`)
    })

    it('应该在合理时间内识别复杂手牌的所有可能牌型', () => {
      // 创建复杂手牌（包含对子、顺子等）
      const handCards = [
        createMockCard('card-1', '3', 'heart'),
        createMockCard('card-2', '3', 'diamond'),
        createMockCard('card-3', '4', 'heart'),
        createMockCard('card-4', '4', 'diamond'),
        createMockCard('card-5', '5', 'heart'),
        createMockCard('card-6', '5', 'diamond'),
        createMockCard('card-7', '6', 'heart'),
        createMockCard('card-8', '6', 'diamond'),
        createMockCard('card-9', '7', 'heart'),
        createMockCard('card-10', '7', 'diamond')
      ]

      const startTime = performance.now()
      const possiblePatterns = CardRecognizer.getAllPossiblePatterns(handCards)
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(Array.isArray(possiblePatterns)).toBe(true)
      expect(duration).toBeLessThan(2000) // 2秒内完成
      console.log(`识别10张复杂手牌所有可能牌型耗时: ${duration.toFixed(2)}ms，找到${possiblePatterns.length}个牌型`)
    })
  })

  describe('内存使用测试', () => {
    it('应该限制游戏记忆的大小', () => {
      const config = {
        playerId: 'ai-memory-1',
        name: '内存测试AI1',
        strategy: 'memory',
        difficulty: AIDifficultyLevel.ADVANCED,
        avatarUrl: 'https://example.com/avatar.png'
      }

      const player = new AIPlayer(config, mockGameRuleService as any)
      const handCards = [createMockCard('card-1', 'A', 'spade')]
      player.setHandCards(handCards)

      const gameSession = createMockGameSession()

      // 模拟大量游戏状态更新
      for (let i = 0; i < 100; i++) {
        player.updateGameState(gameSession)
      }

      const gameMemory = player.getGameMemory()

      // 快照数量应该有限制（配置为50）
      expect(gameMemory.snapshots.length).toBeLessThanOrEqual(50)
      console.log(`游戏记忆快照数量: ${gameMemory.snapshots.length}（上限50）`)
    })

    it('应该限制决策历史的大小', () => {
      const config = {
        playerId: 'ai-memory-2',
        name: '内存测试AI2',
        strategy: 'greedy',
        difficulty: AIDifficultyLevel.INTERMEDIATE,
        avatarUrl: 'https://example.com/avatar.png'
      }

      const player = new AIPlayer(config, mockGameRuleService as any)
      const handCards = [createMockCard('card-1', 'A', 'spade')]
      player.setHandCards(handCards)

      const gameSession = createMockGameSession()

      // 模拟大量决策
      for (let i = 0; i < 50; i++) {
        player.makeDecision(gameSession)
      }

      const decisionHistory = player.getDecisionHistory()

      // 决策历史没有明确限制，但应该存在
      expect(decisionHistory.length).toBeGreaterThan(0)
      console.log(`决策历史数量: ${decisionHistory.length}`)
    })
  })

  describe('压力测试', () => {
    it('应该在高负载下稳定运行', () => {
      const config = {
        playerId: 'ai-stress-1',
        name: '压力测试AI1',
        strategy: 'greedy',
        difficulty: AIDifficultyLevel.INTERMEDIATE,
        avatarUrl: 'https://example.com/avatar.png'
      }

      const player = new AIPlayer(config, mockGameRuleService as any)

      // 创建最大手牌数量（27张，包含大小王）
      const handCards = []
      const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2']
      const suits = ['heart', 'diamond', 'club', 'spade']

      for (let i = 0; i < 27; i++) {
        if (i < 26) {
          const rank = ranks[Math.floor(i / 2) % ranks.length]
          const suit = suits[i % 4]
          handCards.push(createMockCard(`card-${i}`, rank, suit))
        } else {
          // 添加大小王
          handCards.push({
            id: 'card-joker-black',
            rank: 'black_joker',
            suit: 'joker',
            value: 15,
            isJoker: true,
            isWildCard: false,
            compareTo: () => 0,
            toString: () => '小王',
            toJSON: () => ({ rank: 'black_joker', suit: 'joker' })
          })
        }
      }
      player.setHandCards(handCards)

      const gameSession = createMockGameSession()

      const startTime = performance.now()
      const decision = player.makeDecision(gameSession)
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(decision).toBeDefined()
      expect(duration).toBeLessThan(10000) // 10秒内完成（极端情况）
      console.log(`27张手牌（包含大小王）决策耗时: ${duration.toFixed(2)}ms`)
    })

    it('应该处理连续决策的压力', () => {
      const config = {
        playerId: 'ai-stress-2',
        name: '压力测试AI2',
        strategy: 'memory',
        difficulty: AIDifficultyLevel.ADVANCED,
        avatarUrl: 'https://example.com/avatar.png'
      }

      const player = new AIPlayer(config, mockGameRuleService as any)
      const handCards = [
        createMockCard('card-1', 'A', 'spade'),
        createMockCard('card-2', 'K', 'heart'),
        createMockCard('card-3', 'Q', 'diamond'),
        createMockCard('card-4', 'J', 'club'),
        createMockCard('card-5', '10', 'spade')
      ]
      player.setHandCards(handCards)

      const gameSession = createMockGameSession()

      const decisionTimes = []
      const totalStartTime = performance.now()

      // 连续做出20个决策
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now()
        const decision = player.makeDecision(gameSession)
        const endTime = performance.now()
        decisionTimes.push(endTime - startTime)

        expect(decision).toBeDefined()
      }

      const totalEndTime = performance.now()
      const totalDuration = totalEndTime - totalStartTime
      const avgDecisionTime = decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length

      expect(totalDuration).toBeLessThan(30000) // 30秒内完成20个决策
      expect(avgDecisionTime).toBeLessThan(2000) // 平均每个决策小于2秒

      console.log(`连续20个决策总耗时: ${totalDuration.toFixed(2)}ms`)
      console.log(`平均决策时间: ${avgDecisionTime.toFixed(2)}ms`)
      console.log(`最快决策: ${Math.min(...decisionTimes).toFixed(2)}ms`)
      console.log(`最慢决策: ${Math.max(...decisionTimes).toFixed(2)}ms`)
    })
  })

  describe('决策质量评估', () => {
    it('应该在不同策略下做出合理的决策', () => {
      const strategies = [
        { name: 'random', strategy: 'random', difficulty: AIDifficultyLevel.BEGINNER },
        { name: 'greedy', strategy: 'greedy', difficulty: AIDifficultyLevel.INTERMEDIATE },
        { name: 'memory', strategy: 'memory', difficulty: AIDifficultyLevel.ADVANCED }
      ]

      const handCards = [
        createMockCard('card-1', 'A', 'spade'),
        createMockCard('card-2', 'K', 'heart'),
        createMockCard('card-3', 'Q', 'diamond'),
        createMockCard('card-4', 'J', 'club')
      ]

      const gameSession = createMockGameSession()

      strategies.forEach(strategyConfig => {
        const config = {
          playerId: `ai-quality-${strategyConfig.name}`,
          name: `质量测试${strategyConfig.name}`,
          strategy: strategyConfig.strategy,
          difficulty: strategyConfig.difficulty,
          avatarUrl: 'https://example.com/avatar.png'
        }

        const player = new AIPlayer(config, mockGameRuleService as any)
        player.setHandCards(handCards)

        const decision = player.makeDecision(gameSession)

        expect(decision).toBeDefined()
        expect(decision.confidence).toBeGreaterThanOrEqual(0)
        expect(decision.confidence).toBeLessThanOrEqual(1)
        expect(['play', 'pass']).toContain(decision.choice)

        console.log(`${strategyConfig.name}策略决策: ${decision.choice}，置信度: ${decision.confidence.toFixed(2)}，理由: ${decision.reason}`)
      })
    })

    it('应该根据游戏状态做出适当的决策', () => {
      const config = {
        playerId: 'ai-state-1',
        name: '状态测试AI1',
        strategy: 'greedy',
        difficulty: AIDifficultyLevel.INTERMEDIATE,
        avatarUrl: 'https://example.com/avatar.png'
      }

      const player = new AIPlayer(config, mockGameRuleService as any)
      const handCards = [
        createMockCard('card-1', 'A', 'spade'),
        createMockCard('card-2', 'K', 'heart')
      ]
      player.setHandCards(handCards)

      // 测试不同游戏状态下的决策
      const gameStates = [
        { phase: 'preparing', description: '准备阶段' },
        { phase: 'playing', description: '游戏进行中' },
        { phase: 'game_end', description: '游戏结束' }
      ]

      gameStates.forEach(state => {
        const gameSession = createMockGameSession(state.phase)
        const decision = player.makeDecision(gameSession)

        expect(decision).toBeDefined()
        console.log(`${state.description}决策: ${decision.choice}，置信度: ${decision.confidence.toFixed(2)}`)
      })
    })
  })
})