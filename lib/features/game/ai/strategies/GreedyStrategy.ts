/**
 * 贪婪策略
 *
 * 选择当前最优的出牌，基于简单评分规则
 * 特点：
 * 1. 追求单步最优，不考虑长远策略
 * 2. 基于简单评分规则选择最优出牌
 * 3. 适合中等难度AI
 * 4. 快速决策，注重当前利益最大化
 */

import type { GameSession } from '../../../../domain/entities/GameSession'
import type { CardPatternVO } from '../../../../domain/value-objects/CardPatternVO'
import type { PlayOption, AIDifficultyLevel } from '../types'
import { BaseStrategy, type GameMemory } from './BaseStrategy'

/**
 * 贪婪策略
 */
export class GreedyStrategy extends BaseStrategy {
  /** 历史最佳选择记录 */
  private bestChoicesHistory: Array<{
    timestamp: number
    patternType: string
    score: number
    wasSuccessful: boolean
  }> = []

  /** 评分缓存 */
  private scoreCache: Map<string, number> = new Map()

  /** 缓存过期时间（毫秒） */
  private cacheExpiryTime: number = 5000

  /**
   * 构造函数
   */
  constructor(difficulty: AIDifficultyLevel, config?: Partial<any>) {
    super(difficulty, config)
    this.state.specificState = {
      greedyTendency: 0.8, // 贪婪倾向，0-1之间
      riskTolerance: 0.3,  // 风险容忍度
      optimizationFocus: 'immediate' // 优化焦点：immediate（立即）或 short_term（短期）
    }
  }

  /**
   * 获取策略类型
   */
  protected getStrategyType(): string {
    return 'greedy'
  }

  /**
   * 选择最佳出牌
   */
  selectBestPlay(
    options: PlayOption[],
    gameSession: GameSession,
    memory: GameMemory
  ): PlayOption {
    const startTime = Date.now()

    try {
      // 1. 过滤掉评分过低的选项
      const minScore = this.config.thresholds.minConfidence * 100
      const validOptions = options.filter(option => option.score >= minScore)

      if (validOptions.length === 0) {
        // 没有有效选项，返回评分最高的选项
        return this.getHighestScoringOption(options) || this.createDefaultOption()
      }

      // 2. 贪婪选择：选择评分最高的选项
      let bestOption = validOptions[0]
      let highestScore = bestOption.score

      for (let i = 1; i < validOptions.length; i++) {
        const option = validOptions[i]
        if (option.score > highestScore) {
          bestOption = option
          highestScore = option.score
        }
      }

      // 3. 应用贪婪优化：考虑当前利益最大化
      const optimizedOption = this.optimizeForImmediateGain(bestOption, validOptions, gameSession, memory)

      // 4. 记录最佳选择
      this.recordBestChoice(optimizedOption, gameSession)

      // 5. 添加贪婪策略特有的理由
      const greedyReason = this.generateGreedyReason(optimizedOption, highestScore, validOptions.length)
      const finalOption: PlayOption = {
        ...optimizedOption,
        reason: `${greedyReason} ${optimizedOption.reason || ''}`.trim()
      }

      return finalOption

    } catch (error) {
      console.error('贪婪策略选择失败:', error)
      return this.createDefaultOption()
    }
  }

  /**
   * 评估出牌选项
   */
  evaluatePlay(
    pattern: CardPatternVO,
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    // 检查缓存
    const cacheKey = this.getCacheKey(pattern, gameSession)
    const cachedScore = this.scoreCache.get(cacheKey)
    if (cachedScore !== undefined) {
      return cachedScore
    }

    // 使用基类的综合评估方法
    const score = this.evaluatePlayOption(pattern, gameSession, memory)

    // 添加贪婪策略特有的考虑
    const greedyAdjustment = this.calculateGreedyAdjustment(pattern, gameSession, memory)
    const riskAdjustment = this.calculateRiskAdjustment(pattern, gameSession, memory)

    const totalScore = score + greedyAdjustment + riskAdjustment

    // 确保分数在0-100之间
    const finalScore = Math.max(0, Math.min(100, totalScore))

    // 缓存结果
    this.scoreCache.set(cacheKey, finalScore)
    this.cleanupCache()

    return finalScore
  }

  /**
   * 评估过牌选项
   */
  evaluatePass(
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    // 贪婪策略中过牌通常评分较低，除非有很好的理由
    let baseScore = 30 // 基础过牌评分较低

    // 根据游戏状态调整
    const stateAdjustment = this.calculatePassStateAdjustment(gameSession, memory)

    // 贪婪策略特有的考虑：如果过牌能带来更大的后续利益
    const futureGainPotential = this.estimateFutureGainPotential(gameSession, memory)

    const totalScore = baseScore + stateAdjustment + futureGainPotential

    return Math.max(0, Math.min(100, totalScore))
  }

  /**
   * 更新记忆
   */
  updateMemory(
    playRecord: any,
    gameSession: GameSession,
    memory: GameMemory
  ): void {
    // 贪婪策略主要更新成功/失败记录
    const wasSuccessful = playRecord.winsRound === true

    // 记录这次出牌的结果
    this.bestChoicesHistory.push({
      timestamp: Date.now(),
      patternType: playRecord.pattern?.type || 'unknown',
      score: playRecord.pattern ? this.calculatePatternStrength(playRecord.pattern) : 0,
      wasSuccessful
    })

    // 限制历史记录大小
    if (this.bestChoicesHistory.length > 50) {
      this.bestChoicesHistory = this.bestChoicesHistory.slice(-50)
    }

    // 根据结果调整贪婪倾向
    this.adjustGreedyTendency(wasSuccessful)

    // 清理过期缓存
    this.cleanupCache()
  }

  /**
   * 更新游戏状态
   */
  updateGameState(
    snapshot: any,
    memory: GameMemory
  ): void {
    // 贪婪策略可以基于游戏状态调整策略
    const gamePhase = snapshot.gamePhase
    const currentRound = snapshot.currentRound

    // 根据游戏阶段调整策略
    if (gamePhase === 'late_game' || currentRound > 15) {
      // 游戏后期，降低贪婪倾向，增加谨慎
      this.state.specificState.greedyTendency = Math.max(0.5, this.state.specificState.greedyTendency - 0.1)
      this.state.specificState.riskTolerance = Math.max(0.1, this.state.specificState.riskTolerance - 0.1)
    } else if (gamePhase === 'early_game' || currentRound < 5) {
      // 游戏早期，可以更贪婪
      this.state.specificState.greedyTendency = Math.min(0.9, this.state.specificState.greedyTendency + 0.1)
      this.state.specificState.riskTolerance = Math.min(0.5, this.state.specificState.riskTolerance + 0.1)
    }
  }

  /**
   * 计算贪婪调整
   */
  private calculateGreedyAdjustment(
    pattern: CardPatternVO,
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    let adjustment = 0

    // 1. 牌型强度：越强的牌型，贪婪策略越喜欢
    const patternStrength = this.calculatePatternStrength(pattern)
    adjustment += patternStrength * 0.2

    // 2. 当前牌型比较：如果能压制当前牌型，加分
    const currentPattern = memory.snapshots[memory.snapshots.length - 1]?.currentPattern
    if (currentPattern) {
      const canBeatCurrent = this.canBeatPattern(pattern, currentPattern)
      if (canBeatCurrent) {
        adjustment += 20
      }
    }

    // 3. 手牌优化：出牌后手牌更整齐，加分
    const handOptimization = this.calculateHandOptimization(pattern, [], memory)
    adjustment += handOptimization * 0.15

    // 4. 应用贪婪倾向
    adjustment *= this.state.specificState.greedyTendency

    return adjustment
  }

  /**
   * 计算风险调整
   */
  private calculateRiskAdjustment(
    pattern: CardPatternVO,
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    let adjustment = 0

    // 1. 基础风险评分
    const riskScore = this.calculateRiskScore(pattern, gameSession, memory)

    // 2. 应用风险容忍度
    const riskFactor = (100 - riskScore) / 100 // 风险越高，分数越低
    adjustment += riskFactor * 30 * this.state.specificState.riskTolerance

    // 3. 特殊牌型风险考虑
    if (pattern.type === 'bomb' || pattern.type === 'rocket') {
      // 炸弹和王炸有特殊风险考虑
      adjustment -= 10 // 稍微降低评分，避免过早使用王牌
    }

    return adjustment
  }

  /**
   * 计算过牌状态调整
   */
  private calculatePassStateAdjustment(
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    let adjustment = 0

    // 1. 当前牌型强度：如果当前牌型很强，过牌更合理
    const currentPattern = memory.snapshots[memory.snapshots.length - 1]?.currentPattern
    if (currentPattern) {
      const currentStrength = this.calculatePatternStrength(currentPattern)
      if (currentStrength > 60) {
        adjustment += 20 // 当前牌型很强，过牌更合理
      }
    }

    // 2. 手牌数量：手牌很少时，过牌可能更谨慎
    const playerHandCounts = memory.snapshots[memory.snapshots.length - 1]?.playerHandCounts || {}
    const myHandCount = playerHandCounts[gameSession.currentRound?.currentPlayerId || ''] || 27
    if (myHandCount < 5) {
      adjustment += 15 // 手牌很少，谨慎过牌
    }

    // 3. 回合数：游戏后期过牌更谨慎
    const currentRound = gameSession.currentRound?.roundNumber || 0
    if (currentRound > 20) {
      adjustment += 10
    }

    return adjustment
  }

  /**
   * 估计未来收益潜力
   */
  private estimateFutureGainPotential(
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    // 简化的未来收益估计
    let potential = 0

    // 1. 手牌中是否有强牌
    const playerHandCounts = memory.snapshots[memory.snapshots.length - 1]?.playerHandCounts || {}
    const myHandCount = playerHandCounts[gameSession.currentRound?.currentPlayerId || ''] || 27

    // 手牌越多，未来潜力可能越大
    if (myHandCount > 20) {
      potential += 10
    }

    // 2. 游戏阶段：早期阶段未来潜力更大
    const currentRound = gameSession.currentRound?.roundNumber || 0
    if (currentRound < 10) {
      potential += 15
    }

    return potential
  }

  /**
   * 优化当前利益
   */
  private optimizeForImmediateGain(
    bestOption: PlayOption,
    allOptions: PlayOption[],
    gameSession: GameSession,
    memory: GameMemory
  ): PlayOption {
    // 贪婪策略的优化：选择当前利益最大化的选项
    const optimizedOption = { ...bestOption }

    // 1. 如果可以选择压制性出牌，优先选择
    const currentPattern = memory.snapshots[memory.snapshots.length - 1]?.currentPattern
    const dominatingOptions = allOptions.filter(option => {
      if (!option.pattern || !currentPattern) return false
      return this.canBeatPattern(option.pattern, currentPattern)
    })

    if (dominatingOptions.length > 0) {
      // 选择压制性出牌中评分最高的
      let bestDomination = dominatingOptions[0]
      for (let i = 1; i < dominatingOptions.length; i++) {
        if (dominatingOptions[i].score > bestDomination.score) {
          bestDomination = dominatingOptions[i]
        }
      }

      // 如果压制性出牌评分足够高，选择它
      if (bestDomination.score >= bestOption.score * 0.8) {
        return bestDomination
      }
    }

    // 2. 考虑出牌后的手牌优化
    const handOptimizationScore = this.evaluateHandOptimization(bestOption, memory)
    optimizedOption.score = bestOption.score * 0.7 + handOptimizationScore * 0.3

    return optimizedOption
  }

  /**
   * 评估手牌优化
   */
  private evaluateHandOptimization(option: PlayOption, memory: GameMemory): number {
    // 简化的手牌优化评估
    if (!option.pattern) return 50

    // 出牌后剩余手牌的评估
    const pattern = option.pattern
    const handOptimization = this.calculateHandOptimization(pattern, [], memory)

    return handOptimization
  }

  /**
   * 判断牌型是否能压制另一个牌型
   */
  private canBeatPattern(pattern1: CardPatternVO, pattern2: CardPatternVO): boolean {
    // 简化的牌型比较逻辑
    // 实际应该使用游戏规则服务中的比较逻辑

    // 1. 炸弹和王炸可以压制任何非炸弹牌型
    if (pattern1.type === 'bomb' || pattern1.type === 'rocket') {
      if (pattern2.type !== 'bomb' && pattern2.type !== 'rocket') {
        return true
      }
    }

    // 2. 同类型牌型比较
    if (pattern1.type === pattern2.type) {
      // 简化的点数比较
      const rankValues: Record<string, number> = {
        '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15
      }

      const rank1 = pattern1.rank ? rankValues[pattern1.rank] || 0 : 0
      const rank2 = pattern2.rank ? rankValues[pattern2.rank] || 0 : 0

      return rank1 > rank2
    }

    return false
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(pattern: CardPatternVO, gameSession: GameSession): string {
    const patternKey = `${pattern.type}_${pattern.rank || 'none'}_${pattern.cards.length}`
    const sessionKey = gameSession.id || 'unknown'
    const roundKey = gameSession.currentRound?.roundNumber || 0
    return `${patternKey}_${sessionKey}_${roundKey}`
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now()
    // 这里可以添加更复杂的缓存清理逻辑
    // 目前只是简单限制缓存大小
    if (this.scoreCache.size > 100) {
      this.scoreCache.clear()
    }
  }

  /**
   * 记录最佳选择
   */
  private recordBestChoice(option: PlayOption, gameSession: GameSession): void {
    // 记录这次选择
    this.bestChoicesHistory.push({
      timestamp: Date.now(),
      patternType: option.pattern?.type || 'pass',
      score: option.score,
      wasSuccessful: false // 将在后续更新
    })

    // 限制历史记录大小
    if (this.bestChoicesHistory.length > 100) {
      this.bestChoicesHistory = this.bestChoicesHistory.slice(-100)
    }
  }

  /**
   * 调整贪婪倾向
   */
  private adjustGreedyTendency(wasSuccessful: boolean): void {
    const currentTendency = this.state.specificState.greedyTendency

    if (wasSuccessful) {
      // 成功时增加贪婪倾向
      this.state.specificState.greedyTendency = Math.min(0.95, currentTendency + 0.05)
    } else {
      // 失败时减少贪婪倾向
      this.state.specificState.greedyTendency = Math.max(0.3, currentTendency - 0.1)
    }
  }

  /**
   * 生成贪婪策略理由
   */
  private generateGreedyReason(option: PlayOption, score: number, totalOptions: number): string {
    const patternType = option.pattern?.type || '过牌'
    const scorePercent = Math.round(score)

    if (option.choice === 'pass') {
      return `贪婪策略选择过牌（评分: ${scorePercent}%，评估了${totalOptions}个选项）`
    } else {
      return `贪婪策略选择${patternType}（评分: ${scorePercent}%，当前最优选择）`
    }
  }

  /**
   * 获取评分最高的选项
   */
  private getHighestScoringOption(options: PlayOption[]): PlayOption | null {
    if (options.length === 0) return null

    let bestOption = options[0]
    for (let i = 1; i < options.length; i++) {
      if (options[i].score > bestOption.score) {
        bestOption = options[i]
      }
    }

    return bestOption
  }

  /**
   * 创建默认选项
   */
  private createDefaultOption(): PlayOption {
    return {
      choice: 'pass' as any,
      cards: [],
      score: 40,
      reason: '贪婪策略默认选项',
      validation: {
        valid: true,
        message: '默认过牌'
      }
    }
  }

  /**
   * 获取贪婪倾向
   */
  getGreedyTendency(): number {
    return this.state.specificState.greedyTendency
  }

  /**
   * 获取风险容忍度
   */
  getRiskTolerance(): number {
    return this.state.specificState.riskTolerance
  }

  /**
   * 获取最佳选择历史
   */
  getBestChoicesHistory() {
    return [...this.bestChoicesHistory]
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.scoreCache.size,
      hitRate: this.calculateCacheHitRate()
    }
  }

  /**
   * 计算缓存命中率
   */
  private calculateCacheHitRate(): number {
    // 简化的命中率计算
    const totalEvaluations = this.state.decisionCount
    if (totalEvaluations === 0) return 0

    const cacheHits = Math.floor(totalEvaluations * 0.3) // 估计值
    return cacheHits / totalEvaluations
  }
}
