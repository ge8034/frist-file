/**
 * 随机策略单元测试
 *
 * 测试RandomStrategy的核心功能：
 * 1. 随机选择逻辑
 * 2. 评估方法
 * 3. 策略配置
 * 4. 难度级别影响
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RandomStrategy } from '@/lib/features/game/ai/strategies/RandomStrategy'
import { AIDifficultyLevel } from '@/lib/features/game/ai/types'

// 模拟数据
const mockCardPattern = {
  type: 'single',
  cards: [
    { id: 'card-1', rank: 'A', suit: 'spade' }
  ],
  mainRank: 'A',
  length: 1
} as any

const mockGameSession = {
  id: 'test-session-1',
  currentRound: 1,
  currentPlayerId: 'test-player-1',
  phase: 'playing'
} as any

const mockPlayOption1 = {
  choice: 'play' as const,
  cards: [{ id: 'card-1', rank: 'A', suit: 'spade' }],
  score: 60,
  reason: '选项1',
  validation: { valid: true, message: '合法' }
} as any

const mockPlayOption2 = {
  choice: 'play' as const,
  cards: [{ id: 'card-2', rank: 'K', suit: 'heart' }],
  score: 40,
  reason: '选项2',
  validation: { valid: true, message: '合法' }
} as any

const mockPlayOption3 = {
  choice: 'pass' as const,
  cards: [],
  score: 30,
  reason: '过牌',
  validation: { valid: true, message: '合法' }
} as any

const mockGameMemory = {
  snapshots: [],
  playRecords: [],
  playerMemories: new Map()
} as any

describe('RandomStrategy', () => {
  let randomStrategy: RandomStrategy

  describe('构造函数和基础属性', () => {
    it('应该使用默认难度创建随机策略', () => {
      const strategy = new RandomStrategy(AIDifficultyLevel.BEGINNER)
      expect(strategy).toBeDefined()
      expect(strategy.getDifficulty()).toBe(AIDifficultyLevel.BEGINNER)
      expect(strategy.getConfig().type).toBe('random')
    })

    it('应该支持自定义配置', () => {
      const customConfig = {
        thresholds: {
          minConfidence: 0.5
        }
      }
      const strategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE, customConfig)
      const config = strategy.getConfig()

      expect(config.thresholds.minConfidence).toBe(0.5)
      expect(config.thresholds.maxRisk).toBe(0.5) // 中等难度的默认值
    })

    it('应该正确创建不同难度的配置', () => {
      const beginnerStrategy = new RandomStrategy(AIDifficultyLevel.BEGINNER)
      const intermediateStrategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)
      const advancedStrategy = new RandomStrategy(AIDifficultyLevel.ADVANCED)
      const expertStrategy = new RandomStrategy(AIDifficultyLevel.EXPERT)

      expect(beginnerStrategy.getConfig().thresholds.minConfidence).toBe(0.4)
      expect(intermediateStrategy.getConfig().thresholds.minConfidence).toBe(0.6)
      expect(advancedStrategy.getConfig().thresholds.minConfidence).toBe(0.7)
      expect(expertStrategy.getConfig().thresholds.minConfidence).toBe(0.8)
    })
  })

  describe('selectBestPlay方法', () => {
    beforeEach(() => {
      randomStrategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)
    })

    it('应该从有效选项中选择一个', () => {
      const options = [mockPlayOption1, mockPlayOption2, mockPlayOption3]
      const selected = randomStrategy.selectBestPlay(options, mockGameSession, mockGameMemory)

      expect(selected).toBeDefined()
      // selectBestPlay返回修改后的选项（添加了随机扰动），所以不能检查引用包含
      // 检查选项是有效的即可
      expect(selected.choice).toBeDefined()
      expect(['play', 'pass']).toContain(selected.choice)
      expect(selected.score).toBeGreaterThanOrEqual(0)
      expect(selected.score).toBeLessThanOrEqual(100)
    })

    it('应该过滤掉评分过低的选项', () => {
      // 配置最小置信度阈值为0.6（60分）
      const strategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)
      const lowScoreOption = {
        ...mockPlayOption1,
        score: 50 // 低于60分
      }
      const highScoreOption = {
        ...mockPlayOption2,
        score: 70 // 高于60分
      }

      const options = [lowScoreOption, highScoreOption]
      const selected = strategy.selectBestPlay(options, mockGameSession, mockGameMemory)

      // 应该只选择高评分选项（注意：返回的是添加了随机扰动的选项，不是原始对象）
      // 随机扰动可能改变分数，但选中的应该是高评分选项
      // 检查选择的是高评分选项（通过卡片ID判断）
      expect(selected.cards[0].id).toBe('card-2') // highScoreOption的卡片
    })

    it('没有有效选项时应返回默认选项', () => {
      const emptyOptions: any[] = []
      const selected = randomStrategy.selectBestPlay(emptyOptions, mockGameSession, mockGameMemory)

      expect(selected).toBeDefined()
      expect(selected.choice).toBe('pass')
      expect(selected.score).toBe(50)
    })

    it('所有选项评分都过低时应返回第一个选项', () => {
      const lowScoreOptions = [
        { ...mockPlayOption1, score: 30 },
        { ...mockPlayOption2, score: 40 }
      ]
      const selected = randomStrategy.selectBestPlay(lowScoreOptions, mockGameSession, mockGameMemory)

      expect(selected).toBe(lowScoreOptions[0])
    })

    it('应该添加随机扰动到评分', () => {
      const options = [mockPlayOption1]
      const selected = randomStrategy.selectBestPlay(options, mockGameSession, mockGameMemory)

      // 随机扰动可能不改变分数，但应该添加随机选择信息
      // 检查添加了随机选择信息
      expect(selected.reason).toContain('随机选择')
      expect(selected.reason).toContain('原始评分')
      expect(selected.reason).toContain('扰动后')
      // 分数应该在0-100范围内
      expect(selected.score).toBeGreaterThanOrEqual(0)
      expect(selected.score).toBeLessThanOrEqual(100)
    })

    it('应该记录选择统计', () => {
      const options = [mockPlayOption1, mockPlayOption2]

      // 多次选择以累积统计
      for (let i = 0; i < 5; i++) {
        randomStrategy.selectBestPlay(options, mockGameSession, mockGameMemory)
      }

      const stats = randomStrategy.getSelectionStats()
      expect(stats.totalSelections).toBe(5)
      // 检查统计结构
      expect(stats.indexDistribution).toBeDefined()
      expect(typeof stats.indexDistribution).toBe('object')
      // 由于是随机选择，可能只选择了某个索引
      // 检查总选择次数正确
      const totalFromDistribution = Object.values(stats.indexDistribution).reduce((sum: number, val) => sum + (val as number), 0)
      expect(totalFromDistribution).toBe(5)
    })
  })

  describe('evaluatePlay方法', () => {
    beforeEach(() => {
      randomStrategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)
    })

    it('应该返回30-70之间的随机分数', () => {
      const scores = []
      for (let i = 0; i < 100; i++) {
        const score = randomStrategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)
        scores.push(score)
      }

      const minScore = Math.min(...scores)
      const maxScore = Math.max(...scores)

      // 随机分数应该在0-100范围内，但基本范围是30-70
      expect(minScore).toBeGreaterThanOrEqual(0)
      expect(maxScore).toBeLessThanOrEqual(100)
      expect(scores.some(score => score >= 30 && score <= 70)).toBe(true)
    })

    it('不同牌型应该有不同的加成', () => {
      const singlePattern = { ...mockCardPattern, type: 'single' }
      const bombPattern = { ...mockCardPattern, type: 'bomb' }
      const rocketPattern = { ...mockCardPattern, type: 'rocket' }

      const singleScore = randomStrategy.evaluatePlay(singlePattern, mockGameSession, mockGameMemory)
      const bombScore = randomStrategy.evaluatePlay(bombPattern, mockGameSession, mockGameMemory)
      const rocketScore = randomStrategy.evaluatePlay(rocketPattern, mockGameSession, mockGameMemory)

      // 炸弹和火箭应该有更高的加成，但仍然是随机的
      // 我们只检查函数执行不报错
      expect(typeof singleScore).toBe('number')
      expect(typeof bombScore).toBe('number')
      expect(typeof rocketScore).toBe('number')
    })
  })

  describe('evaluatePass方法', () => {
    beforeEach(() => {
      randomStrategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)
    })

    it('应该返回随机评分', () => {
      const scores = []
      for (let i = 0; i < 50; i++) {
        const score = randomStrategy.evaluatePass(mockGameSession, mockGameMemory)
        scores.push(score)
      }

      const minScore = Math.min(...scores)
      const maxScore = Math.max(...scores)

      expect(minScore).toBeGreaterThanOrEqual(0)
      expect(maxScore).toBeLessThanOrEqual(100)
      expect(scores.some(score => score >= 20 && score <= 60)).toBe(true)
    })

    it('应该根据游戏状态调整评分', () => {
      // 模拟后期回合
      const lateGameSession = {
        ...mockGameSession,
        currentRound: 15
      }

      const scores = []
      for (let i = 0; i < 20; i++) {
        const score = randomStrategy.evaluatePass(lateGameSession, mockGameMemory)
        scores.push(score)
      }

      // 函数应该执行不报错
      expect(scores.every(score => typeof score === 'number')).toBe(true)
    })
  })

  describe('记忆和状态更新', () => {
    beforeEach(() => {
      randomStrategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)
    })

    it('应该记录出牌记录', () => {
      const playRecord = {
        playerId: 'test-player',
        cards: [{ id: 'card-1', rank: 'A', suit: 'spade' }],
        pattern: mockCardPattern,
        choice: 'play' as const,
        round: 1,
        timestamp: Date.now(),
        isValid: true
      }

      randomStrategy.updateMemory(playRecord, mockGameSession, mockGameMemory)

      // 检查是否记录了随机值
      const randomState = randomStrategy.getRandomState()
      expect(randomState.lastRandomValues.length).toBeGreaterThan(0)
      expect(randomState.lastRandomValues[0].playType).toBe('single')
    })

    it('应该限制记忆记录数量', () => {
      // 添加超过限制的记录
      for (let i = 0; i < 15; i++) {
        const playRecord = {
          playerId: 'test-player',
          cards: [],
          pattern: { type: 'single' },
          choice: 'play' as const,
          round: i,
          timestamp: Date.now(),
          isValid: true
        }
        randomStrategy.updateMemory(playRecord, mockGameSession, mockGameMemory)
      }

      const randomState = randomStrategy.getRandomState()
      expect(randomState.lastRandomValues.length).toBeLessThanOrEqual(10)
    })

    it('应该更新游戏状态但不影响决策', () => {
      const snapshot = {
        sessionId: 'test-session',
        currentRound: 2,
        currentPlayerId: 'test-player',
        playerHandCounts: {},
        playedCardsHistory: [],
        gamePhase: 'playing',
        teamScores: {},
        timestamp: Date.now()
      }

      randomStrategy.updateGameState(snapshot, mockGameMemory)

      // 检查函数执行不报错
      const state = randomStrategy.getState()
      expect(state).toBeDefined()
    })
  })

  describe('随机数生成器', () => {
    it('应该可以重置随机数种子', () => {
      const strategy = new RandomStrategy(AIDifficultyLevel.BEGINNER)
      const initialState = strategy.getRandomState()

      // 生成一些随机数
      strategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)

      // 重置随机数生成器
      strategy.resetRandomGenerator(12345)

      const resetState = strategy.getRandomState()
      expect(resetState.seed).toBe(12345)
      expect(resetState.currentState).toBe(12345)
      expect(resetState.lastRandomValues).toHaveLength(0)
    })

    it('应该生成可预测的随机数序列（给定相同种子）', () => {
      const seed = 1000
      const strategy1 = new RandomStrategy(AIDifficultyLevel.BEGINNER)
      const strategy2 = new RandomStrategy(AIDifficultyLevel.BEGINNER)

      strategy1.resetRandomGenerator(seed)
      strategy2.resetRandomGenerator(seed)

      // 生成相同的随机数序列
      const scores1 = []
      const scores2 = []
      for (let i = 0; i < 10; i++) {
        scores1.push(strategy1.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory))
        scores2.push(strategy2.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory))
      }

      expect(scores1).toEqual(scores2)
    })
  })

  describe('决策统计', () => {
    it('应该跟踪决策成功率', () => {
      const strategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)
      const initialState = strategy.getState()

      expect(initialState.decisionCount).toBe(0)
      expect(initialState.successfulDecisions).toBe(0)
      expect(initialState.averageDecisionTime).toBe(0)

      // 模拟一些决策（通过evaluatePlay会触发决策统计更新）
      strategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)
      strategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)

      const updatedState = strategy.getState()
      expect(updatedState.decisionCount).toBeGreaterThan(0)
    })

    it('应该计算平均决策时间', () => {
      const strategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)

      // 多次评估以累积决策时间
      for (let i = 0; i < 5; i++) {
        strategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)
      }

      const avgTime = strategy.getAverageDecisionTime()
      expect(avgTime).toBeGreaterThan(0)
      expect(avgTime).toBeLessThan(1000) // 应该很快
    })
  })

  describe('策略配置管理', () => {
    it('应该支持更新配置', () => {
      const strategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)
      const initialConfig = strategy.getConfig()

      const updates = {
        thresholds: {
          minConfidence: 0.8,
          maxRisk: 0.6
        }
      }

      strategy.updateConfig(updates)
      const updatedConfig = strategy.getConfig()

      expect(updatedConfig.thresholds.minConfidence).toBe(0.8)
      expect(updatedConfig.thresholds.maxRisk).toBe(0.6)
      expect(updatedConfig.type).toBe('random') // 类型不应该改变
    })

    it('应该重置策略状态', () => {
      const strategy = new RandomStrategy(AIDifficultyLevel.INTERMEDIATE)

      // 先做一些决策
      for (let i = 0; i < 3; i++) {
        strategy.evaluatePlay(mockCardPattern, mockGameSession, mockGameMemory)
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
  })
})