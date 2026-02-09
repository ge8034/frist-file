/**
 * 策略基类
 *
 * 定义AI策略接口，提供基础决策框架
 * 职责：
 * 1. 定义策略接口和基础框架
 * 2. 提供通用的决策评估方法
 * 3. 管理策略配置和状态
 * 4. 提供策略切换和组合支持
 */

import type { Card } from '../../../../domain/entities/Card'
import type { GameSession } from '../../../../domain/entities/GameSession'
import type { CardPatternVO } from '../../../../domain/value-objects/CardPatternVO'
import type {
  PlayOption,
  GameStateSnapshot,
  PlayRecord,
  MemoryEntry,
  TeamworkState,
  StrategyConfig,
  AIStrategyType
} from '../types'
import { AIDifficultyLevel } from '../types'

/**
 * 游戏记忆类型
 */
export interface GameMemory {
  /** 游戏状态快照 */
  snapshots: GameStateSnapshot[]

  /** 出牌记录 */
  playRecords: PlayRecord[]

  /** 玩家记忆 */
  playerMemories: Map<string, MemoryEntry>

  /** 团队协作状态 */
  teamworkState?: TeamworkState
}

/**
 * 策略基类
 */
export abstract class BaseStrategy {
  /** 策略配置 */
  protected config: StrategyConfig

  /** 难度等级 */
  protected difficulty: AIDifficultyLevel

  /** 策略状态 */
  protected state: {
    /** 最后决策时间 */
    lastDecisionTime: number

    /** 决策计数 */
    decisionCount: number

    /** 成功决策计数 */
    successfulDecisions: number

    /** 平均决策时间 */
    averageDecisionTime: number

    /** 策略特定状态 */
    specificState: Record<string, any>
  }

  /**
   * 构造函数
   */
  constructor(difficulty: AIDifficultyLevel, config?: Partial<StrategyConfig>) {
    this.difficulty = difficulty
    this.config = this.createDefaultConfig(difficulty, config)
    this.state = {
      lastDecisionTime: 0,
      decisionCount: 0,
      successfulDecisions: 0,
      averageDecisionTime: 0,
      specificState: {}
    }
  }

  /**
   * 创建默认配置
   */
  protected createDefaultConfig(
    difficulty: AIDifficultyLevel,
    customConfig?: Partial<StrategyConfig>
  ): StrategyConfig {
    const baseConfig: StrategyConfig = {
      type: this.getStrategyType() as AIStrategyType,
      params: {},
      weights: {
        patternStrength: 0.4,
        handOptimization: 0.3,
        riskAversion: 0.2,
        teamwork: 0.05,
        memoryInfluence: 0.05
      },
      thresholds: {
        minConfidence: 0.6,
        maxRisk: 0.7,
        teamworkThreshold: 0.5
      }
    }

    // 根据难度调整配置
    switch (difficulty) {
      case AIDifficultyLevel.BEGINNER:
        baseConfig.weights = {
          patternStrength: 0.2,
          handOptimization: 0.3,
          riskAversion: 0.4,
          teamwork: 0.05,
          memoryInfluence: 0.05
        }
        baseConfig.thresholds.minConfidence = 0.4
        baseConfig.thresholds.maxRisk = 0.3
        break

      case AIDifficultyLevel.INTERMEDIATE:
        baseConfig.weights = {
          patternStrength: 0.4,
          handOptimization: 0.3,
          riskAversion: 0.2,
          teamwork: 0.05,
          memoryInfluence: 0.05
        }
        baseConfig.thresholds.minConfidence = 0.6
        baseConfig.thresholds.maxRisk = 0.5
        break

      case AIDifficultyLevel.ADVANCED:
        baseConfig.weights = {
          patternStrength: 0.3,
          handOptimization: 0.25,
          riskAversion: 0.15,
          teamwork: 0.15,
          memoryInfluence: 0.15
        }
        baseConfig.thresholds.minConfidence = 0.7
        baseConfig.thresholds.maxRisk = 0.6
        break

      case AIDifficultyLevel.EXPERT:
        baseConfig.weights = {
          patternStrength: 0.25,
          handOptimization: 0.2,
          riskAversion: 0.1,
          teamwork: 0.2,
          memoryInfluence: 0.25
        }
        baseConfig.thresholds.minConfidence = 0.8
        baseConfig.thresholds.maxRisk = 0.7
        break
    }

    // 合并自定义配置
    return {
      ...baseConfig,
      ...customConfig,
      weights: {
        ...baseConfig.weights,
        ...customConfig?.weights
      },
      thresholds: {
        ...baseConfig.thresholds,
        ...customConfig?.thresholds
      }
    }
  }

  /**
   * 获取策略类型（子类必须实现）
   */
  protected abstract getStrategyType(): string

  /**
   * 选择最佳出牌
   */
  abstract selectBestPlay(
    options: PlayOption[],
    gameSession: GameSession,
    memory: GameMemory
  ): PlayOption

  /**
   * 评估出牌选项
   */
  abstract evaluatePlay(
    pattern: CardPatternVO,
    gameSession: GameSession,
    memory: GameMemory
  ): number

  /**
   * 评估过牌选项
   */
  abstract evaluatePass(
    gameSession: GameSession,
    memory: GameMemory
  ): number

  /**
   * 更新记忆
   */
  abstract updateMemory(
    playRecord: PlayRecord,
    gameSession: GameSession,
    memory: GameMemory
  ): void

  /**
   * 更新游戏状态
   */
  abstract updateGameState(
    snapshot: GameStateSnapshot,
    memory: GameMemory
  ): void

  /**
   * 计算牌型强度评分
   */
  protected calculatePatternStrength(pattern: CardPatternVO): number {
    // 基础评分逻辑，子类可以重写
    const baseScores: Record<string, number> = {
      'single': 10,
      'pair': 20,
      'triple': 30,
      'triple_with_pair': 35,
      'straight': 40,
      'consecutive_pairs': 50,
      'plane': 60,
      'plane_with_pairs': 70,
      'bomb': 80,
      'rocket': 100
    }

    const baseScore = baseScores[pattern.type] || 20

    // 考虑牌型大小
    let sizeBonus = 0
    if (pattern.rank) {
      const rankValues: Record<string, number> = {
        '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7,
        '10': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12, '2': 15
      }
      sizeBonus = rankValues[pattern.rank] || 0
    }

    // 考虑牌型长度
    const lengthBonus = pattern.cards.length * 2

    return baseScore + sizeBonus + lengthBonus
  }

  /**
   * 计算手牌优化评分
   */
  protected calculateHandOptimization(
    pattern: CardPatternVO,
    handCards: Card[],
    memory: GameMemory
  ): number {
    // 基础逻辑：出牌后剩余手牌的优化程度
    const remainingCards = handCards.filter(
      card => !pattern.cards.some(pc => pc.id === card.id)
    )

    // 计算剩余手牌的牌型多样性
    const patternDiversity = this.calculatePatternDiversity(remainingCards)

    // 计算剩余手牌的平均点数
    const averageRank = this.calculateAverageRank(remainingCards)

    // 组合评分
    return patternDiversity * 0.6 + averageRank * 0.4
  }

  /**
   * 计算牌型多样性
   */
  protected calculatePatternDiversity(cards: Card[]): number {
    // 简化的多样性计算
    const rankCounts: Record<string, number> = {}
    for (const card of cards) {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1
    }

    const uniqueRanks = Object.keys(rankCounts).length
    const maxCount = Math.max(...Object.values(rankCounts), 0)

    // 多样性评分：唯一点数越多，最大重复越少，评分越高
    return (uniqueRanks / Math.max(cards.length, 1)) * (1 - maxCount / Math.max(cards.length, 1)) * 100
  }

  /**
   * 计算平均点数
   */
  protected calculateAverageRank(cards: Card[]): number {
    if (cards.length === 0) return 0

    const rankValues: Record<string, number> = {
      '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15,
      'black_joker': 16, 'red_joker': 17
    }

    const total = cards.reduce((sum, card) => sum + (rankValues[card.rank] || 0), 0)
    return total / cards.length
  }

  /**
   * 计算风险评分
   */
  protected calculateRiskScore(
    pattern: CardPatternVO,
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    // 基础风险逻辑
    let riskScore = 0

    // 1. 牌型越大，风险越低
    const patternStrength = this.calculatePatternStrength(pattern)
    riskScore -= patternStrength * 0.1

    // 2. 当前回合越早，风险越高
    const currentRound = gameSession.currentRound?.roundNumber || 0
    riskScore += currentRound * 0.05

    // 3. 手牌越少，风险越高
    const playerHandCounts = memory.snapshots[memory.snapshots.length - 1]?.playerHandCounts || {}
    const myHandCount = playerHandCounts[gameSession.currentRound?.currentPlayerId || ''] || 0
    riskScore += (27 - myHandCount) * 0.1 // 掼蛋每人27张牌

    // 归一化到0-100
    return Math.max(0, Math.min(100, 50 + riskScore))
  }

  /**
   * 计算团队协作评分
   */
  protected calculateTeamworkScore(
    pattern: CardPatternVO,
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    const teamworkState = memory.teamworkState
    if (!teamworkState) {
      return 50 // 默认中等评分
    }

    let teamworkScore = 50 // 基础分

    // 1. 协作等级影响
    teamworkScore += teamworkState.cooperationLevel * 10

    // 2. 最近协作时间影响
    const timeSinceLastCooperation = Date.now() - teamworkState.lastCooperationTime
    const hoursSince = timeSinceLastCooperation / (1000 * 60 * 60)
    if (hoursSince < 1) {
      teamworkScore += 20 // 1小时内有过协作
    } else if (hoursSince < 24) {
      teamworkScore += 10 // 24小时内有过协作
    }

    // 3. 策略匹配度
    const strategyMatch = teamworkState.cooperationStrategies.includes(this.getStrategyType()) ? 15 : 0
    teamworkScore += strategyMatch

    return Math.max(0, Math.min(100, teamworkScore))
  }

  /**
   * 计算记忆影响评分
   */
  protected calculateMemoryInfluence(
    pattern: CardPatternVO,
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    // 基础记忆影响逻辑
    let memoryScore = 50

    // 1. 考虑对手的出牌习惯
    const playerMemories = Array.from(memory.playerMemories.values())
    for (const playerMemory of playerMemories) {
      if (playerMemory.playerId === gameSession.currentRound?.currentPlayerId) {
        continue // 跳过自己
      }

      // 检查这个牌型是否是对手喜欢的
      const preference = playerMemory.patternPreferences[pattern.type] || 0
      if (preference > 0.7) {
        // 对手喜欢这个牌型，可能是个陷阱
        memoryScore -= 20
      } else if (preference < 0.3) {
        // 对手不喜欢这个牌型，可能是个机会
        memoryScore += 15
      }
    }

    // 2. 考虑历史出牌记录
    const recentPlays = memory.playRecords.slice(-10)
    const similarPlays = recentPlays.filter(record =>
      record.pattern?.type === pattern.type &&
      record.isValid === true
    )

    if (similarPlays.length > 0) {
      const successRate = similarPlays.filter(p => p.winsRound).length / similarPlays.length
      memoryScore += successRate * 30 - 15 // 成功率高加分，失败率高减分
    }

    return Math.max(0, Math.min(100, memoryScore))
  }

  /**
   * 综合评估出牌选项
   */
  protected evaluatePlayOption(
    pattern: CardPatternVO,
    gameSession: GameSession,
    memory: GameMemory,
    handCards?: Card[]
  ): number {
    const startTime = Date.now()

    try {
      // 计算各项评分
      const patternStrength = this.calculatePatternStrength(pattern)
      const handOptimization = handCards
        ? this.calculateHandOptimization(pattern, handCards, memory)
        : 50
      const riskScore = this.calculateRiskScore(pattern, gameSession, memory)
      const teamworkScore = this.calculateTeamworkScore(pattern, gameSession, memory)
      const memoryInfluence = this.calculateMemoryInfluence(pattern, gameSession, memory)

      // 应用权重计算综合评分
      const weights = this.config.weights
      const totalScore =
        patternStrength * weights.patternStrength +
        handOptimization * weights.handOptimization +
        (100 - riskScore) * weights.riskAversion + // 风险分数需要反转
        teamworkScore * weights.teamwork +
        memoryInfluence * weights.memoryInfluence

      // 记录决策统计
      const decisionTime = Date.now() - startTime
      this.updateDecisionStats(decisionTime, totalScore > this.config.thresholds.minConfidence * 100)

      return Math.max(0, Math.min(100, totalScore))

    } catch (error) {
      console.error('评估出牌选项失败:', error)
      return 30 // 失败时返回保守评分
    }
  }

  /**
   * 更新决策统计
   */
  protected updateDecisionStats(decisionTime: number, isSuccessful: boolean): void {
    this.state.decisionCount++
    if (isSuccessful) {
      this.state.successfulDecisions++
    }

    // 更新平均决策时间
    const totalTime = this.state.averageDecisionTime * (this.state.decisionCount - 1) + decisionTime
    this.state.averageDecisionTime = totalTime / this.state.decisionCount
    this.state.lastDecisionTime = Date.now()
  }

  /**
   * 获取策略配置
   */
  getConfig(): StrategyConfig {
    return { ...this.config }
  }

  /**
   * 更新策略配置
   */
  updateConfig(updates: Partial<StrategyConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      weights: {
        ...this.config.weights,
        ...updates.weights
      },
      thresholds: {
        ...this.config.thresholds,
        ...updates.thresholds
      }
    }
  }

  /**
   * 获取策略状态
   */
  getState() {
    return { ...this.state }
  }

  /**
   * 获取难度等级
   */
  getDifficulty(): AIDifficultyLevel {
    return this.difficulty
  }

  /**
   * 重置策略状态
   */
  resetState(): void {
    this.state = {
      lastDecisionTime: 0,
      decisionCount: 0,
      successfulDecisions: 0,
      averageDecisionTime: 0,
      specificState: {}
    }
  }

  /**
   * 获取决策成功率
   */
  getSuccessRate(): number {
    if (this.state.decisionCount === 0) return 0
    return this.state.successfulDecisions / this.state.decisionCount
  }

  /**
   * 获取平均决策时间
   */
  getAverageDecisionTime(): number {
    return this.state.averageDecisionTime
  }
}