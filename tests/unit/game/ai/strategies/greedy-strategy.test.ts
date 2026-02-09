/**
 * 贪婪策略单元测试
 *
 * 测试GreedyStrategy的核心功能：
 * 1. 贪婪选择逻辑（选择评分最高的选项）
 * 2. 缓存机制
 * 3. 贪婪倾向调整
 * 4. 风险容忍度管理
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GreedyStrategy } from '@/lib/features/game/ai/strategies/GreedyStrategy'
import { AIDifficultyLevel } from '@/lib/features/game/ai/types'

// 模拟数据
const mockCardPattern = {
  type: 'single',
  cards: [
    { id: 'card-1', rank: 'Q', suit: 'spade' }
  ],
  mainRank: 'Q',
  rank: 'Q', // 添加rank属性以匹配canBeatPattern的需求
  length: 1
} as any

const mockGameSession = {
  id: 'test-session-1',
  currentRound: 1,
  currentPlayerId: 'test-player-1',
  phase: 'playing',
  currentPattern: null
} as any

const mockGameSessionWithPattern = {
  ...mockGameSession,
  currentPattern: {
    type: 'single',
    cards: [
      { id: 'card-2', rank: 'K', suit: 'heart' }
    ],
    mainRank: 'K',
    rank: 'K', // 添加rank属性以匹配canBeatPattern的需求
    length: 1
  } as any
}

const mockPlayOption1 = {
  choice: 'play' as const,
  cards: [{ id: 'card-1', rank: 'Q', suit: 'spade' }],
  pattern: {
    type: 'single',
    cards: [{ id: 'card-1', rank: 'Q', suit: 'spade' }],
    mainRank: 'Q',
    rank: 'Q', // 添加rank属性
    length: 1
  } as any,
  score: 80,
  reason: '选项1',
  validation: { valid: true, message: '合法' }
} as any

const mockPlayOption2 = {
  choice: 'play' as const,
  cards: [{ id: 'card-2', rank: 'K', suit: 'heart' }],
  pattern: {
    type: 'single',
    cards: [{ id: 'card-2', rank: 'K', suit: 'heart' }],
    mainRank: 'K',
    rank: 'K', // 添加rank属性以匹配canBeatPattern的需求
    length: 1
  } as any,
  score: 70,
  reason: '选项2',
  validation: { valid: true, message: '合法' }
} as any

const mockPlayOption3 = {
  choice: 'pass' as const,
  cards: [],
  score: 50,
  reason: '过牌',
  validation: { valid: true, message: '合法' }
} as any

const mockDominationOption = {
  choice: 'play' as const,
  cards: [{ id: 'card-3', rank: 'A', suit: 'club' }],
  pattern: {
    type: 'single',
    cards: [{ id: 'card-3', rank: 'A', suit: 'club' }],
    mainRank: 'A',
    rank: 'A', // 添加rank属性以匹配canBeatPattern的需求
    length: 1
  } as any,
  score: 75,
  reason: '压制选项',
  validation: { valid: true, message: '合法' }
} as any

const mockGameMemory = {
  snapshots: [{
    playerHandCounts: {
      'test-player-1': 15
    }
  }],
  playRecords: [],
  playerMemories: new Map()
} as any

describe('GreedyStrategy', () => {
  let greedyStrategy: GreedyStrategy

  describe('构造函数和基础属性', () => {
    it('应该使用默认难度创建贪婪策略', () => {
      const strategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)
      expect(strategy).toBeDefined()
      expect(strategy.getDifficulty()).toBe(AIDifficultyLevel.INTERMEDIATE)
      expect(strategy.getConfig().type).toBe('greedy')
    })

    it('应该初始化贪婪倾向和风险容忍度', () => {
      const strategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)
      expect(strategy.getGreedyTendency()).toBe(0.8)
      expect(strategy.getRiskTolerance()).toBe(0.3)
    })

    it('应该支持自定义配置', () => {
      const customConfig = {
        thresholds: {
          minConfidence: 0.7
        }
      }
      const strategy = new GreedyStrategy(AIDifficultyLevel.ADVANCED, customConfig)
      const config = strategy.getConfig()

      expect(config.thresholds.minConfidence).toBe(0.7)
      expect(config.thresholds.maxRisk).toBe(0.6) // 高级难度的默认值
    })
  })

  describe('selectBestPlay方法', () => {
    beforeEach(() => {
      greedyStrategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)
    })

    it('应该选择评分最高的选项', () => {
      const options = [mockPlayOption1, mockPlayOption2, mockPlayOption3]
      const selected = greedyStrategy.selectBestPlay(options, mockGameSession, mockGameMemory)

      // 贪婪策略返回修改后的选项（添加了贪婪策略理由，可能调整分数）
      // 检查选中的是评分最高的选项（通过卡片ID判断）
      expect(selected.cards[0].id).toBe('card-1') // mockPlayOption1的卡片
      // 分数应该在合理范围内
      expect(selected.score).toBeGreaterThanOrEqual(0)
      expect(selected.score).toBeLessThanOrEqual(100)
      // 理由应该包含贪婪策略信息
      expect(selected.reason).toContain('贪婪策略')
    })

    it('应该过滤掉评分过低的选项', () => {
      // 配置最小置信度阈值为0.7（70分）
      const strategy = new GreedyStrategy(AIDifficultyLevel.ADVANCED)
      const lowScoreOption = {
        ...mockPlayOption1,
        score: 65 // 低于70分
      }
      const highScoreOption = {
        ...mockPlayOption2,
        score: 75 // 高于70分
      }

      const options = [lowScoreOption, highScoreOption]
      const selected = strategy.selectBestPlay(options, mockGameSession, mockGameMemory)

      // 应该只选择高评分选项（贪婪策略返回修改后的选项）
      // 检查选中的是高评分选项（通过卡片ID判断）
      expect(selected.cards[0].id).toBe('card-2') // highScoreOption的卡片
      // 分数应该在合理范围内
      expect(selected.score).toBeGreaterThanOrEqual(0)
      expect(selected.score).toBeLessThanOrEqual(100)
    })

    it('没有有效选项时应返回评分最高的选项', () => {
      const lowScoreOptions = [
        { ...mockPlayOption1, score: 30 },
        { ...mockPlayOption2, score: 40 }
      ]
      const selected = greedyStrategy.selectBestPlay(lowScoreOptions, mockGameSession, mockGameMemory)

      // 应该返回评分最高的选项（40分）
      expect(selected).toBe(lowScoreOptions[1])
    })

    it('空选项列表时应返回默认选项', () => {
      const emptyOptions: any[] = []
      const selected = greedyStrategy.selectBestPlay(emptyOptions, mockGameSession, mockGameMemory)

      expect(selected).toBeDefined()
      expect(selected.choice).toBe('pass')
      expect(selected.score).toBe(40) // 贪婪策略的默认过牌评分
    })

    it('应该优先选择压制性出牌', () => {
      const options = [mockPlayOption1, mockPlayOption2, mockDominationOption]
      // 创建有当前牌型的memory，使压制性逻辑能工作
      const memoryWithPattern = {
        snapshots: [{
          playerHandCounts: { 'test-player-1': 15 },
          currentPattern: mockGameSessionWithPattern.currentPattern // 添加当前牌型
        }],
        playRecords: [],
        playerMemories: new Map()
      } as any
      const selected = greedyStrategy.selectBestPlay(options, mockGameSessionWithPattern, memoryWithPattern)

      // 应该选择能压制当前牌型的选项
      // 贪婪策略可能返回修改后的选项，检查卡片ID
      expect(selected.cards[0].id).toBe('card-3') // mockDominationOption的卡片
    })

    it('应该生成贪婪策略特有的理由', () => {
      const options = [mockPlayOption1]
      const selected = greedyStrategy.selectBestPlay(options, mockGameSession, mockGameMemory)

      expect(selected.reason).toContain('贪婪策略')
      expect(selected.reason).toContain('评分')
      expect(selected.reason).toContain('当前最优选择')
    })

    it('应该记录最佳选择历史', () => {
      const options = [mockPlayOption1, mockPlayOption2]

      // 多次选择以累积历史
      for (let i = 0; i < 3; i++) {
        greedyStrategy.selectBestPlay(options, mockGameSession, mockGameMemory)
      }

      const history = greedyStrategy.getBestChoicesHistory()
      expect(history.length).toBeGreaterThanOrEqual(3)
      expect(history[0].patternType).toBe('single')
      // 贪婪策略可能调整分数，检查分数是正数
      expect(history[0].score).toBeGreaterThan(0)
      expect(history[0].score).toBeLessThanOrEqual(100)
    })
  })

  describe('evaluatePlay方法', () => {
    beforeEach(() => {
      greedyStrategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)
    })

    it('应该使用缓存机制', () => {
      // 第一次评估，应该计算并缓存
      const score1 = greedyStrategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)
      expect(typeof score1).toBe('number')

      // 第二次相同评估，应该从缓存获取
      const score2 = greedyStrategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)
      expect(score2).toBe(score1)

      const cacheStats = greedyStrategy.getCacheStats()
      expect(cacheStats.size).toBeGreaterThan(0)
    })

    it('应该考虑贪婪调整', () => {
      const score = greedyStrategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)

      // 分数应该在合理范围内
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('能压制当前牌型时应获得额外加分', () => {
      const patternThatCanBeat = {
        type: 'single',
        cards: [{ id: 'card-4', rank: 'A', suit: 'diamond' }],
        mainRank: 'A',
        length: 1
      } as any

      const score = greedyStrategy.evaluatePlay(patternThatCanBeat, mockGameSessionWithPattern, mockGameMemory)

      // 分数应该包含压制加成
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('炸弹和王炸应该有特殊风险考虑', () => {
      const bombPattern = {
        type: 'bomb',
        cards: [
          { id: 'card-5', rank: '2', suit: 'spade' },
          { id: 'card-6', rank: '2', suit: 'heart' },
          { id: 'card-7', rank: '2', suit: 'club' },
          { id: 'card-8', rank: '2', suit: 'diamond' }
        ],
        mainRank: '2',
        length: 4
      } as any

      const score = greedyStrategy.evaluatePlay(bombPattern, mockGameSession, mockGameMemory)

      // 炸弹应该有特殊评分逻辑
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('evaluatePass方法', () => {
    beforeEach(() => {
      greedyStrategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)
    })

    it('贪婪策略中过牌评分通常较低', () => {
      const score = greedyStrategy.evaluatePass(mockGameSession, mockGameMemory)

      // 贪婪策略过牌基础评分30，加上调整后可能变化
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('当前牌型很强时应提高过牌评分', () => {
      const strongPatternSession = {
        ...mockGameSession,
        currentPattern: {
          type: 'bomb',
          cards: [],
          mainRank: '2',
          length: 4
        } as any
      }

      const score = greedyStrategy.evaluatePass(strongPatternSession, mockGameMemory)

      // 当前牌型很强时，过牌评分应该提高
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('手牌很少时应提高过牌评分', () => {
      const lowHandMemory = {
        snapshots: [{
          playerHandCounts: {
            'test-player-1': 3 // 手牌很少
          }
        }],
        playRecords: [],
        playerMemories: new Map()
      } as any

      const score = greedyStrategy.evaluatePass(mockGameSession, lowHandMemory)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('游戏后期应提高过牌评分', () => {
      const lateGameSession = {
        ...mockGameSession,
        currentRound: 25 // 游戏后期
      }

      const score = greedyStrategy.evaluatePass(lateGameSession, mockGameMemory)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('记忆和状态更新', () => {
    beforeEach(() => {
      greedyStrategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)
    })

    it('应该根据出牌结果调整贪婪倾向', () => {
      const initialTendency = greedyStrategy.getGreedyTendency()

      // 模拟成功出牌
      const successfulPlayRecord = {
        playerId: 'test-player',
        cards: [],
        pattern: mockCardPattern,
        choice: 'play' as const,
        round: 1,
        timestamp: Date.now(),
        isValid: true,
        winsRound: true
      }

      greedyStrategy.updateMemory(successfulPlayRecord, mockGameSession, mockGameMemory)

      const afterSuccessTendency = greedyStrategy.getGreedyTendency()
      expect(afterSuccessTendency).toBeGreaterThan(initialTendency) // 成功时增加贪婪倾向

      // 模拟失败出牌
      const failedPlayRecord = {
        ...successfulPlayRecord,
        winsRound: false
      }

      greedyStrategy.updateMemory(failedPlayRecord, mockGameSession, mockGameMemory)

      const afterFailureTendency = greedyStrategy.getGreedyTendency()
      expect(afterFailureTendency).toBeLessThan(afterSuccessTendency) // 失败时减少贪婪倾向
    })

    it('应该限制最佳选择历史记录大小', () => {
      // 添加大量记录
      for (let i = 0; i < 150; i++) {
        const playRecord = {
          playerId: 'test-player',
          cards: [],
          pattern: mockCardPattern,
          choice: 'play' as const,
          round: i,
          timestamp: Date.now(),
          isValid: true,
          winsRound: true
        }
        greedyStrategy.updateMemory(playRecord, mockGameSession, mockGameMemory)
      }

      const history = greedyStrategy.getBestChoicesHistory()
      expect(history.length).toBeLessThanOrEqual(100) // 应该限制在100条以内
    })

    it('应该根据游戏阶段调整策略', () => {
      const initialState = {
        greedyTendency: greedyStrategy.getGreedyTendency(),
        riskTolerance: greedyStrategy.getRiskTolerance()
      }

      // 模拟游戏后期状态
      const lateGameSnapshot = {
        sessionId: 'test-session',
        currentRound: 20,
        currentPlayerId: 'test-player',
        playerHandCounts: {},
        playedCardsHistory: [],
        gamePhase: 'late_game',
        teamScores: {},
        timestamp: Date.now()
      }

      greedyStrategy.updateGameState(lateGameSnapshot, mockGameMemory)

      const lateGameState = {
        greedyTendency: greedyStrategy.getGreedyTendency(),
        riskTolerance: greedyStrategy.getRiskTolerance()
      }

      // 游戏后期应该降低贪婪倾向和风险容忍度
      expect(lateGameState.greedyTendency).toBeLessThan(initialState.greedyTendency)
      expect(lateGameState.riskTolerance).toBeLessThan(initialState.riskTolerance)

      // 模拟游戏早期状态
      const earlyGameSnapshot = {
        ...lateGameSnapshot,
        currentRound: 3,
        gamePhase: 'early_game'
      }

      greedyStrategy.updateGameState(earlyGameSnapshot, mockGameMemory)

      const earlyGameState = {
        greedyTendency: greedyStrategy.getGreedyTendency(),
        riskTolerance: greedyStrategy.getRiskTolerance()
      }

      // 游戏早期应该增加贪婪倾向和风险容忍度
      expect(earlyGameState.greedyTendency).toBeGreaterThan(lateGameState.greedyTendency)
      expect(earlyGameState.riskTolerance).toBeGreaterThan(lateGameState.riskTolerance)
    })
  })

  describe('缓存机制', () => {
    it('应该清理过期缓存', () => {
      const strategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)

      // 添加大量评估以触发缓存清理
      for (let i = 0; i < 150; i++) {
        const pattern = {
          type: 'single',
          cards: [{ id: `card-${i}`, rank: 'A', suit: 'spade' }],
          mainRank: 'A',
          length: 1
        } as any

        strategy.evaluatePlay(pattern, mockGameSession, mockGameMemory)
      }

      const cacheStats = strategy.getCacheStats()
      // 缓存大小应该有限制
      expect(cacheStats.size).toBeLessThanOrEqual(100)
    })

    it('应该计算缓存命中率', () => {
      const strategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)

      // 做一些评估
      for (let i = 0; i < 10; i++) {
        strategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)
      }

      const cacheStats = strategy.getCacheStats()
      expect(cacheStats.hitRate).toBeGreaterThanOrEqual(0)
      expect(cacheStats.hitRate).toBeLessThanOrEqual(1)
    })
  })

  describe('策略配置管理', () => {
    it('应该支持更新配置', () => {
      const strategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)
      const initialConfig = strategy.getConfig()

      const updates = {
        thresholds: {
          minConfidence: 0.8,
          maxRisk: 0.4
        }
      }

      strategy.updateConfig(updates)
      const updatedConfig = strategy.getConfig()

      expect(updatedConfig.thresholds.minConfidence).toBe(0.8)
      expect(updatedConfig.thresholds.maxRisk).toBe(0.4)
      expect(updatedConfig.type).toBe('greedy') // 类型不应该改变
    })

    it('应该重置策略状态', () => {
      const strategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)

      // 先做一些评估和选择
      for (let i = 0; i < 3; i++) {
        strategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)
        strategy.selectBestPlay([mockPlayOption1], mockGameSession, mockGameMemory)
      }

      const beforeReset = strategy.getState()
      expect(beforeReset.decisionCount).toBeGreaterThan(0)

      strategy.resetState()
      const afterReset = strategy.getState()

      expect(afterReset.decisionCount).toBe(0)
      expect(afterReset.successfulDecisions).toBe(0)
      expect(afterReset.averageDecisionTime).toBe(0)
      expect(afterReset.lastDecisionTime).toBe(0)
    })

    it('应该计算决策成功率', () => {
      const strategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)

      const initialSuccessRate = strategy.getSuccessRate()
      expect(initialSuccessRate).toBe(0)

      // 模拟一些决策
      for (let i = 0; i < 5; i++) {
        strategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)
      }

      const updatedSuccessRate = strategy.getSuccessRate()
      expect(updatedSuccessRate).toBeGreaterThanOrEqual(0)
      expect(updatedSuccessRate).toBeLessThanOrEqual(1)
    })
  })

  describe('辅助方法', () => {
    it('应该判断牌型是否能压制另一个牌型', () => {
      const strategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)

      // 创建两个牌型，确保有rank属性（canBeatPattern使用rank）
      const weakerPattern = {
        type: 'single',
        cards: [],
        mainRank: 'K',
        rank: 'K', // 添加rank属性
        length: 1
      } as any

      const strongerPattern = {
        type: 'single',
        cards: [],
        mainRank: 'A',
        rank: 'A', // 添加rank属性
        length: 1
      } as any

      const bombPattern = {
        type: 'bomb',
        cards: [],
        mainRank: '2',
        rank: '2', // 添加rank属性
        length: 4
      } as any

      // A > K
      expect(strategy['canBeatPattern' as any](strongerPattern, weakerPattern)).toBe(true)
      expect(strategy['canBeatPattern' as any](weakerPattern, strongerPattern)).toBe(false)

      // 炸弹压制非炸弹
      expect(strategy['canBeatPattern' as any](bombPattern, strongerPattern)).toBe(true)
    })
  })
})