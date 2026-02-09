/**
 * 规则验证器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GameRules } from '../../../../lib/features/game/rules'
import { CardPatternVO, CardPatternType } from '../../../../lib/domain/value-objects/CardPatternVO'
import type { Card } from '../../../../lib/domain/entities/Card'

// 模拟卡牌数据
const createMockCard = (rank: string, suit: string = 'heart'): Card => {
  return {
    id: `card_${rank}_${suit}`,
    rank,
    suit,
    value: 0, // 简化值
    isJoker: false,
    isWildCard: false,
    compareTo: () => 0,
    toString: () => `${rank}${suit}`,
    toJSON: () => ({ rank, suit })
  } as Card
}

// 模拟游戏会话
const createMockGameSession = () => {
  return {
    id: 'test_session',
    roomId: 'test_room',
    phase: 'playing',
    currentRound: {
      roundNumber: 1,
      dealerId: 'player1',
      currentPlayerId: 'player1',
      nextPlayerId: 'player2',
      direction: 'clockwise'
    },
    rounds: [],
    players: []
  } as any
}

describe('游戏规则服务', () => {
  let gameRules: typeof GameRules

  beforeEach(() => {
    gameRules = GameRules
  })

  describe('GameRuleService', () => {
    it('应该正确验证单张出牌', () => {
      const cards = [createMockCard('A')]
      const result = gameRules.gameRuleService.validatePlay('player1', cards)

      expect(result.valid).toBe(true)
      expect(result.message).toBe('出牌验证通过')
    })

    it('应该拒绝无效牌型', () => {
      const cards = [createMockCard('A'), createMockCard('K'), createMockCard('Q')] // 不是有效牌型
      const result = gameRules.gameRuleService.validatePlay('player1', cards)

      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('INVALID_PATTERN')
    })

    it('应该正确比较牌型大小', () => {
      // 创建两个牌型进行测试
      const pattern1 = new CardPatternVO(
        CardPatternType.SINGLE,
        [createMockCard('A')],
        'A',
        1,
        14,
        1,
        true
      )

      const pattern2 = new CardPatternVO(
        CardPatternType.SINGLE,
        [createMockCard('K')],
        'K',
        1,
        13,
        1,
        true
      )

      const result = gameRules.gameRuleService.comparePatterns(pattern1, pattern2)

      expect(result.greater).toBe(true)
      expect(result.canBeat).toBe(true)
    })
  })

  describe('ScoringService', () => {
    it('应该正确计算基础积分', () => {
      const roundResult = {
        roundNumber: 1,
        winningTeamId: 'team1',
        losingTeamId: 'team2',
        winningScore: 0,
        losingScore: 0,
        bombCount: 0,
        isSpring: false,
        isCounterSpring: false,
        playRecords: []
      }

      const score = gameRules.scoringService.calculateBaseScore(roundResult)
      expect(score).toBe(2) // 基础获胜积分
    })

    it('应该正确应用炸弹奖励', () => {
      const baseScore = 2
      const bombCount = 4
      const scoreWithBonus = gameRules.scoringService.applyBombBonus(bombCount, baseScore)

      // 4张炸弹：1倍奖励，所以总积分 = 2 + 2 = 4
      expect(scoreWithBonus).toBe(4)
    })

    it('应该正确计算等级升级', () => {
      const scoreDifference = 15
      const currentLevel = 5
      const newLevel = gameRules.scoringService.calculateLevelUp(scoreDifference, currentLevel)

      // 每10分升1级，15分应该升1级
      expect(newLevel).toBe(6)
    })
  })

  describe('SpecialRuleService', () => {
    it('应该获取可用的特殊规则', () => {
      const gameSession = createMockGameSession()
      const rules = gameRules.specialRuleService.getAvailableSpecialRules(gameSession)

      expect(Array.isArray(rules)).toBe(true)
      // 王炸最大规则应该始终可用
      expect(rules).toContain('rocket_max')
    })

    it('应该提供特殊规则描述', () => {
      const description = gameRules.specialRuleService.getSpecialRuleDescription('rocket_max')
      expect(typeof description).toBe('string')
      expect(description.length).toBeGreaterThan(0)
    })
  })

  describe('GameStateMachine', () => {
    it('应该获取状态信息', () => {
      const gameSession = createMockGameSession()
      const stateInfo = gameRules.stateMachine.getStateInfo(gameSession)

      expect(stateInfo).toHaveProperty('currentState')
      expect(stateInfo).toHaveProperty('description')
      expect(stateInfo).toHaveProperty('allowedActions')
      expect(stateInfo).toHaveProperty('startTime')
    })

    it('应该验证状态转移', () => {
      const gameSession = createMockGameSession()
      const validation = gameRules.stateMachine.validateTransition(
        'preparing',
        'dealing',
        gameSession
      )

      expect(validation).toHaveProperty('valid')
      expect(validation).toHaveProperty('message')
    })
  })

  describe('RuleValidator', () => {
    it('应该验证游戏开始', () => {
      const mockRoom = {
        state: 'waiting', // 注意：RuleValidator中使用state而不是status
        players: new Map([
          ['player1', { id: 'player1', isReady: true }],
          ['player2', { id: 'player2', isReady: true }],
          ['player3', { id: 'player3', isReady: true }],
          ['player4', { id: 'player4', isReady: true }]
        ]),
        config: { gameMode: 'standard' }
      } as any

      const result = gameRules.ruleValidator.validateGameStart(mockRoom)
      expect(result.valid).toBe(true)
    })

    it('应该拒绝未准备好的游戏开始', () => {
      const mockRoom = {
        status: 'waiting',
        players: [
          { id: 'player1', isReady: true },
          { id: 'player2', isReady: false }, // 未准备
          { id: 'player3', isReady: true },
          { id: 'player4', isReady: true }
        ],
        config: { gameMode: 'standard' }
      } as any

      const result = gameRules.ruleValidator.validateGameStart(mockRoom)
      expect(result.valid).toBe(false)
      expect(result.details?.violations).toContain('有 1 个玩家未准备')
    })

    it('应该获取状态报告', () => {
      const report = gameRules.ruleValidator.getStatusReport()

      expect(report).toHaveProperty('services')
      expect(report).toHaveProperty('rules')
      expect(report).toHaveProperty('stateMachine')
      expect(Array.isArray(report.services)).toBe(true)
      expect(Array.isArray(report.rules)).toBe(true)
      expect(typeof report.stateMachine).toBe('boolean')
    })
  })

  describe('GameRules 工具包', () => {
    it('应该正确初始化', () => {
      const initialized = gameRules.initialize()

      expect(initialized).toHaveProperty('gameRuleService')
      expect(initialized).toHaveProperty('scoringService')
      expect(initialized).toHaveProperty('specialRuleService')
      expect(initialized).toHaveProperty('stateMachine')
      expect(initialized).toHaveProperty('ruleValidator')
    })

    it('应该获取状态报告', () => {
      const report = gameRules.getStatusReport()

      expect(report).toHaveProperty('services')
      expect(report).toHaveProperty('rules')
      expect(report).toHaveProperty('stateMachine')
    })

    it('应该包含所有常量', () => {
      expect(gameRules.constants).toHaveProperty('GameState')
      expect(gameRules.constants).toHaveProperty('PlayDirection')
      expect(gameRules.constants).toHaveProperty('PlayChoice')
      expect(gameRules.constants).toHaveProperty('RuleValidationError')
      expect(gameRules.constants).toHaveProperty('SpecialRule')
    })
  })
})
