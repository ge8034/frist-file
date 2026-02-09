/**
 * 游戏规则服务类型定义
 *
 * 定义掼蛋游戏规则服务所需的接口和类型
 */

import type { Card } from '../../../domain/entities/Card'
import type { Player } from '../../../domain/entities/Player'
import type { GameRoom } from '../../../domain/entities/GameRoom'
import type { GameSession } from '../../../domain/entities/GameSession'
import type { CardPatternVO, CardPatternType } from '../../../domain/value-objects/CardPatternVO'

// ==================== 游戏状态类型 ====================

/**
 * 游戏状态枚举
 */
export enum GameState {
  /** 准备阶段：玩家加入房间，准备游戏 */
  PREPARING = 'preparing',

  /** 发牌阶段：系统发牌给玩家 */
  DEALING = 'dealing',

  /** 叫牌阶段：玩家叫主牌 */
  BIDDING = 'bidding',

  /** 出牌阶段：玩家轮流出牌 */
  PLAYING = 'playing',

  /** 回合结束：一轮出牌结束 */
  ROUND_END = 'round_end',

  /** 游戏结束：整局游戏结束 */
  GAME_END = 'game_end'
}

/**
 * 出牌方向
 */
export enum PlayDirection {
  /** 顺时针 */
  CLOCKWISE = 'clockwise',

  /** 逆时针 */
  COUNTER_CLOCKWISE = 'counter-clockwise'
}

/**
 * 出牌选择
 */
export enum PlayChoice {
  /** 出牌 */
  PLAY = 'play',

  /** 过牌 */
  PASS = 'pass',

  /** 弃牌 */
  DISCARD = 'discard',

  /** 提示 */
  HINT = 'hint'
}

// ==================== 验证结果类型 ====================

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean

  /** 验证消息 */
  message?: string

  /** 错误代码 */
  errorCode?: string

  /** 建议的牌型（如果验证失败但有建议） */
  suggestedPattern?: CardPatternVO

  /** 验证详情 */
  details?: {
    /** 牌型类型 */
    patternType?: CardPatternType

    /** 牌型值对象 */
    pattern?: CardPatternVO

    /** 是否满足特殊规则 */
    specialRuleApplied?: boolean

    /** 规则违反详情 */
    violations?: string[]

    /** 附加信息 */
    [key: string]: any
  }
}

/**
 * 比较结果
 */
export interface ComparisonResult {
  /** 第一个牌型是否更大 */
  greater: boolean

  /** 第一个牌型是否更小 */
  less: boolean

  /** 两个牌型是否相等 */
  equal: boolean

  /** 第一个牌型是否能打过第二个牌型 */
  canBeat: boolean

  /** 比较详情 */
  details?: {
    /** 牌型比较规则 */
    comparisonRule: string

    /** 主牌面比较结果 */
    rankComparison: number

    /** 牌型大小比较结果 */
    patternComparison: number
  }
}

// ==================== 游戏规则接口 ====================

/**
 * 游戏规则服务接口
 */
export interface IGameRuleService {
  /**
   * 验证玩家出牌
   * @param playerId 玩家ID
   * @param cards 要出的牌
   * @param currentPattern 当前牌桌上的牌型（可选）
   * @param gameSession 游戏会话
   * @returns 验证结果
   */
  validatePlay(
    playerId: string,
    cards: Card[],
    currentPattern?: CardPatternVO,
    gameSession?: GameSession
  ): ValidationResult

  /**
   * 比较两个牌型
   * @param pattern1 第一个牌型
   * @param pattern2 第二个牌型
   * @returns 比较结果
   */
  comparePatterns(pattern1: CardPatternVO, pattern2: CardPatternVO): ComparisonResult

  /**
   * 判断游戏是否可以开始
   * @param room 游戏房间
   * @returns 是否可以开始
   */
  canStartGame(room: GameRoom): boolean

  /**
   * 确定庄家
   * @param players 玩家列表
   * @param gameSession 游戏会话（可选）
   * @returns 庄家ID
   */
  determineDealer(players: Player[], gameSession?: GameSession): string

  /**
   * 获取下一个出牌玩家
   * @param currentPlayerId 当前玩家ID
   * @param players 玩家列表
   * @param direction 出牌方向
   * @param passedPlayers 已过牌的玩家ID列表
   * @returns 下一个玩家ID
   */
  getNextPlayer(
    currentPlayerId: string,
    players: Player[],
    direction: PlayDirection,
    passedPlayers: string[]
  ): string

  /**
   * 检查回合是否结束
   * @param players 玩家列表
   * @param passedPlayers 已过牌的玩家ID列表
   * @param lastPlayerId 最后出牌的玩家ID
   * @returns 回合是否结束
   */
  isRoundEnd(players: Player[], passedPlayers: string[], lastPlayerId: string): boolean
}

/**
 * 积分计算服务接口
 */
export interface IScoringService {
  /**
   * 计算基础积分
   * @param roundResult 回合结果
   * @returns 基础积分
   */
  calculateBaseScore(roundResult: RoundResult): number

  /**
   * 应用炸弹奖励
   * @param bombCount 炸弹数量
   * @param baseScore 基础积分
   * @returns 调整后的积分
   */
  applyBombBonus(bombCount: number, baseScore: number): number

  /**
   * 计算队伍积分
   * @param scores 玩家积分列表
   * @returns 队伍积分结果
   */
  calculateTeamScores(scores: PlayerScore[]): TeamScoreResult

  /**
   * 计算等级升级
   * @param scoreDifference 积分差
   * @param currentLevel 当前等级
   * @returns 新的等级
   */
  calculateLevelUp(scoreDifference: number, currentLevel: number): number

  /**
   * 判断是否春天（一方未出牌）
   * @param roundResult 回合结果
   * @returns 是否春天
   */
  isSpring(roundResult: RoundResult): boolean

  /**
   * 判断是否反春（一方出完牌后对方未出牌）
   * @param roundResult 回合结果
   * @returns 是否反春
   */
  isCounterSpring(roundResult: RoundResult): boolean
}

/**
 * 特殊规则服务接口
 */
export interface ISpecialRuleService {
  /**
   * 识别逢人配牌型
   * @param cards 手牌
   * @param wildCardRank 逢人配点数
   * @returns 牌型值对象
   */
  recognizeWithWildCard(cards: Card[], wildCardRank: string): CardPatternVO

  /**
   * 应用逢人配规则
   * @param pattern 原始牌型
   * @param wildCardRank 逢人配点数
   * @returns 应用逢人配后的牌型
   */
  applyWildCardRule(pattern: CardPatternVO, wildCardRank: string): CardPatternVO

  /**
   * 检查是否满足特殊规则条件
   * @param gameSession 游戏会话
   * @param ruleName 规则名称
   * @returns 是否满足条件
   */
  checkSpecialRuleCondition(gameSession: GameSession, ruleName: string): boolean

  /**
   * 获取可用的特殊规则
   * @param gameSession 游戏会话
   * @returns 可用规则列表
   */
  getAvailableSpecialRules(gameSession: GameSession): string[]
}

/**
 * 游戏状态机接口
 */
export interface IGameStateMachine {
  /**
   * 状态转移
   * @param newState 新状态
   * @param gameSession 游戏会话
   * @returns 是否转移成功
   */
  transitionTo(newState: GameState, gameSession: GameSession): boolean

  /**
   * 获取有效转移状态
   * @param currentState 当前状态
   * @param gameSession 游戏会话
   * @returns 有效转移状态列表
   */
  getValidTransitions(currentState: GameState, gameSession: GameSession): GameState[]

  /**
   * 验证状态转移
   * @param fromState 起始状态
   * @param toState 目标状态
   * @param gameSession 游戏会话
   * @returns 验证结果
   */
  validateTransition(fromState: GameState, toState: GameState, gameSession: GameSession): ValidationResult

  /**
   * 获取当前状态信息
   * @param gameSession 游戏会话
   * @returns 状态信息
   */
  getStateInfo(gameSession: GameSession): StateInfo
}

// ==================== 数据模型类型 ====================

/**
 * 回合结果
 */
export interface RoundResult {
  /** 回合编号 */
  roundNumber: number

  /** 获胜队伍ID */
  winningTeamId: string

  /** 失败队伍ID */
  losingTeamId: string

  /** 获胜队伍得分 */
  winningScore: number

  /** 失败队伍得分 */
  losingScore: number

  /** 炸弹数量 */
  bombCount: number

  /** 是否春天 */
  isSpring: boolean

  /** 是否反春 */
  isCounterSpring: boolean

  /** 出牌记录 */
  playRecords: PlayRecord[]
}

/**
 * 玩家积分
 */
export interface PlayerScore {
  /** 玩家ID */
  playerId: string

  /** 玩家名称 */
  playerName: string

  /** 队伍ID */
  teamId: string

  /** 基础积分 */
  baseScore: number

  /** 炸弹奖励 */
  bombBonus: number

  /** 特殊规则奖励 */
  specialBonus: number

  /** 总积分 */
  totalScore: number

  /** 当前等级 */
  currentLevel: number

  /** 新等级 */
  newLevel: number
}

/**
 * 队伍积分结果
 */
export interface TeamScoreResult {
  /** 队伍ID */
  teamId: string

  /** 队伍名称 */
  teamName: string

  /** 队伍总积分 */
  totalScore: number

  /** 队伍等级变化 */
  levelChange: number

  /** 队伍成员积分 */
  memberScores: PlayerScore[]
}

/**
 * 出牌记录
 */
export interface PlayRecord {
  /** 玩家ID */
  playerId: string

  /** 玩家名称 */
  playerName: string

  /** 出的牌 */
  cards: Card[]

  /** 牌型 */
  pattern: CardPatternVO

  /** 出牌时间 */
  timestamp: Date

  /** 是否过牌 */
  isPass: boolean

  /** 是否获胜出牌 */
  isWinningPlay: boolean
}

/**
 * 状态信息
 */
export interface StateInfo {
  /** 当前状态 */
  currentState: GameState

  /** 状态描述 */
  description: string

  /** 允许的操作 */
  allowedActions: string[]

  /** 状态持续时间（毫秒） */
  duration?: number

  /** 状态开始时间 */
  startTime: Date

  /** 状态结束时间（可选） */
  endTime?: Date
}

// ==================== 错误类型 ====================

/**
 * 规则验证错误代码
 */
export enum RuleValidationError {
  /** 无效的牌型 */
  INVALID_PATTERN = 'INVALID_PATTERN',

  /** 牌型不匹配 */
  PATTERN_MISMATCH = 'PATTERN_MISMATCH',

  /** 牌型太小 */
  PATTERN_TOO_SMALL = 'PATTERN_TOO_SMALL',

  /** 不是当前玩家回合 */
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',

  /** 玩家已过牌 */
  PLAYER_ALREADY_PASSED = 'PLAYER_ALREADY_PASSED',

  /** 游戏未开始 */
  GAME_NOT_STARTED = 'GAME_NOT_STARTED',

  /** 无效的游戏状态 */
  INVALID_GAME_STATE = 'INVALID_GAME_STATE',

  /** 玩家手牌不足 */
  INSUFFICIENT_CARDS = 'INSUFFICIENT_CARDS',

  /** 特殊规则违反 */
  SPECIAL_RULE_VIOLATION = 'SPECIAL_RULE_VIOLATION',

  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 规则验证错误
 */
export interface RuleValidationErrorInfo {
  /** 错误代码 */
  code: RuleValidationError

  /** 错误消息 */
  message: string

  /** 错误详情 */
  details?: Record<string, any>

  /** 建议的修复 */
  suggestion?: string
}