/**
 * 游戏流程集成测试
 *
 * 测试游戏规则服务与现有系统的集成
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GameRules } from '../../../lib/features/game/rules'
import type { Card } from '../../../lib/domain/entities/Card'
import type { GameSession } from '../../../lib/domain/entities/GameSession'

// 模拟数据
const createMockCard = (rank: string): Card => {
  return {
    id: `card_${rank}`,
    rank,
    suit: 'heart',
    value: parseInt(rank) || (rank === 'A' ? 14 : rank === 'K' ? 13 : rank === 'Q' ? 12 : rank === 'J' ? 11 : 0),
    isJoker: false,
    isWildCard: false,
    compareTo: () => 0,
    toString: () => rank,
    toJSON: () => ({ rank, suit: 'heart' })
  } as Card
}

const createMockGameSession = (phase: string = 'playing'): GameSession => {
  return {
    id: 'test_session',
    roomId: 'test_room',
    phase,
    currentRound: phase === 'playing' ? {
      roundNumber: 1,
      dealerId: 'player1',
      currentPlayerId: 'player1',
      nextPlayerId: 'player2',
      direction: 'clockwise'
    } : null,
    rounds: [],
    players: [
      { userId: 'player1', name: '玩家1', teamId: 'team1' },
      { userId: 'player2', name: '玩家2', teamId: 'team2' },
      { userId: 'player3', name: '玩家3', teamId: 'team1' },
      { userId: 'player4', name: '玩家4', teamId: 'team2' }
    ],
    plays: [],
    config: {
      gameMode: 'standard',
      specialRules: []
    }
  } as any
}

describe('游戏流程集成测试', () => {
  let gameRules: typeof GameRules

  beforeEach(() => {
    gameRules = GameRules
  })

  describe('完整游戏流程', () => {
    it('应该处理完整的出牌流程', () => {
      // 1. 初始化游戏
      const gameSession = createMockGameSession()
      const ruleValidator = gameRules.ruleValidator

      // 2. 验证游戏开始
      const mockRoom = {
        state: 'waiting',
        players: new Map([
          ['player1', { id: 'player1', isReady: true }],
          ['player2', { id: 'player2', isReady: true }],
          ['player3', { id: 'player3', isReady: true }],
          ['player4', { id: 'player4', isReady: true }]
        ]),
        config: { gameMode: 'standard' }
      } as any

      const startValidation = ruleValidator.validateGameStart(mockRoom)
      expect(startValidation.valid).toBe(true)

      // 3. 玩家1出牌（单张A）
      const player1Cards = [createMockCard('A')]
      const play1Validation = ruleValidator.validatePlay('player1', player1Cards, undefined, gameSession)
      if (!play1Validation.valid) {
        console.log('出牌验证失败:', play1Validation.message, play1Validation.errorCode, play1Validation.details)
      }
      expect(play1Validation.valid).toBe(true)

      // 4. 玩家2尝试出更小的牌（应该失败）
      const player2Cards = [createMockCard('K')]
      const pattern1 = play1Validation.details?.pattern
      const play2Validation = ruleValidator.validatePlay('player2', player2Cards, pattern1, gameSession)
      expect(play2Validation.valid).toBe(false)
      expect(play2Validation.errorCode).toBe('PATTERN_TOO_SMALL')

      // 5. 玩家2选择过牌
      const playerActionValidation = ruleValidator.validatePlayerAction('player2', 'pass', gameSession)
      expect(playerActionValidation.valid).toBe(true)

      // 6. 获取下一个玩家
      const players = gameSession.players
      const nextPlayer = ruleValidator.getNextPlayer('player1', players, 'clockwise', ['player2'])
      expect(nextPlayer).toBe('player3')
    })

    it('应该处理积分计算流程', () => {
      const scoringService = gameRules.scoringService

      // 模拟回合结果
      const roundResult = {
        roundNumber: 1,
        winningTeamId: 'team1',
        losingTeamId: 'team2',
        winningScore: 0,
        losingScore: 0,
        bombCount: 4, // 4张炸弹
        isSpring: false,
        isCounterSpring: false,
        playRecords: []
      }

      // 计算基础积分
      const baseScore = scoringService.calculateBaseScore(roundResult)
      expect(baseScore).toBe(2)

      // 应用炸弹奖励
      const totalScore = scoringService.applyBombBonus(roundResult.bombCount, baseScore)
      expect(totalScore).toBe(4) // 2 + (2 * 1) = 4 (4张炸弹：1倍奖励)

      // 计算玩家积分
      const playerScore = scoringService.calculatePlayerScore(
        'player1',
        '玩家1',
        'team1',
        baseScore,
        roundResult.bombCount,
        5 // 当前等级5
      )

      expect(playerScore.playerId).toBe('player1')
      expect(playerScore.totalScore).toBe(totalScore)
      expect(playerScore.bombBonus).toBe(2) // 4张炸弹的奖励：基础分 * 1 = 2
    })

    it('应该处理状态转移流程', () => {
      const stateMachine = gameRules.stateMachine
      const gameSession = createMockGameSession('preparing')

      // 获取当前状态信息
      const stateInfo = stateMachine.getStateInfo(gameSession)
      expect(stateInfo.currentState).toBe('preparing')

      // 获取有效转移状态
      const validTransitions = stateMachine.getValidTransitions('preparing', gameSession)
      expect(Array.isArray(validTransitions)).toBe(true)

      // 验证状态转移
      const validation = stateMachine.validateTransition('preparing', 'dealing', gameSession)
      expect(validation).toHaveProperty('valid')
    })
  })

  describe('特殊规则集成', () => {
    it('应该集成特殊规则服务', () => {
      const specialRuleService = gameRules.specialRuleService
      const gameSession = createMockGameSession()

      // 获取可用规则
      const availableRules = specialRuleService.getAvailableSpecialRules(gameSession)
      expect(Array.isArray(availableRules)).toBe(true)

      // 检查王炸最大规则
      expect(availableRules).toContain('rocket_max')

      // 获取规则描述
      const ruleDescription = specialRuleService.getSpecialRuleDescription('rocket_max')
      expect(typeof ruleDescription).toBe('string')
      expect(ruleDescription.length).toBeGreaterThan(0)
    })

    it('应该集成逢人配规则', () => {
      const specialRuleService = gameRules.specialRuleService

      // 测试逢人配牌型识别
      const cards = [
        createMockCard('A'),
        createMockCard('A'),
        createMockCard('2') // 假设2是逢人配
      ]

      const pattern = specialRuleService.recognizeWithWildCard(cards, '2')
      expect(pattern).toBeDefined()
    })
  })

  describe('错误处理集成', () => {
    it('应该处理无效出牌', () => {
      const ruleValidator = gameRules.ruleValidator
      const gameSession = createMockGameSession()

      // 无效牌型
      const invalidCards = [
        createMockCard('A'),
        createMockCard('K'),
        createMockCard('Q')
      ]

      const validation = ruleValidator.validatePlay('player1', invalidCards, undefined, gameSession)
      expect(validation.valid).toBe(false)
      expect(validation.errorCode).toBe('INVALID_PATTERN')
    })

    it('应该处理无效游戏状态', () => {
      const ruleValidator = gameRules.ruleValidator
      const gameSession = createMockGameSession('game_end') // 游戏已结束

      // 在游戏结束状态尝试出牌
      const cards = [createMockCard('A')]
      const validation = ruleValidator.validatePlay('player1', cards, undefined, gameSession)
      expect(validation.valid).toBe(false)
      expect(validation.errorCode).toBe('GAME_NOT_STARTED')
    })
  })

  describe('性能测试', () => {
    it('应该快速验证出牌', () => {
      const ruleValidator = gameRules.ruleValidator
      const gameSession = createMockGameSession()

      const startTime = performance.now()

      // 多次验证出牌
      for (let i = 0; i < 100; i++) {
        const cards = [createMockCard('A')]
        ruleValidator.validatePlay('player1', cards, undefined, gameSession)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // 100次验证应该在1秒内完成
      expect(duration).toBeLessThan(1000)
      console.log(`100次出牌验证耗时: ${duration.toFixed(2)}ms`)
    })
  })
})
