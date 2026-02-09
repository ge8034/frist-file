/**
 * AI 工厂
 *
 * 负责创建不同类型的 AI 玩家
 * 支持多种 AI 策略：随机、贪婪、记忆
 * 完善实现，支持不同难度和策略的AI创建
 */

import type { GameRuleService } from '../rules/GameRuleService'
import { AIPlayer } from './AIPlayer'
import type {
  AIStrategyType,
  AIPlayerConfig,
  AIPlayerFactoryConfig,
  AICreationOptions
} from './types'
import { AIDifficultyLevel } from './types'

/**
 * AI 工厂类
 */
export class AIPlayerFactory {
  /** 工厂配置 */
  private config: AIPlayerFactoryConfig

  /** 游戏规则服务 */
  private gameRuleService: GameRuleService

  /** AI 名称生成器 */
  private nameGenerator: NameGenerator

  /**
   * 构造函数
   */
  constructor(gameRuleService: GameRuleService, config?: Partial<AIPlayerFactoryConfig>) {
    this.gameRuleService = gameRuleService
    this.config = this.createDefaultConfig(config)
    this.nameGenerator = new NameGenerator()
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfig(customConfig?: Partial<AIPlayerFactoryConfig>): AIPlayerFactoryConfig {
    const baseConfig: AIPlayerFactoryConfig = {
      defaultStrategy: 'random',
      defaultDifficulty: AIDifficultyLevel.INTERMEDIATE,
      defaultSkillLevel: 50,
      namingPattern: 'AI {index} ({strategy})',
      enableAutoFill: true,
      maxAIPlayers: 3,
      strategyMapping: {
        [AIDifficultyLevel.BEGINNER]: 'random',
        [AIDifficultyLevel.INTERMEDIATE]: 'greedy',
        [AIDifficultyLevel.ADVANCED]: 'memory',
        [AIDifficultyLevel.EXPERT]: 'memory'
      }
    }

    return {
      ...baseConfig,
      ...customConfig,
      strategyMapping: {
        ...baseConfig.strategyMapping,
        ...customConfig?.strategyMapping
      }
    }
  }

  /**
   * 创建单个 AI 玩家
   */
  createAIPlayer(
    playerId: string,
    name?: string,
    strategy?: AIStrategyType,
    difficulty?: AIDifficultyLevel,
    skillLevel?: number
  ): AIPlayer {
    const finalStrategy = strategy || this.config.defaultStrategy
    const finalDifficulty = difficulty || this.config.defaultDifficulty
    const finalSkillLevel = skillLevel || this.config.defaultSkillLevel
    const finalName = name || this.generateAIName(finalStrategy, finalDifficulty)

    const config: AIPlayerConfig = {
      playerId,
      name: finalName,
      strategy: finalStrategy,
      difficulty: finalDifficulty,
      skillLevel: finalSkillLevel,
      enableTeamwork: finalDifficulty >= AIDifficultyLevel.ADVANCED,
      enableMemory: finalStrategy === 'memory',
      enablePrediction: finalDifficulty === AIDifficultyLevel.EXPERT
    }

    return AIPlayer.create(config, this.gameRuleService)
  }

  /**
   * 批量创建 AI 玩家
   */
  createAIPlayers(
    count: number,
    options?: Partial<AICreationOptions>
  ): AIPlayer[] {
    const defaultOptions: AICreationOptions = {
      playerCount: count,
      startIndex: 0,
      existingPlayerIds: [],
      difficultyDistribution: {
        [AIDifficultyLevel.BEGINNER]: 0.25,
        [AIDifficultyLevel.INTERMEDIATE]: 0.5,
        [AIDifficultyLevel.ADVANCED]: 0.2,
        [AIDifficultyLevel.EXPERT]: 0.05
      }
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      difficultyDistribution: {
        ...defaultOptions.difficultyDistribution,
        ...options?.difficultyDistribution
      }
    }

    const ais: AIPlayer[] = []
    const usedPlayerIds = new Set(finalOptions.existingPlayerIds)

    for (let i = 0; i < count; i++) {
      const playerId = this.generateUniquePlayerId(
        finalOptions.startIndex + i,
        usedPlayerIds
      )

      // 确定难度等级
      const difficulty = this.selectDifficulty(finalOptions.difficultyDistribution)

      // 确定策略类型
      const strategy = this.selectStrategy(difficulty, finalOptions.strategyOverrides)

      // 生成名称
      const name = this.generateAIName(strategy, difficulty, finalOptions.startIndex + i)

      // 创建 AI 玩家
      const ai = this.createAIPlayer(
        playerId,
        name,
        strategy,
        difficulty,
        this.config.defaultSkillLevel
      )

      ais.push(ai)
      usedPlayerIds.add(playerId)
    }

    return ais
  }

  /**
   * 为房间创建 AI 玩家（兼容现有接口）
   */
  createForRoom(
    playerCount: number,
    startIndex: number,
    existingPlayers: string[]
  ): AIPlayer[] {
    return this.createAIPlayers(playerCount, {
      startIndex,
      existingPlayerIds: existingPlayers
    })
  }

  /**
   * 生成唯一的玩家 ID
   */
  private generateUniquePlayerId(
    baseIndex: number,
    usedPlayerIds: Set<string>
  ): string {
    let playerId = `ai-${baseIndex}`
    let suffix = 0

    while (usedPlayerIds.has(playerId)) {
      suffix++
      playerId = `ai-${baseIndex}-${suffix}`
    }

    return playerId
  }

  /**
   * 选择难度等级
   */
  private selectDifficulty(
    distribution?: Partial<Record<AIDifficultyLevel, number>>
  ): AIDifficultyLevel {
    const random = Math.random()
    let cumulative = 0

    const difficulties: AIDifficultyLevel[] = [
      AIDifficultyLevel.BEGINNER,
      AIDifficultyLevel.INTERMEDIATE,
      AIDifficultyLevel.ADVANCED,
      AIDifficultyLevel.EXPERT
    ]

    // 默认分布（如果未提供）
    const defaultDistribution: Record<AIDifficultyLevel, number> = {
      [AIDifficultyLevel.BEGINNER]: 0.25,
      [AIDifficultyLevel.INTERMEDIATE]: 0.35,
      [AIDifficultyLevel.ADVANCED]: 0.25,
      [AIDifficultyLevel.EXPERT]: 0.15
    }

    const finalDistribution = distribution || defaultDistribution

    for (const difficulty of difficulties) {
      cumulative += finalDistribution[difficulty] || 0
      if (random <= cumulative) {
        return difficulty
      }
    }

    // 默认返回中等难度
    return AIDifficultyLevel.INTERMEDIATE
  }

  /**
   * 选择策略类型
   */
  private selectStrategy(
    difficulty: AIDifficultyLevel,
    strategyOverrides?: Record<string, AIStrategyType>
  ): AIStrategyType {
    // 首先检查是否有覆盖
    if (strategyOverrides && strategyOverrides[difficulty]) {
      return strategyOverrides[difficulty]
    }

    // 使用配置的映射
    return this.config.strategyMapping[difficulty] || this.config.defaultStrategy
  }

  /**
   * 生成 AI 名称
   */
  private generateAIName(
    strategy: AIStrategyType,
    difficulty: AIDifficultyLevel,
    index?: number
  ): string {
    const baseName = this.nameGenerator.generate(strategy, difficulty)

    if (index !== undefined) {
      return `${baseName} ${index + 1}`
    }

    return baseName
  }

  /**
   * 获取工厂配置
   */
  getConfig(): AIPlayerFactoryConfig {
    return { ...this.config }
  }

  /**
   * 更新工厂配置
   */
  updateConfig(updates: Partial<AIPlayerFactoryConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      strategyMapping: {
        ...this.config.strategyMapping,
        ...updates.strategyMapping
      }
    }
  }

  /**
   * 检查是否启用自动补足
   */
  isAutoFillEnabled(): boolean {
    return this.config.enableAutoFill
  }

  /**
   * 获取最大 AI 玩家数
   */
  getMaxAIPlayers(): number {
    return this.config.maxAIPlayers
  }

  /**
   * 计算需要的 AI 玩家数量
   */
  calculateNeededAIPlayers(humanPlayerCount: number): number {
    if (!this.config.enableAutoFill) {
      return 0
    }

    const totalPlayersNeeded = 4 // 掼蛋需要4个玩家
    const aiPlayersNeeded = Math.max(0, totalPlayersNeeded - humanPlayerCount)

    return Math.min(aiPlayersNeeded, this.config.maxAIPlayers)
  }
}

/**
 * AI 名称生成器
 */
class NameGenerator {
  /** 策略名称映射 */
  private strategyNames: Record<AIStrategyType, string[]> = {
    random: ['随机', '新手', '练习'],
    greedy: ['贪婪', '进取', '积极'],
    memory: ['记忆', '策略', '智能']
  }

  /** 难度名称映射 */
  private difficultyNames: Record<AIDifficultyLevel, string[]> = {
    [AIDifficultyLevel.BEGINNER]: ['初级', '新手', '入门'],
    [AIDifficultyLevel.INTERMEDIATE]: ['中级', '熟练', '标准'],
    [AIDifficultyLevel.ADVANCED]: ['高级', '专家', '大师'],
    [AIDifficultyLevel.EXPERT]: ['顶级', '传奇', '王者']
  }

  /** 通用名称列表 */
  private genericNames: string[] = [
    '玩家', '对手', '牌手', '伙伴',
    '战士', '智者', '勇者', '谋士'
  ]

  /**
   * 生成名称
   */
  generate(strategy: AIStrategyType, difficulty: AIDifficultyLevel): string {
    const strategyNames = this.strategyNames[strategy] || ['AI']
    const difficultyNames = this.difficultyNames[difficulty] || ['']
    const genericNames = this.genericNames

    // 随机选择组合
    const strategyName = this.randomChoice(strategyNames)
    const difficultyName = this.randomChoice(difficultyNames)
    const genericName = this.randomChoice(genericNames)

    // 组合名称
    if (difficultyName) {
      return `${difficultyName}${strategyName}${genericName}`
    } else {
      return `${strategyName}${genericName}`
    }
  }

  /**
   * 随机选择
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }
}

// 兼容性导出
export type { AIStrategyType } from './types'
export { AIDifficultyLevel } from './types'

// 创建 AI 自动补足逻辑的标记（兼容现有代码）
export const AI_AUTO_FILL_ENABLED = true
export const MAX_AI_PLAYERS = 3 // 最多自动补足 3 个 AI

// 简化的创建函数（兼容现有代码）
export function createAIPlayer(config: any): any {
  // 这个函数是为了兼容现有代码，实际应该使用AIPlayerFactory
  console.warn('使用简化的createAIPlayer函数，建议使用AIPlayerFactory')
  return {
    playerId: config.playerId,
    name: config.name,
    strategy: config.strategy,
    skillLevel: config.skillLevel || 50
  }
}
