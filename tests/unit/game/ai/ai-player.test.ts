/**
 * AI玩家单元测试
 *
 * 测试AI玩家基类的核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { AIPlayer } from '@/lib/features/game/ai/AIPlayer'
import { AIPlayerFactory } from '@/lib/features/game/ai/AIPlayerFactory'
import { AIDifficultyLevel } from '@/lib/features/game/ai/types'
import { GreedyStrategy } from '@/lib/features/game/ai/strategies/GreedyStrategy'

// 模拟游戏规则服务
const mockGameRuleService = {
  validatePlay: () => ({
    valid: true,
    message: '模拟验证通过'
  })
}

describe('AIPlayer', () => {
  let aiPlayer: AIPlayer
  let aiFactory: AIPlayerFactory

  beforeEach(() => {
    aiFactory = new AIPlayerFactory(mockGameRuleService as any)
    aiPlayer = aiFactory.createAIPlayer(
      'test-ai-1',
      '测试AI',
      'random',
      AIDifficultyLevel.BEGINNER,
      50
    )
  })

  describe('构造函数和基础属性', () => {
    it('应该正确创建AI玩家', () => {
      expect(aiPlayer).toBeDefined()
      expect(aiPlayer.userId).toBe('test-ai-1')
      expect(aiPlayer.nickname).toBe('测试AI')
      expect(aiPlayer.type).toBe('ai')
      expect(aiPlayer.isReady).toBe(true)
    })

    it('应该正确获取配置', () => {
      const config = aiPlayer.getConfig()
      expect(config.playerId).toBe('test-ai-1')
      expect(config.name).toBe('测试AI')
      expect(config.strategy).toBe('random')
      expect(config.difficulty).toBe(AIDifficultyLevel.BEGINNER)
      expect(config.skillLevel).toBe(50)
    })
  })

  describe('手牌管理', () => {
    it('应该正确设置和获取手牌', () => {
      const mockCards = [
        { id: 'card-1', rank: 'A', suit: 'spade' },
        { id: 'card-2', rank: 'K', suit: 'heart' },
        { id: 'card-3', rank: 'Q', suit: 'diamond' }
      ] as any

      aiPlayer.setHandCards(mockCards)
      const handCards = aiPlayer.getHandCards()

      expect(handCards).toHaveLength(3)
      expect(handCards[0].id).toBe('card-3') // Q♦ 排序后在最前 (rank 'Q' = 10)
      expect(handCards[1].id).toBe('card-2') // K♥ (rank 'K' = 11)
      expect(handCards[2].id).toBe('card-1') // A♠ 排序后在最后 (rank 'A' = 12)
    })

    it('手牌应该被复制而不是引用', () => {
      const mockCards = [
        { id: 'card-1', rank: 'A', suit: 'spade' }
      ] as any

      aiPlayer.setHandCards(mockCards)
      const handCards = aiPlayer.getHandCards()

      // 修改原始数组不应该影响AI的手牌
      mockCards.push({ id: 'card-2', rank: 'K', suit: 'heart' })
      expect(handCards).toHaveLength(1)
    })
  })

  describe('决策历史', () => {
    it('应该正确记录和获取决策历史', () => {
      const initialHistory = aiPlayer.getDecisionHistory()
      expect(initialHistory).toHaveLength(0)

      // 模拟一个决策
      const mockDecision = {
        choice: 'pass' as const,
        cards: [],
        confidence: 0.8,
        timestamp: Date.now(),
        reason: '测试决策'
      }

      // 注意：这里我们直接操作内部状态来测试
      // 实际使用中应该通过makeDecision方法
      const decisionHistory = (aiPlayer as any).decisionHistory
      decisionHistory.push(mockDecision)

      const updatedHistory = aiPlayer.getDecisionHistory()
      expect(updatedHistory).toHaveLength(1)
      expect(updatedHistory[0].choice).toBe('pass')
      expect(updatedHistory[0].confidence).toBe(0.8)
    })
  })

  describe('游戏记忆', () => {
    it('应该正确获取游戏记忆', () => {
      const gameMemory = aiPlayer.getGameMemory()

      expect(gameMemory.snapshots).toBeDefined()
      expect(gameMemory.playRecords).toBeDefined()
      expect(gameMemory.playerMemories).toBeDefined()
      expect(Array.isArray(gameMemory.snapshots)).toBe(true)
      expect(Array.isArray(gameMemory.playRecords)).toBe(true)
      expect(gameMemory.playerMemories instanceof Map).toBe(true)
    })

    it('应该正确清空游戏记忆', () => {
      // 先添加一些记忆
      const gameMemory = (aiPlayer as any).gameMemory
      gameMemory.snapshots.push({ timestamp: Date.now() })
      gameMemory.playRecords.push({ playerId: 'test', timestamp: Date.now() })
      gameMemory.playerMemories.set('player-1', {} as any)

      aiPlayer.clearGameMemory()

      const clearedMemory = aiPlayer.getGameMemory()
      expect(clearedMemory.snapshots).toHaveLength(0)
      expect(clearedMemory.playRecords).toHaveLength(0)
      expect(clearedMemory.playerMemories.size).toBe(0)
    })
  })

  describe('策略管理', () => {
    it('应该正确创建策略实例', () => {
      const config = aiPlayer.getConfig()
      expect(config.strategy).toBe('random')
      expect(config.difficulty).toBe(AIDifficultyLevel.BEGINNER)
    })

    it('应该支持策略切换', () => {
      // 获取当前策略类型
      const initialConfig = aiPlayer.getConfig()
      expect(initialConfig.strategy).toBe('random')

      // 创建新策略并设置
      const greedyStrategy = new GreedyStrategy(AIDifficultyLevel.INTERMEDIATE)

      aiPlayer.setStrategy(greedyStrategy)

      const updatedConfig = aiPlayer.getConfig()
      expect(updatedConfig.strategy).toBe('greedy')
    })
  })

  describe('玩家记忆管理', () => {
    it('应该正确更新玩家记忆', () => {
      const playerId = 'opponent-1'

      // 初始应该没有记忆
      const initialMemory = aiPlayer.getPlayerMemory(playerId)
      expect(initialMemory).toBeUndefined()

      // 更新记忆
      aiPlayer.updatePlayerMemory(playerId, {
        patternPreferences: { 'single': 0.8 },
        playHabits: {
          playBigCardsProbability: 0.7,
          keepBombsProbability: 0.3,
          takeRisksProbability: 0.5,
          teamworkTendency: 0.6
        }
      })

      // 获取更新后的记忆
      const updatedMemory = aiPlayer.getPlayerMemory(playerId)
      expect(updatedMemory).toBeDefined()
      expect(updatedMemory?.playerId).toBe(playerId)
      expect(updatedMemory?.patternPreferences['single']).toBe(0.8)
      expect(updatedMemory?.playHabits.playBigCardsProbability).toBe(0.7)
    })

    it('应该合并部分记忆更新', () => {
      const playerId = 'opponent-2'

      // 第一次更新
      aiPlayer.updatePlayerMemory(playerId, {
        patternPreferences: { 'pair': 0.6 },
        playHabits: {
          playBigCardsProbability: 0.5
        }
      })

      // 第二次部分更新
      aiPlayer.updatePlayerMemory(playerId, {
        playHabits: {
          takeRisksProbability: 0.8
        }
      })

      const memory = aiPlayer.getPlayerMemory(playerId)
      expect(memory).toBeDefined()
      expect(memory?.patternPreferences['pair']).toBe(0.6) // 应该保留第一次的值
      expect(memory?.playHabits.playBigCardsProbability).toBe(0.5) // 应该保留第一次的值
      expect(memory?.playHabits.takeRisksProbability).toBe(0.8) // 应该使用第二次的值
    })
  })

  describe('团队协作', () => {
    it('应该正确设置和获取团队协作状态', () => {
      const teamworkState = {
        partnerId: 'partner-1',
        cooperationLevel: 0.8,
        signalHistory: [],
        cooperationStrategies: ['memory'],
        lastCooperationTime: Date.now()
      }

      aiPlayer.setTeamworkState(teamworkState)
      const retrievedState = aiPlayer.getTeamworkState()

      expect(retrievedState).toBeDefined()
      expect(retrievedState?.partnerId).toBe('partner-1')
      expect(retrievedState?.cooperationLevel).toBe(0.8)
      expect(retrievedState?.cooperationStrategies).toContain('memory')
    })

    it('没有团队协作状态时应该返回undefined', () => {
      const initialState = aiPlayer.getTeamworkState()
      expect(initialState).toBeUndefined()
    })
  })

  describe('静态创建方法', () => {
    it('应该通过静态方法正确创建AI玩家', () => {
      const config = {
        playerId: 'static-ai-1',
        name: '静态创建AI',
        strategy: 'memory' as const,
        difficulty: AIDifficultyLevel.ADVANCED,
        skillLevel: 75
      }

      const staticAIPlayer = AIPlayer.create(config, mockGameRuleService as any)

      expect(staticAIPlayer).toBeDefined()
      expect(staticAIPlayer.userId).toBe('static-ai-1')
      expect(staticAIPlayer.nickname).toBe('静态创建AI')

      const playerConfig = staticAIPlayer.getConfig()
      expect(playerConfig.strategy).toBe('memory')
      expect(playerConfig.difficulty).toBe(AIDifficultyLevel.ADVANCED)
      expect(playerConfig.skillLevel).toBe(75)
    })
  })
})

describe('AIPlayerFactory', () => {
  let aiFactory: AIPlayerFactory

  beforeEach(() => {
    aiFactory = new AIPlayerFactory(mockGameRuleService as any)
  })

  describe('工厂配置', () => {
    it('应该使用默认配置创建工厂', () => {
      const config = aiFactory.getConfig()

      expect(config.defaultStrategy).toBe('random')
      expect(config.defaultDifficulty).toBe(AIDifficultyLevel.INTERMEDIATE)
      expect(config.defaultSkillLevel).toBe(50)
      expect(config.enableAutoFill).toBe(true)
      expect(config.maxAIPlayers).toBe(3)
    })

    it('应该支持更新工厂配置', () => {
      const updates = {
        defaultStrategy: 'greedy' as const,
        defaultDifficulty: AIDifficultyLevel.ADVANCED,
        defaultSkillLevel: 70,
        maxAIPlayers: 5
      }

      aiFactory.updateConfig(updates)
      const updatedConfig = aiFactory.getConfig()

      expect(updatedConfig.defaultStrategy).toBe('greedy')
      expect(updatedConfig.defaultDifficulty).toBe(AIDifficultyLevel.ADVANCED)
      expect(updatedConfig.defaultSkillLevel).toBe(70)
      expect(updatedConfig.maxAIPlayers).toBe(5)
    })
  })

  describe('AI玩家创建', () => {
    it('应该正确创建单个AI玩家', () => {
      const aiPlayer = aiFactory.createAIPlayer(
        'factory-ai-1',
        '工厂AI',
        'greedy',
        AIDifficultyLevel.INTERMEDIATE,
        60
      )

      expect(aiPlayer).toBeDefined()
      expect(aiPlayer.userId).toBe('factory-ai-1')
      expect(aiPlayer.nickname).toBe('工厂AI')

      const config = aiPlayer.getConfig()
      expect(config.strategy).toBe('greedy')
      expect(config.difficulty).toBe(AIDifficultyLevel.INTERMEDIATE)
      expect(config.skillLevel).toBe(60)
    })

    it('应该使用默认值创建AI玩家', () => {
      const aiPlayer = aiFactory.createAIPlayer('default-ai-1')

      expect(aiPlayer).toBeDefined()
      expect(aiPlayer.userId).toBe('default-ai-1')
      expect(typeof aiPlayer.nickname).toBe('string')
      expect(aiPlayer.nickname.length).toBeGreaterThan(0)
      // 注：名称生成器现在生成中文名称如"中级练习玩家"，不一定包含"AI"

      const config = aiPlayer.getConfig()
      expect(config.strategy).toBe('random') // 默认策略
      expect(config.difficulty).toBe(AIDifficultyLevel.INTERMEDIATE) // 默认难度
      expect(config.skillLevel).toBe(50) // 默认技能等级
    })
  })

  describe('批量创建', () => {
    it('应该正确批量创建AI玩家', () => {
      const aiPlayers = aiFactory.createAIPlayers(3, {
        startIndex: 10,
        existingPlayerIds: ['player-1', 'player-2']
      })

      expect(aiPlayers).toHaveLength(3)

      // 检查ID唯一性
      const playerIds = aiPlayers.map(p => p.userId)
      const uniqueIds = new Set(playerIds)
      expect(uniqueIds.size).toBe(3)

      // 检查ID格式
      expect(playerIds[0]).toMatch(/^ai-10(-\d+)?$/)
      expect(playerIds[1]).toMatch(/^ai-11(-\d+)?$/)
      expect(playerIds[2]).toMatch(/^ai-12(-\d+)?$/)
    })

    it('应该避免与现有玩家ID冲突', () => {
      const existingIds = ['ai-5', 'ai-6', 'ai-7']
      const aiPlayers = aiFactory.createAIPlayers(3, {
        startIndex: 5,
        existingPlayerIds: existingIds
      })

      const newIds = aiPlayers.map(p => p.userId)

      // 新ID不应该与现有ID冲突
      newIds.forEach(id => {
        expect(existingIds).not.toContain(id)
      })

      // ID应该包含后缀以避免冲突
      expect(newIds.some(id => id.includes('-'))).toBe(true)
    })
  })

  describe('难度分布', () => {
    it('应该按照难度分布创建AI玩家', () => {
      const difficultyDistribution = {
        [AIDifficultyLevel.BEGINNER]: 0.3,
        [AIDifficultyLevel.INTERMEDIATE]: 0.4,
        [AIDifficultyLevel.ADVANCED]: 0.2,
        [AIDifficultyLevel.EXPERT]: 0.1
      }

      const aiPlayers = aiFactory.createAIPlayers(10, {
        difficultyDistribution
      })

      // 统计各难度级别的数量
      const difficultyCounts: Record<AIDifficultyLevel, number> = {
        [AIDifficultyLevel.BEGINNER]: 0,
        [AIDifficultyLevel.INTERMEDIATE]: 0,
        [AIDifficultyLevel.ADVANCED]: 0,
        [AIDifficultyLevel.EXPERT]: 0
      }

      aiPlayers.forEach(player => {
        const config = player.getConfig()
        difficultyCounts[config.difficulty]++
      })

      // 由于是随机分布，我们只检查总数
      const total = Object.values(difficultyCounts).reduce((a, b) => a + b, 0)
      expect(total).toBe(10)
    })
  })

  describe('自动补足计算', () => {
    it('应该正确计算需要的AI玩家数量', () => {
      // 4人游戏，有1个真人玩家，需要3个AI
      expect(aiFactory.calculateNeededAIPlayers(1)).toBe(3)

      // 4人游戏，有2个真人玩家，需要2个AI
      expect(aiFactory.calculateNeededAIPlayers(2)).toBe(2)

      // 4人游戏，有3个真人玩家，需要1个AI
      expect(aiFactory.calculateNeededAIPlayers(3)).toBe(1)

      // 4人游戏，有4个真人玩家，不需要AI
      expect(aiFactory.calculateNeededAIPlayers(4)).toBe(0)

      // 超过4人，不需要AI（但实际游戏应该限制为4人）
      expect(aiFactory.calculateNeededAIPlayers(5)).toBe(0)
    })

    it('应该遵守最大AI玩家限制', () => {
      // 更新配置，限制最大AI玩家数为2
      aiFactory.updateConfig({ maxAIPlayers: 2 })

      // 即使需要3个AI，也只能创建2个
      expect(aiFactory.calculateNeededAIPlayers(1)).toBe(2)
      expect(aiFactory.calculateNeededAIPlayers(2)).toBe(2)
    })

    it('禁用自动补足时应该返回0', () => {
      aiFactory.updateConfig({ enableAutoFill: false })
      expect(aiFactory.calculateNeededAIPlayers(1)).toBe(0)
    })
  })

  describe('兼容性接口', () => {
    it('应该支持createForRoom兼容接口', () => {
      const aiPlayers = aiFactory.createForRoom(2, 0, [])

      expect(aiPlayers).toHaveLength(2)
      expect(aiPlayers[0]).toBeInstanceOf(AIPlayer)
      expect(aiPlayers[1]).toBeInstanceOf(AIPlayer)
    })
  })
})
