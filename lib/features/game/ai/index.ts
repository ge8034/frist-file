/**
 * AI系统统一导出
 *
 * 提供便捷的AI创建工具和统一接口
 */

// ==================== 核心类导出 ====================

export { AIPlayer } from './AIPlayer'
export { AIPlayerFactory } from './AIPlayerFactory'

// ==================== 策略类导出 ====================

export { BaseStrategy } from './strategies/BaseStrategy'
export { RandomStrategy } from './strategies/RandomStrategy'
export { GreedyStrategy } from './strategies/GreedyStrategy'
export { MemoryStrategy } from './strategies/MemoryStrategy'

// ==================== 类型导出 ====================

export type {
  // AI策略类型
  AIStrategyType,

  // AI配置类型
  AIPlayerConfig,
  StrategyConfig,

  // 决策相关类型
  PlayDecision,
  PlayOption,
  GameStateSnapshot,
  PlayRecord,

  // 记忆相关类型
  MemoryEntry,
  TeamworkState,

  // 工厂相关类型
  AIPlayerFactoryConfig,
  AICreationOptions
} from './types'

export { AIDifficultyLevel } from './types'

// ==================== 工具函数 ====================

import { AIPlayerFactory } from './AIPlayerFactory'
import { AIPlayer } from './AIPlayer'
import { AIDifficultyLevel } from './types'

/**
 * 创建默认的AI玩家工厂
 */
export function createDefaultAIPlayerFactory(gameRuleService: any): AIPlayerFactory {
  return new AIPlayerFactory(gameRuleService)
}


/**
 * 创建预设的AI玩家
 */
export function createPresetAIPlayer(
  gameRuleService: any,
  preset: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate'
): AIPlayer {
  const factory = createDefaultAIPlayerFactory(gameRuleService)

  const presets = {
    beginner: {
      strategy: 'random' as const,
      difficulty: AIDifficultyLevel.BEGINNER,
      skillLevel: 30
    },
    intermediate: {
      strategy: 'greedy' as const,
      difficulty: AIDifficultyLevel.INTERMEDIATE,
      skillLevel: 50
    },
    advanced: {
      strategy: 'memory' as const,
      difficulty: AIDifficultyLevel.ADVANCED,
      skillLevel: 70
    },
    expert: {
      strategy: 'memory' as const,
      difficulty: AIDifficultyLevel.EXPERT,
      skillLevel: 90
    }
  }

  const presetConfig = presets[preset]
  return factory.createAIPlayer(
    `ai-preset-${preset}-${Date.now()}`,
    `${preset} AI`,
    presetConfig.strategy,
    presetConfig.difficulty,
    presetConfig.skillLevel
  )
}

/**
 * 批量创建AI玩家
 */
export function createAIPlayersForGame(
  gameRuleService: any,
  humanPlayerCount: number,
  options?: {
    difficultyDistribution?: Record<AIDifficultyLevel, number>
    namingPattern?: string
  }
): AIPlayer[] {
  const factory = createDefaultAIPlayerFactory(gameRuleService)

  if (options?.difficultyDistribution) {
    factory.updateConfig({
      strategyMapping: {
        [AIDifficultyLevel.BEGINNER]: 'random',
        [AIDifficultyLevel.INTERMEDIATE]: 'greedy',
        [AIDifficultyLevel.ADVANCED]: 'memory',
        [AIDifficultyLevel.EXPERT]: 'memory'
      }
    })
  }

  const aiCount = factory.calculateNeededAIPlayers(humanPlayerCount)
  return factory.createAIPlayers(aiCount, {
    difficultyDistribution: options?.difficultyDistribution
  })
}

/**
 * 创建测试用的AI玩家
 */
export function createTestAIPlayer(
  gameRuleService: any,
  id: string = 'test-ai'
): AIPlayer {
  const factory = createDefaultAIPlayerFactory(gameRuleService)
  return factory.createAIPlayer(
    id,
    '测试AI',
    'random',
    AIDifficultyLevel.BEGINNER,
    50
  )
}

/**
 * 评估AI决策质量
 */
export function evaluateAIDecisionQuality(
  aiPlayer: AIPlayer,
  gameSession: any
): {
  decisionTime: number
  confidence: number
  optionCount: number
  strategyType: string
  difficulty: AIDifficultyLevel
} {
  const startTime = Date.now()
  const decision = aiPlayer.makeDecision(gameSession)
  const decisionTime = Date.now() - startTime

  return {
    decisionTime,
    confidence: decision.confidence,
    optionCount: (decision.alternatives?.length || 0) + 1,
    strategyType: aiPlayer.getConfig().strategy,
    difficulty: aiPlayer.getConfig().difficulty
  }
}

/**
 * 获取AI系统信息
 */
export function getAISystemInfo(): {
  version: string
  strategies: string[]
  difficulties: string[]
  features: string[]
} {
  return {
    version: '1.0.0',
    strategies: ['random', 'greedy', 'memory'],
    difficulties: ['beginner', 'intermediate', 'advanced', 'expert'],
    features: [
      '策略模式',
      '难度分级',
      '记忆系统',
      '团队协作',
      '预测模型',
      '游戏规则集成'
    ]
  }
}

// ==================== 兼容性导出 ====================

// 为了兼容现有代码，导出一些简化的函数
export {
  AI_AUTO_FILL_ENABLED,
  MAX_AI_PLAYERS,
  createAIPlayer
} from './AIPlayerFactory'

// ==================== 默认导出 ====================

// 导入策略类用于默认导出
import { BaseStrategy } from './strategies/BaseStrategy'
import { RandomStrategy } from './strategies/RandomStrategy'
import { GreedyStrategy } from './strategies/GreedyStrategy'
import { MemoryStrategy } from './strategies/MemoryStrategy'

// 临时注释掉默认导出以避免构建错误
// export default {
//   // 核心类
//   AIPlayer,
//   AIPlayerFactory,
//
//   // 策略类
//   BaseStrategy,
//   RandomStrategy,
//   GreedyStrategy,
//   MemoryStrategy,
//
//   // 工具函数
//   createDefaultAIPlayerFactory,
//   createPresetAIPlayer,
//   createAIPlayersForGame,
//   createTestAIPlayer,
//   evaluateAIDecisionQuality,
//   getAISystemInfo,
//
//   // 兼容性导出
//   AI_AUTO_FILL_ENABLED,
//   MAX_AI_PLAYERS,
//   createAIPlayer
// }