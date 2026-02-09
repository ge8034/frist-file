/**
 * AI系统类型定义
 *
 * 定义AI玩家系统所需的接口和类型
 */

import type { Card } from '../../../domain/entities/Card'
import type { Player } from '../../../domain/entities/Player'
import type { GameSession } from '../../../domain/entities/GameSession'
import type { CardPatternVO } from '../../../domain/value-objects/CardPatternVO'
import type { ValidationResult, PlayChoice } from '../rules/types'

// ==================== AI策略类型 ====================

/**
 * AI策略类型
 */
export type AIStrategyType = 'random' | 'greedy' | 'memory'

/**
 * AI难度等级
 */
export enum AIDifficultyLevel {
  /** 新手：随机策略，简单决策 */
  BEGINNER = 'beginner',

  /** 中等：贪婪策略，单步最优 */
  INTERMEDIATE = 'intermediate',

  /** 高级：记忆策略，团队协作 */
  ADVANCED = 'advanced',

  /** 专家：混合策略，预测对手 */
  EXPERT = 'expert'
}

/**
 * AI玩家配置
 */
export interface AIPlayerConfig {
  /** 玩家ID */
  playerId: string

  /** 玩家名称 */
  name: string

  /** AI策略类型 */
  strategy: AIStrategyType

  /** AI难度等级 */
  difficulty: AIDifficultyLevel

  /** 技能等级 (1-100) */
  skillLevel?: number

  /** 是否启用团队协作 */
  enableTeamwork?: boolean

  /** 是否启用记忆系统 */
  enableMemory?: boolean

  /** 是否启用预测系统 */
  enablePrediction?: boolean
}

// ==================== 决策相关类型 ====================

/**
 * 出牌决策
 */
export interface PlayDecision {
  /** 出牌选择 */
  choice: PlayChoice

  /** 要出的牌（如果选择出牌） */
  cards?: Card[]

  /** 决策置信度 (0-1) */
  confidence: number

  /** 决策理由 */
  reason?: string

  /** 备选方案 */
  alternatives?: PlayOption[]

  /** 决策时间戳 */
  timestamp: number
}

/**
 * 出牌选项
 */
export interface PlayOption {
  /** 出牌选择 */
  choice: PlayChoice

  /** 要出的牌（如果选择出牌） */
  cards?: Card[]

  /** 牌型值对象（如果识别出牌型） */
  pattern?: CardPatternVO

  /** 选项评分 */
  score: number

  /** 评分详情 */
  scoreDetails?: {
    /** 牌型强度评分 */
    patternStrength: number

    /** 手牌优化评分 */
    handOptimization: number

    /** 策略评分 */
    strategyScore: number

    /** 风险评分 */
    riskScore: number

    /** 团队协作评分 */
    teamworkScore: number
  }

  /** 选项理由 */
  reason?: string

  /** 验证结果 */
  validation?: ValidationResult
}

/**
 * 游戏状态快照
 */
export interface GameStateSnapshot {
  /** 游戏会话ID */
  sessionId: string

  /** 当前回合 */
  currentRound: number

  /** 当前出牌玩家ID */
  currentPlayerId: string

  /** 当前牌型（如果有） */
  currentPattern?: CardPatternVO

  /** 玩家手牌数量映射 */
  playerHandCounts: Record<string, number>

  /** 已出牌历史 */
  playedCardsHistory: PlayRecord[]

  /** 游戏阶段 */
  gamePhase: string

  /** 团队得分 */
  teamScores: Record<string, number>

  /** 快照时间戳 */
  timestamp: number
}

/**
 * 出牌记录
 */
export interface PlayRecord {
  /** 玩家ID */
  playerId: string

  /** 出的牌 */
  cards: Card[]

  /** 牌型 */
  pattern?: CardPatternVO

  /** 出牌选择 */
  choice: PlayChoice

  /** 回合数 */
  round: number

  /** 时间戳 */
  timestamp: number

  /** 是否有效出牌 */
  isValid: boolean

  /** 是否赢得回合 */
  winsRound?: boolean
}

// ==================== 策略相关类型 ====================

/**
 * 策略配置
 */
export interface StrategyConfig {
  /** 策略类型 */
  type: AIStrategyType

  /** 策略参数 */
  params: Record<string, any>

  /** 权重配置 */
  weights: {
    /** 牌型强度权重 */
    patternStrength: number

    /** 手牌优化权重 */
    handOptimization: number

    /** 风险规避权重 */
    riskAversion: number

    /** 团队协作权重 */
    teamwork: number

    /** 记忆影响权重 */
    memoryInfluence: number
  }

  /** 决策阈值 */
  thresholds: {
    /** 最小置信度阈值 */
    minConfidence: number

    /** 最大风险阈值 */
    maxRisk: number

    /** 团队协作阈值 */
    teamworkThreshold: number
  }
}

/**
 * 记忆条目
 */
export interface MemoryEntry {
  /** 玩家ID */
  playerId: string

  /** 牌型偏好 */
  patternPreferences: Record<string, number>

  /** 出牌习惯 */
  playHabits: {
    /** 喜欢出大牌的概率 */
    playBigCardsProbability: number

    /** 喜欢保留炸弹的概率 */
    keepBombsProbability: number

    /** 喜欢冒险的概率 */
    takeRisksProbability: number

    /** 团队协作倾向 */
    teamworkTendency: number
  }

  /** 手牌预测 */
  handPredictions: {
    /** 可能的手牌组合 */
    possibleHands: Card[][]

    /** 手牌强度估计 */
    handStrengthEstimate: number

    /** 剩余牌数估计 */
    remainingCardsEstimate: number
  }

  /** 最后更新时间 */
  lastUpdated: number

  /** 置信度 */
  confidence: number
}

/**
 * 团队协作状态
 */
export interface TeamworkState {
  /** 队友ID */
  partnerId: string

  /** 协作等级 */
  cooperationLevel: number

  /** 信号历史 */
  signalHistory: {
    /** 信号类型 */
    type: string

    /** 信号内容 */
    content: any

    /** 发送时间 */
    timestamp: number

    /** 是否被理解 */
    understood: boolean
  }[]

  /** 协作策略 */
  cooperationStrategies: string[]

  /** 最后协作时间 */
  lastCooperationTime: number
}

// ==================== AI工厂类型 ====================

/**
 * AI工厂配置
 */
export interface AIPlayerFactoryConfig {
  /** 默认策略类型 */
  defaultStrategy: AIStrategyType

  /** 默认难度等级 */
  defaultDifficulty: AIDifficultyLevel

  /** 默认技能等级 */
  defaultSkillLevel: number

  /** AI命名模式 */
  namingPattern: string

  /** 是否启用自动补足 */
  enableAutoFill: boolean

  /** 最大AI玩家数 */
  maxAIPlayers: number

  /** 策略映射 */
  strategyMapping: Record<AIDifficultyLevel, AIStrategyType>
}

/**
 * AI创建选项
 */
export interface AICreationOptions {
  /** 玩家数量 */
  playerCount: number

  /** 起始索引 */
  startIndex: number

  /** 现有玩家ID列表 */
  existingPlayerIds: string[]

  /** 难度分布 */
  difficultyDistribution?: Record<AIDifficultyLevel, number>

  /** 策略覆盖 */
  strategyOverrides?: Record<string, AIStrategyType>

  /** 自定义配置 */
  customConfigs?: Partial<AIPlayerConfig>[]
}