/**
 * 特殊规则服务
 *
 * 实现掼蛋游戏的特殊规则处理，包括逢人配、春天/反春、升级等规则
 */

import type { Card } from '../../../domain/entities/Card'
import type { GameSession } from '../../../domain/entities/GameSession'
import { CardPatternVO, CardPatternType } from '../../../domain/value-objects/CardPatternVO'
import { CardRecognizer } from './CardRecognizer'
import {
  ISpecialRuleService,
  ValidationResult,
  RuleValidationError
} from './types'

/**
 * 特殊规则枚举
 */
export enum SpecialRule {
  /** 逢人配：万能牌规则 */
  WILD_CARD = 'wild_card',

  /** 春天：一方未出牌 */
  SPRING = 'spring',

  /** 反春：一方出完牌后对方未出牌 */
  COUNTER_SPRING = 'counter_spring',

  /** 升级：等级变化规则 */
  LEVEL_UP = 'level_up',

  /** 炸弹奖励 */
  BOMB_BONUS = 'bomb_bonus',

  /** 王炸最大 */
  ROCKET_MAX = 'rocket_max'
}

/**
 * 特殊规则服务实现
 */
export class SpecialRuleService implements ISpecialRuleService {
  private cardRecognizer: CardRecognizer

  constructor() {
    this.cardRecognizer = new CardRecognizer()
  }

  /**
   * 识别逢人配牌型
   */
  recognizeWithWildCard(cards: Card[], wildCardRank: string): CardPatternVO {
    try {
      // 1. 检查是否包含逢人配牌
      const wildCards = cards.filter(card => card.rank === wildCardRank)
      if (wildCards.length === 0) {
        // 没有逢人配牌，使用普通识别
        return this.cardRecognizer.recognizePattern(cards)
      }

      // 2. 尝试用逢人配牌替换其他牌来形成有效牌型
      const possiblePatterns = this.tryWildCardCombinations(cards, wildCardRank)

      // 3. 选择最合适的牌型
      if (possiblePatterns.length > 0) {
        // 优先选择炸弹，然后选择大的牌型
        const sortedPatterns = possiblePatterns.sort((a, b) => {
          // 炸弹优先
          if (a.type === CardPatternType.BOMB && b.type !== CardPatternType.BOMB) return -1
          if (b.type === CardPatternType.BOMB && a.type !== CardPatternType.BOMB) return 1

          // 然后按牌型值排序
          return b.value - a.value
        })

        return sortedPatterns[0]
      }

      // 4. 如果没有找到有效牌型，返回普通识别结果
      return this.cardRecognizer.recognizePattern(cards)
    } catch (error) {
      console.error('识别逢人配牌型错误:', error)
      return this.cardRecognizer.recognizePattern(cards)
    }
  }

  /**
   * 应用逢人配规则
   */
  applyWildCardRule(pattern: CardPatternVO, wildCardRank: string): CardPatternVO {
    try {
      // 如果牌型已经是有效的，直接返回
      if (pattern.isValid) {
        return pattern
      }

      // 尝试应用逢人配规则
      // 这里需要更复杂的逻辑来处理逢人配牌的各种组合
      // 暂时返回原始牌型
      return pattern
    } catch (error) {
      console.error('应用逢人配规则错误:', error)
      return pattern
    }
  }

  /**
   * 检查是否满足特殊规则条件
   */
  checkSpecialRuleCondition(gameSession: GameSession, ruleName: string): boolean {
    try {
      const rule = ruleName as SpecialRule

      switch (rule) {
        case SpecialRule.WILD_CARD:
          return this.checkWildCardCondition(gameSession)

        case SpecialRule.SPRING:
          return this.checkSpringCondition(gameSession)

        case SpecialRule.COUNTER_SPRING:
          return this.checkCounterSpringCondition(gameSession)

        case SpecialRule.LEVEL_UP:
          return this.checkLevelUpCondition(gameSession)

        case SpecialRule.BOMB_BONUS:
          return this.checkBombBonusCondition(gameSession)

        case SpecialRule.ROCKET_MAX:
          return this.checkRocketMaxCondition(gameSession)

        default:
          return false
      }
    } catch (error) {
      console.error('检查特殊规则条件错误:', error)
      return false
    }
  }

  /**
   * 获取可用的特殊规则
   */
  getAvailableSpecialRules(gameSession: GameSession): string[] {
    try {
      const availableRules: string[] = []

      // 检查每个规则是否可用
      const rules = Object.values(SpecialRule)
      for (const rule of rules) {
        if (this.checkSpecialRuleCondition(gameSession, rule)) {
          availableRules.push(rule)
        }
      }

      return availableRules
    } catch (error) {
      console.error('获取可用特殊规则错误:', error)
      return []
    }
  }

  // ==================== 特殊规则条件检查 ====================

  /**
   * 检查逢人配条件
   */
  private checkWildCardCondition(gameSession: GameSession): boolean {
    // 逢人配规则：当游戏中有升级时，对应点数的牌成为万能牌
    // 需要检查当前等级和游戏状态
    const isPlaying = gameSession.phase === 'playing' && gameSession.currentRound !== null
    if (!isPlaying) {
      return false
    }

    // 检查是否有逢人配牌
    const wildCardRank = this.getCurrentWildCardRank(gameSession)
    return wildCardRank !== null
  }

  /**
   * 检查春天条件
   */
  private checkSpringCondition(gameSession: GameSession): boolean {
    // 春天：一方未出牌就获胜
    // 需要检查出牌记录
    if (!gameSession.rounds || gameSession.rounds.length === 0) {
      return false
    }

    const lastRound = gameSession.rounds[gameSession.rounds.length - 1]
    // 简化逻辑：检查是否有队伍一张牌都没出
    // 实际需要更复杂的判断
    return false
  }

  /**
   * 检查反春条件
   */
  private checkCounterSpringCondition(gameSession: GameSession): boolean {
    // 反春：一方出完牌后，对方未出牌
    // 需要更复杂的游戏状态判断
    return false
  }

  /**
   * 检查升级条件
   */
  private checkLevelUpCondition(gameSession: GameSession): boolean {
    // 升级：当积分达到阈值时
    // 需要检查玩家积分
    return gameSession.phase === 'round_end' || gameSession.phase === 'game_end'
  }

  /**
   * 检查炸弹奖励条件
   */
  private checkBombBonusCondition(gameSession: GameSession): boolean {
    // 炸弹奖励：当有炸弹出牌时
    if (!gameSession.plays || gameSession.plays.length === 0) {
      return false
    }

    return gameSession.plays.some(play => {
      const pattern = this.cardRecognizer.recognizePattern(play.cards)
      return pattern.type === CardPatternType.BOMB || pattern.type === CardPatternType.ROCKET
    })
  }

  /**
   * 检查王炸最大条件
   */
  private checkRocketMaxCondition(gameSession: GameSession): boolean {
    // 王炸最大：始终为真
    return true
  }

  // ==================== 辅助方法 ====================

  /**
   * 尝试逢人配牌的各种组合
   */
  private tryWildCardCombinations(cards: Card[], wildCardRank: string): CardPatternVO[] {
    const validPatterns: CardPatternVO[] = []

    // 分离逢人配牌和其他牌
    const wildCards = cards.filter(card => card.rank === wildCardRank)
    const otherCards = cards.filter(card => card.rank !== wildCardRank)

    if (wildCards.length === 0) {
      return validPatterns
    }

    // 尝试各种替换组合
    // 这里需要实现更复杂的算法来尝试逢人配牌的各种用法
    // 暂时返回空数组

    return validPatterns
  }

  /**
   * 获取特殊规则描述
   */
  getSpecialRuleDescription(ruleName: string): string {
    const ruleDescriptions: Record<SpecialRule, string> = {
      [SpecialRule.WILD_CARD]: '逢人配：当前等级的点数牌可以作为万能牌使用，可以替代任何牌组成有效牌型',
      [SpecialRule.SPRING]: '春天：一方玩家未出任何牌就获胜，获得额外积分奖励',
      [SpecialRule.COUNTER_SPRING]: '反春：一方出完所有牌后，对方未出任何牌，获得更多积分奖励',
      [SpecialRule.LEVEL_UP]: '升级：根据游戏结果调整玩家等级，影响逢人配牌的点数',
      [SpecialRule.BOMB_BONUS]: '炸弹奖励：出炸弹牌型获得额外积分奖励，炸弹张数越多奖励倍数越高',
      [SpecialRule.ROCKET_MAX]: '王炸最大：王炸（大小王）是最大的牌型，可以打过任何其他牌型'
    }

    return ruleDescriptions[ruleName as SpecialRule] || '未知规则'
  }

  /**
   * 验证特殊规则应用
   */
  validateSpecialRuleApplication(
    ruleName: string,
    cards: Card[],
    gameSession: GameSession
  ): ValidationResult {
    try {
      const rule = ruleName as SpecialRule

      switch (rule) {
        case SpecialRule.WILD_CARD:
          return this.validateWildCardApplication(cards, gameSession)

        case SpecialRule.BOMB_BONUS:
          return this.validateBombBonusApplication(cards, gameSession)

        case SpecialRule.ROCKET_MAX:
          return this.validateRocketMaxApplication(cards, gameSession)

        default:
          return {
            valid: true,
            message: '规则验证通过'
          }
      }
    } catch (error) {
      console.error('验证特殊规则应用错误:', error)
      return {
        valid: false,
        message: '规则验证过程中发生错误',
        errorCode: RuleValidationError.UNKNOWN_ERROR
      }
    }
  }

  /**
   * 验证逢人配规则应用
   */
  private validateWildCardApplication(cards: Card[], gameSession: GameSession): ValidationResult {
    // 检查是否包含逢人配牌
    const wildCardRank = this.getCurrentWildCardRank(gameSession)
    if (!wildCardRank) {
      return {
        valid: false,
        message: '当前没有逢人配牌',
        errorCode: RuleValidationError.SPECIAL_RULE_VIOLATION
      }
    }

    const hasWildCard = cards.some(card => card.rank === wildCardRank)
    if (!hasWildCard) {
      return {
        valid: true,
        message: '未使用逢人配牌，规则验证通过'
      }
    }

    // 检查逢人配牌的使用是否合理
    // 这里需要更复杂的验证逻辑
    return {
      valid: true,
      message: '逢人配规则验证通过'
    }
  }

  /**
   * 验证炸弹奖励规则应用
   */
  private validateBombBonusApplication(cards: Card[], gameSession: GameSession): ValidationResult {
    const pattern = this.cardRecognizer.recognizePattern(cards)
    if (pattern.type !== CardPatternType.BOMB && pattern.type !== CardPatternType.ROCKET) {
      return {
        valid: false,
        message: '不是炸弹牌型，不能应用炸弹奖励规则',
        errorCode: RuleValidationError.SPECIAL_RULE_VIOLATION
      }
    }

    return {
      valid: true,
      message: '炸弹奖励规则验证通过'
    }
  }

  /**
   * 验证王炸最大规则应用
   */
  private validateRocketMaxApplication(cards: Card[], gameSession: GameSession): ValidationResult {
    // 王炸最大规则不限制出牌类型，只影响牌型比较
    // 任何牌型都可以出，规则只在比较时生效
    return {
      valid: true,
      message: '王炸最大规则验证通过'
    }
  }

  /**
   * 获取当前逢人配点数
   */
  private getCurrentWildCardRank(gameSession: GameSession): string | null {
    // 根据游戏等级确定逢人配点数
    // 掼蛋规则：当前等级的点数牌是逢人配
    // 需要从游戏状态中获取当前等级
    // 暂时返回null
    return null
  }

  /**
   * 获取所有特殊规则的详细说明
   */
  getAllSpecialRulesDescriptions(): Record<string, string> {
    const rules: Record<string, string> = {}
    const ruleValues = Object.values(SpecialRule)

    for (const rule of ruleValues) {
      rules[rule] = this.getSpecialRuleDescription(rule)
    }

    return rules
  }
}

/**
 * 特殊规则服务单例
 */
export class SpecialRuleServiceSingleton {
  private static instance: SpecialRuleService

  static getInstance(): SpecialRuleService {
    if (!SpecialRuleServiceSingleton.instance) {
      SpecialRuleServiceSingleton.instance = new SpecialRuleService()
    }
    return SpecialRuleServiceSingleton.instance
  }
}