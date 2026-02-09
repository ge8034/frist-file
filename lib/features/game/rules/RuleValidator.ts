/**
 * 规则验证器
 *
 * 掼蛋游戏规则验证器，集成所有规则验证功能
 */

import type { Card } from '../../../domain/entities/Card'
import type { Player } from '../../../domain/entities/Player'
import type { GameRoom } from '../../../domain/entities/GameRoom'
import type { GameSession } from '../../../domain/entities/GameSession'
import { CardPatternVO } from '../../../domain/value-objects/CardPatternVO'
import { GameRuleServiceSingleton } from './GameRuleService'
import { ScoringServiceSingleton } from './ScoringService'
import { SpecialRuleServiceSingleton } from './SpecialRuleService'
import { GameStateMachineSingleton } from './GameStateMachine'
import {
  ValidationResult,
  ComparisonResult,
  GameState,
  PlayDirection,
  RuleValidationError
} from './types'

/**
 * 规则验证器
 *
 * 提供统一的规则验证接口，集成所有规则服务
 */
export class RuleValidator {
  private gameRuleService = GameRuleServiceSingleton.getInstance()
  private scoringService = ScoringServiceSingleton.getInstance()
  private specialRuleService = SpecialRuleServiceSingleton.getInstance()
  private stateMachine = GameStateMachineSingleton.getInstance()

  /**
   * 验证玩家出牌
   */
  validatePlay(
    playerId: string,
    cards: Card[],
    currentPattern?: CardPatternVO,
    gameSession?: GameSession
  ): ValidationResult {
    // 1. 使用游戏规则服务验证基本规则
    const basicValidation = this.gameRuleService.validatePlay(playerId, cards, currentPattern, gameSession)
    if (!basicValidation.valid) {
      return basicValidation
    }

    // 2. 如果有游戏会话，验证特殊规则
    if (gameSession) {
      const specialRules = this.specialRuleService.getAvailableSpecialRules(gameSession)
      for (const rule of specialRules) {
        const ruleValidation = this.specialRuleService.validateSpecialRuleApplication(rule, cards, gameSession)
        if (!ruleValidation.valid) {
          return ruleValidation
        }
      }
    }

    // 3. 验证通过
    return {
      valid: true,
      message: '出牌验证通过',
      details: {
        ...basicValidation.details,
        specialRulesApplied: gameSession ? this.specialRuleService.getAvailableSpecialRules(gameSession) : []
      }
    }
  }

  /**
   * 验证游戏是否可以开始
   */
  validateGameStart(room: GameRoom): ValidationResult {
    const canStart = this.gameRuleService.canStartGame(room)

    if (!canStart) {
      return {
        valid: false,
        message: '游戏不能开始',
        errorCode: RuleValidationError.INVALID_GAME_STATE,
        details: {
          violations: this.getGameStartViolations(room)
        }
      }
    }

    return {
      valid: true,
      message: '游戏可以开始'
    }
  }

  /**
   * 验证状态转移
   */
  validateStateTransition(
    fromState: GameState,
    toState: GameState,
    gameSession: GameSession
  ): ValidationResult {
    return this.stateMachine.validateTransition(fromState, toState, gameSession)
  }

  /**
   * 验证积分计算
   */
  validateScoreCalculation(scores: any[]): ValidationResult {
    // 这里需要将 scores 转换为 PlayerScore 类型
    // 暂时使用简化验证
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return {
        valid: false,
        message: '积分数据无效',
        errorCode: RuleValidationError.SPECIAL_RULE_VIOLATION
      }
    }

    // 检查积分是否在合理范围内
    const invalidScores = scores.filter(score => {
      const total = score.totalScore || 0
      return total < -100 || total > 100 // 假设合理范围是-100到100
    })

    if (invalidScores.length > 0) {
      return {
        valid: false,
        message: '积分超出合理范围',
        errorCode: RuleValidationError.SPECIAL_RULE_VIOLATION,
        details: {
          violations: invalidScores.map(s => `玩家 ${s.playerId} 积分 ${s.totalScore} 超出范围`)
        }
      }
    }

    return {
      valid: true,
      message: '积分计算验证通过'
    }
  }

  /**
   * 验证玩家操作
   */
  validatePlayerAction(
    playerId: string,
    action: string,
    gameSession: GameSession
  ): ValidationResult {
    const stateInfo = this.stateMachine.getStateInfo(gameSession)
    const allowedActions = stateInfo.allowedActions

    if (!allowedActions.includes(action)) {
      return {
        valid: false,
        message: `当前状态不允许执行操作: ${action}`,
        errorCode: RuleValidationError.INVALID_GAME_STATE,
        details: {
          currentState: stateInfo.currentState,
          allowedActions,
          attemptedAction: action
        }
      }
    }

    // 检查玩家是否在游戏中
    const playerInGame = this.isPlayerInGame(playerId, gameSession)
    if (!playerInGame) {
      return {
        valid: false,
        message: '玩家不在游戏中',
        errorCode: RuleValidationError.NOT_YOUR_TURN
      }
    }

    return {
      valid: true,
      message: '玩家操作验证通过'
    }
  }

  /**
   * 比较两个牌型
   */
  comparePatterns(pattern1: CardPatternVO, pattern2: CardPatternVO): ComparisonResult {
    return this.gameRuleService.comparePatterns(pattern1, pattern2)
  }

  /**
   * 获取下一个出牌玩家
   */
  getNextPlayer(
    currentPlayerId: string,
    players: Player[],
    direction: PlayDirection,
    passedPlayers: string[]
  ): string {
    return this.gameRuleService.getNextPlayer(currentPlayerId, players, direction, passedPlayers)
  }

  /**
   * 检查回合是否结束
   */
  isRoundEnd(players: Player[], passedPlayers: string[], lastPlayerId: string): boolean {
    return this.gameRuleService.isRoundEnd(players, passedPlayers, lastPlayerId)
  }

  /**
   * 计算基础积分
   */
  calculateBaseScore(roundResult: any): number {
    return this.scoringService.calculateBaseScore(roundResult)
  }

  /**
   * 应用炸弹奖励
   */
  applyBombBonus(bombCount: number, baseScore: number): number {
    return this.scoringService.applyBombBonus(bombCount, baseScore)
  }

  /**
   * 识别逢人配牌型
   */
  recognizeWithWildCard(cards: Card[], wildCardRank: string): CardPatternVO {
    return this.specialRuleService.recognizeWithWildCard(cards, wildCardRank)
  }

  /**
   * 获取可用的特殊规则
   */
  getAvailableSpecialRules(gameSession: GameSession): string[] {
    return this.specialRuleService.getAvailableSpecialRules(gameSession)
  }

  /**
   * 获取有效转移状态
   */
  getValidTransitions(currentState: GameState, gameSession: GameSession): GameState[] {
    return this.stateMachine.getValidTransitions(currentState, gameSession)
  }

  /**
   * 获取状态信息
   */
  getStateInfo(gameSession: GameSession) {
    return this.stateMachine.getStateInfo(gameSession)
  }

  // ==================== 辅助方法 ====================

  /**
   * 获取游戏开始违规详情
   */
  private getGameStartViolations(room: GameRoom): string[] {
    const violations: string[] = []

    // 检查房间状态
    if (room.state !== 'waiting') {
      violations.push(`房间状态为 ${room.state}，需要为 waiting`)
    }

    // 检查玩家数量
    if (room.players.size < 4) {
      violations.push(`玩家数量不足: ${room.players.size}/4`)
    }

    // 检查玩家准备状态
    const notReadyPlayers = Array.from(room.players.values()).filter(p => !p.isReady)
    if (notReadyPlayers.length > 0) {
      violations.push(`有 ${notReadyPlayers.length} 个玩家未准备`)
    }

    // 检查房间配置
    if (!room.config || !room.config.gameMode) {
      violations.push('房间配置不完整')
    }

    return violations
  }

  /**
   * 检查玩家是否在游戏中
   */
  private isPlayerInGame(playerId: string, gameSession: GameSession): boolean {
    // 需要从游戏会话中获取玩家列表
    // 暂时返回true
    return true
  }

  /**
   * 获取规则验证器状态报告
   */
  getStatusReport(): {
    services: string[]
    rules: string[]
    stateMachine: boolean
  } {
    return {
      services: [
        'GameRuleService: 已加载',
        'ScoringService: 已加载',
        'SpecialRuleService: 已加载',
        'GameStateMachine: 已加载'
      ],
      rules: this.specialRuleService.getAvailableSpecialRules({} as GameSession),
      stateMachine: true
    }
  }
}

/**
 * 规则验证器单例
 */
export class RuleValidatorSingleton {
  private static instance: RuleValidator

  static getInstance(): RuleValidator {
    if (!RuleValidatorSingleton.instance) {
      RuleValidatorSingleton.instance = new RuleValidator()
    }
    return RuleValidatorSingleton.instance
  }
}
