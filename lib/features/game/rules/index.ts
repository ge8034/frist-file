/**
 * 游戏规则服务统一导出
 *
 * 导出所有游戏规则相关的服务、类型和工具
 */

// ==================== 服务导出 ====================

import { GameRuleServiceSingleton } from './GameRuleService'
import { ScoringServiceSingleton } from './ScoringService'
import { SpecialRuleServiceSingleton, SpecialRule } from './SpecialRuleService'
import { GameStateMachineSingleton } from './GameStateMachine'
import { RuleValidatorSingleton } from './RuleValidator'
import { GameState, PlayDirection, PlayChoice, RuleValidationError } from './types'

export { GameRuleService, GameRuleServiceSingleton } from './GameRuleService'
export { ScoringService, ScoringServiceSingleton } from './ScoringService'
export { SpecialRuleService, SpecialRuleServiceSingleton, SpecialRule } from './SpecialRuleService'
export { GameStateMachine, GameStateMachineSingleton } from './GameStateMachine'
export { RuleValidator, RuleValidatorSingleton } from './RuleValidator'

// ==================== 类型导出 ====================

export type {
  // 游戏规则服务接口
  IGameRuleService,
  IScoringService,
  ISpecialRuleService,
  IGameStateMachine,

  // 数据模型类型
  ValidationResult,
  ComparisonResult,
  RoundResult,
  PlayerScore,
  TeamScoreResult,
  PlayRecord,
  StateInfo,

  // 枚举类型
  RuleValidationErrorInfo
} from './types'

export { GameState, PlayDirection, PlayChoice, RuleValidationError } from './types'

// ==================== 工具函数导出 ====================

/**
 * 获取游戏规则服务实例
 */
export function getGameRuleService() {
  return GameRuleServiceSingleton.getInstance()
}

/**
 * 获取积分计算服务实例
 */
export function getScoringService() {
  return ScoringServiceSingleton.getInstance()
}

/**
 * 获取特殊规则服务实例
 */
export function getSpecialRuleService() {
  return SpecialRuleServiceSingleton.getInstance()
}

/**
 * 获取游戏状态机实例
 */
export function getGameStateMachine() {
  return GameStateMachineSingleton.getInstance()
}

/**
 * 获取规则验证器实例
 */
export function getRuleValidator() {
  return RuleValidatorSingleton.getInstance()
}

/**
 * 初始化游戏规则服务
 */
export function initializeGameRules(): {
  gameRuleService: ReturnType<typeof getGameRuleService>
  scoringService: ReturnType<typeof getScoringService>
  specialRuleService: ReturnType<typeof getSpecialRuleService>
  stateMachine: ReturnType<typeof getGameStateMachine>
  ruleValidator: ReturnType<typeof getRuleValidator>
} {
  console.log('初始化游戏规则服务...')

  const gameRuleService = getGameRuleService()
  const scoringService = getScoringService()
  const specialRuleService = getSpecialRuleService()
  const stateMachine = getGameStateMachine()
  const ruleValidator = getRuleValidator()

  console.log('游戏规则服务初始化完成')

  return {
    gameRuleService,
    scoringService,
    specialRuleService,
    stateMachine,
    ruleValidator
  }
}

/**
 * 获取游戏规则服务状态报告
 */
export function getGameRulesStatusReport() {
  const ruleValidator = getRuleValidator()
  return ruleValidator.getStatusReport()
}

// ==================== 默认导出 ====================

/**
 * 默认导出规则验证器
 */
export default getRuleValidator()

/**
 * 游戏规则服务工具包
 */
export const GameRules = {
  // 服务实例
  gameRuleService: getGameRuleService(),
  scoringService: getScoringService(),
  specialRuleService: getSpecialRuleService(),
  stateMachine: getGameStateMachine(),
  ruleValidator: getRuleValidator(),

  // 工具函数
  initialize: initializeGameRules,
  getStatusReport: getGameRulesStatusReport,

  // 常量
  constants: {
    GameState,
    PlayDirection,
    PlayChoice,
    RuleValidationError,
    SpecialRule
  }
}