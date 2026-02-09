/**
 * 随机策略
 *
 * 随机选择合法出牌，适合新手难度AI
 * 特点：
 * 1. 完全随机，不考虑牌型优劣和游戏策略
 * 2. 简单快速，决策时间短
 * 3. 适合测试和基础AI
 */

import type { GameSession } from '../../../../domain/entities/GameSession'
import type { CardPatternVO } from '../../../../domain/value-objects/CardPatternVO'
import type { PlayOption, AIDifficultyLevel } from '../types'
import { BaseStrategy, type GameMemory } from './BaseStrategy'

/**
 * 随机策略
 */
export class RandomStrategy extends BaseStrategy {
  /** 随机数种子 */
  private seed: number

  /** 随机数生成器状态 */
  private randomState: number

  /**
   * 构造函数
   */
  constructor(difficulty: AIDifficultyLevel, config?: Partial<any>) {
    super(difficulty, config)
    this.seed = Date.now()
    this.randomState = this.seed
    this.state.specificState = {
      randomDistribution: 'uniform',
      lastRandomValues: []
    }
  }

  /**
   * 获取策略类型
   */
  protected getStrategyType(): string {
    return 'random'
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
        // 没有有效选项，返回第一个选项
        return options[0] || this.createDefaultOption()
      }

      // 2. 随机选择一个选项
      const randomIndex = this.getRandomInt(0, validOptions.length - 1)
      const selectedOption = validOptions[randomIndex]

      // 3. 添加随机扰动到评分（模拟随机策略的不确定性）
      const perturbedScore = this.perturbScore(selectedOption.score)
      const perturbedOption: PlayOption = {
        ...selectedOption,
        score: perturbedScore,
        reason: `随机选择: ${selectedOption.reason} (原始评分: ${selectedOption.score}, 扰动后: ${perturbedScore})`
      }

      // 4. 记录随机选择
      this.recordRandomSelection(randomIndex, validOptions.length, perturbedOption)

      return perturbedOption

    } catch (error) {
      console.error('随机策略选择失败:', error)
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
    const startTime = Date.now()

    try {
      // 随机策略使用随机评分
      const baseScore = this.getRandomInt(30, 70) // 30-70之间的随机分数

      // 添加一些基本的牌型考虑（但仍然是随机的）
      const patternBonus = this.getPatternBonus(pattern)
      const randomBonus = this.getRandomInt(-10, 10)

      const totalScore = baseScore + patternBonus + randomBonus

      // 确保分数在0-100之间
      const finalScore = Math.max(0, Math.min(100, totalScore))

      // 更新决策统计（随机策略假设评估总是成功的）
      const decisionTime = Math.max(1, Date.now() - startTime) // 至少1毫秒
      const isSuccessful = finalScore > this.config.thresholds.minConfidence * 100
      this.updateDecisionStats(decisionTime, isSuccessful)

      return finalScore
    } catch (error) {
      console.error('随机策略评估出牌失败:', error)
      // 即使失败也更新决策统计
      const decisionTime = Math.max(1, Date.now() - startTime)
      this.updateDecisionStats(decisionTime, false)
      return 30 // 失败时返回保守评分
    }
  }

  /**
   * 评估过牌选项
   */
  evaluatePass(
    gameSession: GameSession,
    memory: GameMemory
  ): number {
    const startTime = Date.now()

    try {
      // 随机策略中过牌的评分也是随机的
      const baseScore = this.getRandomInt(20, 60)

      // 根据游戏状态添加一些随机调整
      const stateAdjustment = this.getStateAdjustment(gameSession, memory)
      const randomAdjustment = this.getRandomInt(-15, 15)

      const totalScore = baseScore + stateAdjustment + randomAdjustment

      const finalScore = Math.max(0, Math.min(100, totalScore))

      // 更新决策统计（随机策略假设评估总是成功的）
      const decisionTime = Math.max(1, Date.now() - startTime) // 至少1毫秒
      const isSuccessful = finalScore > this.config.thresholds.minConfidence * 100
      this.updateDecisionStats(decisionTime, isSuccessful)

      return finalScore
    } catch (error) {
      console.error('随机策略评估过牌失败:', error)
      // 即使失败也更新决策统计
      const decisionTime = Math.max(1, Date.now() - startTime)
      this.updateDecisionStats(decisionTime, false)
      return 30 // 失败时返回保守评分
    }
  }

  /**
   * 更新记忆
   */
  updateMemory(
    playRecord: any,
    gameSession: GameSession,
    memory: GameMemory
  ): void {
    // 随机策略基本不更新记忆，但可以记录一些基本信息
    if (this.state.specificState.lastRandomValues.length >= 10) {
      this.state.specificState.lastRandomValues.shift()
    }
    this.state.specificState.lastRandomValues.push({
      timestamp: Date.now(),
      playType: playRecord.pattern?.type || 'unknown',
      score: this.getRandomInt(0, 100)
    })
  }

  /**
   * 更新游戏状态
   */
  updateGameState(
    snapshot: any,
    memory: GameMemory
  ): void {
    // 随机策略基本不更新游戏状态
    // 可以记录一些基本信息用于调试
    if (this.state.specificState.lastRandomValues.length >= 20) {
      this.state.specificState.lastRandomValues = this.state.specificState.lastRandomValues.slice(-10)
    }
  }

  /**
   * 获取随机整数
   */
  private getRandomInt(min: number, max: number): number {
    // 简单的伪随机数生成器
    this.randomState = (this.randomState * 9301 + 49297) % 233280
    const random = this.randomState / 233280
    return Math.floor(random * (max - min + 1)) + min
  }

  /**
   * 获取牌型加成
   */
  private getPatternBonus(pattern: CardPatternVO): number {
    // 简单的牌型加成表
    const patternBonuses: Record<string, number> = {
      'single': 0,
      'pair': 5,
      'triple': 10,
      'triple_with_pair': 15,
      'straight': 20,
      'consecutive_pairs': 25,
      'plane': 30,
      'plane_with_pairs': 35,
      'bomb': 40,
      'rocket': 50
    }

    return patternBonuses[pattern.type] || 0
  }

  /**
   * 获取状态调整
   */
  private getStateAdjustment(gameSession: GameSession, memory: GameMemory): number {
    let adjustment = 0

    // 1. 回合数影响：回合越靠后，越倾向于过牌
    const currentRound = gameSession.currentRound?.roundNumber || 0
    if (currentRound > 10) {
      adjustment += 10
    }

    // 2. 手牌数量影响：手牌越少，越倾向于过牌
    const playerHandCounts = memory.snapshots[memory.snapshots.length - 1]?.playerHandCounts || {}
    const myHandCount = playerHandCounts[gameSession.currentRound?.currentPlayerId || ''] || 27
    if (myHandCount < 10) {
      adjustment += 15
    } else if (myHandCount < 20) {
      adjustment += 5
    }

    // 3. 随机扰动
    adjustment += this.getRandomInt(-5, 5)

    return adjustment
  }

  /**
   * 扰动评分
   */
  private perturbScore(originalScore: number): number {
    // 添加随机扰动
    const perturbation = this.getRandomInt(-20, 20)
    const perturbedScore = originalScore + perturbation

    // 确保分数在0-100之间
    return Math.max(0, Math.min(100, perturbedScore))
  }

  /**
   * 记录随机选择
   */
  private recordRandomSelection(
    selectedIndex: number,
    totalOptions: number,
    selectedOption: PlayOption
  ): void {
    // 记录选择统计
    if (!this.state.specificState.selectionStats) {
      this.state.specificState.selectionStats = {
        totalSelections: 0,
        indexDistribution: {},
        scoreDistribution: {
          '0-20': 0,
          '21-40': 0,
          '41-60': 0,
          '61-80': 0,
          '81-100': 0
        }
      }
    }

    const stats = this.state.specificState.selectionStats
    stats.totalSelections++

    // 记录索引分布
    const indexKey = selectedIndex.toString()
    stats.indexDistribution[indexKey] = (stats.indexDistribution[indexKey] || 0) + 1

    // 记录分数分布
    const score = selectedOption.score
    let scoreRange: string
    if (score <= 20) scoreRange = '0-20'
    else if (score <= 40) scoreRange = '21-40'
    else if (score <= 60) scoreRange = '41-60'
    else if (score <= 80) scoreRange = '61-80'
    else scoreRange = '81-100'

    stats.scoreDistribution[scoreRange] = (stats.scoreDistribution[scoreRange] || 0) + 1

    // 限制统计记录大小
    if (stats.totalSelections > 1000) {
      this.resetSelectionStats()
    }
  }

  /**
   * 重置选择统计
   */
  private resetSelectionStats(): void {
    this.state.specificState.selectionStats = {
      totalSelections: 0,
      indexDistribution: {},
      scoreDistribution: {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0
      }
    }
  }

  /**
   * 创建默认选项
   */
  private createDefaultOption(): PlayOption {
    return {
      choice: 'pass' as any,
      cards: [],
      score: 50,
      reason: '随机策略默认选项',
      validation: {
        valid: true,
        message: '默认过牌'
      }
    }
  }

  /**
   * 获取选择统计
   */
  getSelectionStats() {
    return this.state.specificState.selectionStats || {
      totalSelections: 0,
      indexDistribution: {},
      scoreDistribution: {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0
      }
    }
  }

  /**
   * 获取随机数状态
   */
  getRandomState() {
    return {
      seed: this.seed,
      currentState: this.randomState,
      lastRandomValues: [...this.state.specificState.lastRandomValues]
    }
  }

  /**
   * 重置随机数生成器
   */
  resetRandomGenerator(newSeed?: number): void {
    this.seed = newSeed || Date.now()
    this.randomState = this.seed
    this.state.specificState.lastRandomValues = []
  }
}
