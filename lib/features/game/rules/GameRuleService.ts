/**
 * 游戏规则主服务
 *
 * 实现掼蛋游戏的核心规则验证和流程控制
 */

import type { Card } from '../../../domain/entities/Card'
import type { Player } from '../../../domain/entities/Player'
import type { GameRoom } from '../../../domain/entities/GameRoom'
import type { GameSession } from '../../../domain/entities/GameSession'
import { CardPatternVO, CardPatternType } from '../../../domain/value-objects/CardPatternVO'
import { CardRecognizer } from './CardRecognizer'
import { comparePatterns } from './CardPattern'
import {
  IGameRuleService,
  ValidationResult,
  ComparisonResult,
  GameState,
  PlayDirection,
  PlayChoice,
  RuleValidationError,
  RuleValidationErrorInfo
} from './types'

/**
 * 游戏规则服务实现
 */
export class GameRuleService implements IGameRuleService {
  private cardRecognizer: CardRecognizer

  constructor() {
    this.cardRecognizer = new CardRecognizer()
  }

  /**
   * 验证玩家出牌
   */
  validatePlay(
    playerId: string,
    cards: Card[],
    currentPattern?: CardPatternVO,
    gameSession?: GameSession
  ): ValidationResult {
    try {
      // 1. 基础验证
      if (!cards || cards.length === 0) {
        return this.createValidationResult(false, '出牌不能为空', RuleValidationError.INVALID_PATTERN)
      }

      // 2. 识别牌型
      const pattern = this.cardRecognizer.recognizePattern(cards)
      if (!pattern.isValid) {
        return this.createValidationResult(false, '无效的牌型', RuleValidationError.INVALID_PATTERN, {
          patternType: pattern.type,
          pattern
        })
      }

      // 2.5 检查牌型是否使用了所有选定的牌
      if (pattern.cards.length !== cards.length) {
        return this.createValidationResult(false, '牌型不完整', RuleValidationError.INVALID_PATTERN, {
          patternType: pattern.type,
          pattern,
          expectedCards: cards.length,
          actualCards: pattern.cards.length
        })
      }

      // 3. 如果有当前牌型，需要比较大小
      if (currentPattern) {
        const comparison = this.comparePatterns(pattern, currentPattern)
        if (!comparison.canBeat) {
          return this.createValidationResult(false, '牌型太小，不能打过当前牌型', RuleValidationError.PATTERN_TOO_SMALL, {
            patternType: pattern.type,
            pattern,
            currentPatternType: currentPattern.type,
            currentPattern
          })
        }
      }

      // 4. 游戏状态验证（如果有游戏会话）
      if (gameSession) {
        const stateValidation = this.validateGameState(gameSession, playerId)
        if (!stateValidation.valid) {
          return stateValidation
        }
      }

      // 5. 验证通过
      return this.createValidationResult(true, '出牌验证通过', undefined, {
        patternType: pattern.type,
        pattern,
        specialRuleApplied: false
      })

    } catch (error) {
      console.error('出牌验证错误:', error)
      return this.createValidationResult(false, '出牌验证过程中发生错误', RuleValidationError.UNKNOWN_ERROR, {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * 比较两个牌型
   */
  comparePatterns(pattern1: CardPatternVO, pattern2: CardPatternVO): ComparisonResult {
    try {
      // 使用现有的牌型比较函数
      const comparison = comparePatterns(pattern1, pattern2)

      return {
        greater: comparison.greater,
        less: comparison.less,
        equal: comparison.equal,
        canBeat: comparison.canBeat,
        details: {
          comparisonRule: this.getComparisonRuleDescription(pattern1, pattern2),
          rankComparison: pattern1.rank.localeCompare(pattern2.rank, undefined, { numeric: true }),
          patternComparison: pattern1.value - pattern2.value
        }
      }
    } catch (error) {
      console.error('牌型比较错误:', error)
      return {
        greater: false,
        less: false,
        equal: false,
        canBeat: false
      }
    }
  }

  /**
   * 判断游戏是否可以开始
   */
  canStartGame(room: GameRoom): boolean {
    try {
      // 1. 检查房间状态
      if (room.state !== 'waiting') {
        return false
      }

      // 2. 检查玩家数量（掼蛋需要4人）
      if (room.players.size < 4) {
        return false
      }

      // 3. 检查所有玩家是否准备就绪
      const allPlayersReady = Array.from(room.players.values()).every(player => player.isReady)
      if (!allPlayersReady) {
        return false
      }

      // 4. 检查房间配置
      if (!room.config || !room.config.gameMode) {
        return false
      }

      return true
    } catch (error) {
      console.error('游戏开始检查错误:', error)
      return false
    }
  }

  /**
   * 确定庄家
   */
  determineDealer(players: Player[], gameSession?: GameSession): string {
    try {
      // 如果有游戏会话，检查是否有上一局的庄家
      if (gameSession && gameSession.currentRound && gameSession.currentRound.dealerId) {
        // 掼蛋规则：庄家轮转
        const currentDealerIndex = players.findIndex(p => p.userId === gameSession.currentRound!.dealerId)
        if (currentDealerIndex !== -1) {
          const nextDealerIndex = (currentDealerIndex + 1) % players.length
          return players[nextDealerIndex].userId
        }
      }

      // 默认规则：随机选择庄家
      const randomIndex = Math.floor(Math.random() * players.length)
      return players[randomIndex].userId
    } catch (error) {
      console.error('确定庄家错误:', error)
      // 返回第一个玩家作为备选
      return players[0]?.userId || ''
    }
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
    try {
      // 找到当前玩家索引
      const currentIndex = players.findIndex(p => p.userId === currentPlayerId)
      if (currentIndex === -1) {
        throw new Error(`找不到玩家: ${currentPlayerId}`)
      }

      // 计算下一个玩家索引
      let nextIndex: number
      if (direction === PlayDirection.CLOCKWISE) {
        nextIndex = (currentIndex + 1) % players.length
      } else {
        nextIndex = (currentIndex - 1 + players.length) % players.length
      }

      // 检查下一个玩家是否已过牌
      const nextPlayer = players[nextIndex]
      if (passedPlayers.includes(nextPlayer.userId)) {
        // 如果已过牌，继续找下一个
        return this.getNextPlayer(nextPlayer.userId, players, direction, passedPlayers)
      }

      return nextPlayer.userId
    } catch (error) {
      console.error('获取下一个玩家错误:', error)
      // 返回当前玩家作为备选
      return currentPlayerId
    }
  }

  /**
   * 检查回合是否结束
   */
  isRoundEnd(players: Player[], passedPlayers: string[], lastPlayerId: string): boolean {
    try {
      // 掼蛋规则：当有三个玩家过牌时，回合结束
      if (passedPlayers.length >= 3) {
        return true
      }

      // 或者最后一个出牌的玩家是当前回合的获胜者
      // 这里需要结合游戏状态判断，暂时返回false
      return false
    } catch (error) {
      console.error('检查回合结束错误:', error)
      return false
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 创建验证结果
   */
  private createValidationResult(
    valid: boolean,
    message: string,
    errorCode?: RuleValidationError,
    details?: any
  ): ValidationResult {
    const result: ValidationResult = {
      valid,
      message
    }

    if (errorCode) {
      result.errorCode = errorCode
    }

    if (details) {
      result.details = details
    }

    if (!valid && errorCode) {
      result.details = {
        ...result.details,
        violations: [this.getErrorDescription(errorCode)]
      }
    }

    return result
  }

  /**
   * 验证游戏状态
   */
  private validateGameState(gameSession: GameSession, playerId: string): ValidationResult {
    // 1. 检查游戏是否在进行中
    if (gameSession.phase !== 'playing') {
      return this.createValidationResult(false, '游戏未在进行中', RuleValidationError.GAME_NOT_STARTED)
    }

    // 2. 检查是否是当前玩家回合
    if (gameSession.currentRound && gameSession.currentRound.currentPlayerId !== playerId) {
      return this.createValidationResult(false, '不是你的回合', RuleValidationError.NOT_YOUR_TURN)
    }

    // 3. 检查玩家是否已过牌
    const plays = gameSession.plays || []
    const playerHasPassed = plays.some(play => play.playerId === playerId && play.choice === 'pass')
    if (playerHasPassed) {
      return this.createValidationResult(false, '你已经过牌了', RuleValidationError.PLAYER_ALREADY_PASSED)
    }

    return this.createValidationResult(true, '游戏状态验证通过')
  }

  /**
   * 获取比较规则描述
   */
  private getComparisonRuleDescription(pattern1: CardPatternVO, pattern2: CardPatternVO): string {
    if (pattern1.type === CardPatternType.ROCKET) {
      return '王炸最大'
    }

    if (pattern2.type === CardPatternType.ROCKET) {
      return '王炸最大'
    }

    if (pattern1.type === CardPatternType.BOMB && pattern2.type === CardPatternType.BOMB) {
      return `炸弹比较：${pattern1.count}张炸弹 vs ${pattern2.count}张炸弹`
    }

    if (pattern1.type === CardPatternType.BOMB) {
      return '炸弹可以打过非炸弹牌型'
    }

    if (pattern2.type === CardPatternType.BOMB) {
      return '非炸弹牌型不能打过炸弹'
    }

    if (pattern1.type !== pattern2.type) {
      return '牌型不同不能比较'
    }

    return `相同牌型比较：${pattern1.rank} vs ${pattern2.rank}`
  }

  /**
   * 获取错误描述
   */
  private getErrorDescription(errorCode: RuleValidationError): string {
    const errorDescriptions: Record<RuleValidationError, string> = {
      [RuleValidationError.INVALID_PATTERN]: '无效的牌型',
      [RuleValidationError.PATTERN_MISMATCH]: '牌型不匹配',
      [RuleValidationError.PATTERN_TOO_SMALL]: '牌型太小',
      [RuleValidationError.NOT_YOUR_TURN]: '不是你的回合',
      [RuleValidationError.PLAYER_ALREADY_PASSED]: '玩家已过牌',
      [RuleValidationError.GAME_NOT_STARTED]: '游戏未开始',
      [RuleValidationError.INVALID_GAME_STATE]: '无效的游戏状态',
      [RuleValidationError.INSUFFICIENT_CARDS]: '玩家手牌不足',
      [RuleValidationError.SPECIAL_RULE_VIOLATION]: '特殊规则违反',
      [RuleValidationError.UNKNOWN_ERROR]: '未知错误'
    }

    return errorDescriptions[errorCode] || '未知错误'
  }

  /**
   * 获取错误信息
   */
  private getErrorInfo(errorCode: RuleValidationError): RuleValidationErrorInfo {
    const errorMessages: Record<RuleValidationError, string> = {
      [RuleValidationError.INVALID_PATTERN]: '出的牌不符合任何有效牌型',
      [RuleValidationError.PATTERN_MISMATCH]: '出的牌型与当前牌型不匹配',
      [RuleValidationError.PATTERN_TOO_SMALL]: '出的牌型太小，不能打过当前牌型',
      [RuleValidationError.NOT_YOUR_TURN]: '请等待你的回合',
      [RuleValidationError.PLAYER_ALREADY_PASSED]: '你已经过牌了，不能再次出牌',
      [RuleValidationError.GAME_NOT_STARTED]: '游戏尚未开始',
      [RuleValidationError.INVALID_GAME_STATE]: '当前游戏状态不允许此操作',
      [RuleValidationError.INSUFFICIENT_CARDS]: '手牌数量不足',
      [RuleValidationError.SPECIAL_RULE_VIOLATION]: '违反特殊游戏规则',
      [RuleValidationError.UNKNOWN_ERROR]: '发生未知错误，请重试'
    }

    const errorSuggestions: Record<RuleValidationError, string> = {
      [RuleValidationError.INVALID_PATTERN]: '请选择有效的牌型组合',
      [RuleValidationError.PATTERN_MISMATCH]: '请选择与当前牌型相同的牌型',
      [RuleValidationError.PATTERN_TOO_SMALL]: '请选择更大的牌型或选择过牌',
      [RuleValidationError.NOT_YOUR_TURN]: '请等待其他玩家出牌',
      [RuleValidationError.PLAYER_ALREADY_PASSED]: '请等待下一回合',
      [RuleValidationError.GAME_NOT_STARTED]: '请等待所有玩家准备就绪',
      [RuleValidationError.INVALID_GAME_STATE]: '请检查游戏状态',
      [RuleValidationError.INSUFFICIENT_CARDS]: '请选择足够数量的牌',
      [RuleValidationError.SPECIAL_RULE_VIOLATION]: '请遵守特殊游戏规则',
      [RuleValidationError.UNKNOWN_ERROR]: '请刷新页面或联系管理员'
    }

    return {
      code: errorCode,
      message: errorMessages[errorCode] || '发生错误',
      suggestion: errorSuggestions[errorCode] || '请重试'
    }
  }
}

/**
 * 游戏规则服务单例
 */
export class GameRuleServiceSingleton {
  private static instance: GameRuleService

  static getInstance(): GameRuleService {
    if (!GameRuleServiceSingleton.instance) {
      GameRuleServiceSingleton.instance = new GameRuleService()
    }
    return GameRuleServiceSingleton.instance
  }
}