/**
 * AI玩家基类
 *
 * AI玩家核心逻辑，与游戏状态交互，调用策略决策
 * 职责：
 * 1. 管理AI玩家状态和配置
 * 2. 与游戏规则服务集成验证出牌合法性
 * 3. 调用策略进行智能决策
 * 4. 维护游戏状态记忆和团队协作
 */

import type { Card } from '../../../domain/entities/Card'
import type { GameSession } from '../../../domain/entities/GameSession'
import type { CardPatternVO } from '../../../domain/value-objects/CardPatternVO'
import type { GameRuleService } from '../rules/GameRuleService'
import type { ValidationResult, PlayChoice } from '../rules/types'
import { CardRecognizer } from '../rules/CardRecognizer'

import {
  type AIPlayerConfig,
  type PlayDecision,
  type PlayOption,
  type GameStateSnapshot,
  type PlayRecord,
  type MemoryEntry,
  type TeamworkState,
  type AIStrategyType,
  AIDifficultyLevel
} from './types'
import { BaseStrategy } from './strategies/BaseStrategy'
import { RandomStrategy } from './strategies/RandomStrategy'
import { GreedyStrategy } from './strategies/GreedyStrategy'
import { MemoryStrategy } from './strategies/MemoryStrategy'

/**
 * AI玩家类
 */
export class AIPlayer {
  /** AI配置 */
  private config: AIPlayerConfig

  /** 当前策略实例 */
  private strategy: BaseStrategy

  /** 游戏规则服务 */
  private gameRuleService: GameRuleService

  /** 当前手牌 */
  private handCards: Card[] = []

  /** 游戏状态记忆 */
  private gameMemory: {
    /** 游戏状态快照 */
    snapshots: GameStateSnapshot[]

    /** 出牌记录 */
    playRecords: PlayRecord[]

    /** 玩家记忆 */
    playerMemories: Map<string, MemoryEntry>

    /** 团队协作状态 */
    teamworkState?: TeamworkState
  } = {
    snapshots: [],
    playRecords: [],
    playerMemories: new Map()
  }

  /** 决策历史 */
  private decisionHistory: PlayDecision[] = []

  /** 最后决策时间 */
  private lastDecisionTime: number = 0

  /** 决策超时时间（毫秒） */
  private decisionTimeout: number = 3000

  /** 玩家ID */
  readonly userId: string

  /** 玩家昵称 */
  nickname: string

  /** 玩家类型 */
  readonly type: 'ai' = 'ai'

  /** 玩家位置 */
  position: string = 'south'

  /** 是否已准备 */
  isReady: boolean = true

  /** 手牌数量 */
  handCount: number = 0

  /**
   * 构造函数
   */
  constructor(config: AIPlayerConfig, gameRuleService: GameRuleService) {
    this.userId = config.playerId
    this.nickname = config.name
    this.config = config
    this.gameRuleService = gameRuleService

    // 根据策略类型创建策略实例
    this.strategy = this.createStrategy(config.strategy, config.difficulty)
  }

  /**
   * 创建策略实例
   */
  private createStrategy(strategyType: string, difficulty: AIDifficultyLevel): BaseStrategy {
    switch (strategyType) {
      case 'random':
        return new RandomStrategy(difficulty)
      case 'greedy':
        return new GreedyStrategy(difficulty)
      case 'memory':
        return new MemoryStrategy(difficulty)
      default:
        // 默认使用随机策略
        return new RandomStrategy(difficulty)
    }
  }

  /**
   * 设置手牌
   */
  setHandCards(cards: Card[]): void {
    this.handCards = [...cards].sort(this.compareCards)
    this.updateHandState()
  }

  /**
   * 卡牌比较函数（用于排序）
   */
  private compareCards(a: Card, b: Card): number {
    // 简化的比较逻辑，实际应该使用CardPatternVO中的比较逻辑
    const rankOrder: Record<string, number> = {
      '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7,
      '10': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12, '2': 13,
      'black_joker': 14, 'red_joker': 15
    }

    const suitOrder: Record<string, number> = {
      'spade': 1, 'heart': 2, 'club': 3, 'diamond': 4
    }

    const aRank = a.rank in rankOrder ? rankOrder[a.rank] : 0
    const bRank = b.rank in rankOrder ? rankOrder[b.rank] : 0

    if (aRank !== bRank) {
      return aRank - bRank
    }

    const aSuit = a.suit in suitOrder ? suitOrder[a.suit] : 0
    const bSuit = b.suit in suitOrder ? suitOrder[b.suit] : 0

    return aSuit - bSuit
  }

  /**
   * 更新手牌状态
   */
  private updateHandState(): void {
    // 更新玩家手牌状态
    this.handCount = this.handCards.length
    // 可以在这里添加更多手牌状态更新逻辑
  }

  /**
   * 做出决策
   */
  makeDecision(gameSession: GameSession): PlayDecision {
    const startTime = Date.now()
    this.lastDecisionTime = startTime

    try {
      // 1. 更新游戏状态
      this.updateGameState(gameSession)

      // 2. 获取所有可能的出牌选项
      const playOptions = this.getPossiblePlays(gameSession)

      if (playOptions.length === 0) {
        // 没有合法出牌选项，选择过牌
        return {
          choice: 'pass' as PlayChoice,
          cards: [],
          confidence: 1.0,
          timestamp: startTime,
          reason: '没有合法出牌选项'
        }
      }

      // 3. 使用策略选择最佳出牌
      const bestOption = this.strategy.selectBestPlay(playOptions, gameSession, this.gameMemory)

      // 4. 构建决策
      const decision: PlayDecision = {
        choice: bestOption.choice,
        cards: bestOption.cards,
        confidence: bestOption.score / 100, // 将0-100的分数转换为0-1的置信度
        timestamp: startTime,
        reason: bestOption.reason,
        alternatives: playOptions.filter(opt => opt !== bestOption).slice(0, 3) // 保留前3个备选
      }

      // 5. 记录决策历史
      this.decisionHistory.push(decision)

      // 6. 更新策略记忆
      if (bestOption.cards && bestOption.cards.length > 0) {
        const currentRound = gameSession.currentRound
        const playRecord: PlayRecord = {
          playerId: this.userId,
          cards: bestOption.cards,
          pattern: bestOption.pattern,
          choice: bestOption.choice,
          round: currentRound?.roundNumber || 0,
          timestamp: startTime,
          isValid: true // 假设策略返回的都是合法出牌
        }
        this.gameMemory.playRecords.push(playRecord)
        this.strategy.updateMemory(playRecord, gameSession, this.gameMemory)
      }

      return decision

    } catch (error) {
      console.error(`AI玩家 ${this.nickname} 决策失败:`, error)

      // 决策失败时返回保守的过牌决策
      return {
        choice: 'pass' as PlayChoice,
        cards: [],
        confidence: 0.1,
        timestamp: startTime,
        reason: `决策失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 更新游戏状态
   */
  updateGameState(gameSession: GameSession): void {
    const currentRound = gameSession.currentRound
    const snapshot: GameStateSnapshot = {
      sessionId: gameSession.id || 'unknown',
      currentRound: currentRound?.roundNumber || 0,
      currentPlayerId: currentRound?.currentPlayerId || '',
      currentPattern: this.getCurrentPatternFromSession(gameSession),
      playerHandCounts: this.getPlayerHandCounts(gameSession),
      playedCardsHistory: this.gameMemory.playRecords.slice(-20), // 保留最近20条记录
      gamePhase: gameSession.phase || 'unknown',
      teamScores: this.getTeamScores(gameSession),
      timestamp: Date.now()
    }

    this.gameMemory.snapshots.push(snapshot)

    // 保留最近50个快照
    if (this.gameMemory.snapshots.length > 50) {
      this.gameMemory.snapshots = this.gameMemory.snapshots.slice(-50)
    }

    // 通知策略更新状态
    this.strategy.updateGameState(snapshot, this.gameMemory)
  }

  /**
   * 获取玩家手牌数量映射
   */
  private getPlayerHandCounts(gameSession: GameSession): Record<string, number> {
    const counts: Record<string, number> = {}

    try {
      // 尝试从gameSession的room中获取玩家信息
      const room = gameSession.getRoom?.()
      if (room?.getActivePlayers) {
        const players = room.getActivePlayers()
        for (const player of players) {
          // 假设玩家对象有handCount属性
          counts[player.userId] = (player as any).handCount || 0
        }
      }
    } catch (error) {
      console.warn(`获取玩家手牌数量失败:`, error)
    }

    return counts
  }

  /**
   * 获取团队得分
   */
  private getTeamScores(gameSession: GameSession): Record<string, number> {
    const scores: Record<string, number> = {}

    try {
      // 从gameSession的scores Map中获取得分
      if (gameSession.scores && typeof gameSession.scores.forEach === 'function') {
        gameSession.scores.forEach((score, playerId) => {
          // 这里需要根据玩家ID映射到团队
          // 暂时假设每个玩家独立计分
          scores[playerId] = score
        })
      }
    } catch (error) {
      console.warn(`获取团队得分失败:`, error)
    }

    return scores
  }

  /**
   * 获取所有可能的出牌选项
   */
  getPossiblePlays(gameSession: GameSession): PlayOption[] {
    const options: PlayOption[] = []
    const currentPattern = this.getCurrentPatternFromSession(gameSession)

    // 1. 获取所有可能的牌型组合
    const possiblePatterns = this.getAllPossiblePatterns()

    // 2. 过滤出符合当前牌型规则的组合
    const validPatterns = possiblePatterns.filter(pattern => {
      if (!currentPattern) {
        // 如果没有当前牌型，任何牌型都可以出
        return true
      }

      // 使用游戏规则服务验证是否可以出这个牌型
      const validation = this.gameRuleService.validatePlay(
        this.userId,
        [...pattern.cards], // 创建数组副本以避免只读问题
        currentPattern,
        gameSession
      )

      return validation.valid
    })

    // 3. 为每个有效牌型创建出牌选项
    for (const pattern of validPatterns) {
      const option = this.createPlayOption(pattern, 'play' as PlayChoice, gameSession)
      if (option) {
        options.push(option)
      }
    }

    // 4. 添加过牌选项
    const passOption = this.createPassOption(gameSession)
    options.push(passOption)

    // 5. 按评分排序
    return options.sort((a, b) => b.score - a.score)
  }

  /**
   * 获取所有可能的牌型组合
   */
  private getAllPossiblePatterns(): CardPatternVO[] {
    if (this.handCards.length === 0) {
      return []
    }

    try {
      // 使用CardRecognizer获取所有可能的牌型
      return CardRecognizer.getAllPossiblePatterns(this.handCards)
    } catch (error) {
      console.error(`AI玩家 ${this.nickname} 获取牌型组合失败:`, error)
      return []
    }
  }

  /**
   * 从游戏会话中获取当前牌型
   */
  private getCurrentPatternFromSession(gameSession: GameSession): CardPatternVO | undefined {
    try {
      // 获取最近的非过牌出牌记录
      const recentPlays = [...gameSession.plays].reverse()

      for (const play of recentPlays) {
        if (play.choice !== 'pass' && play.cards.length > 0) {
          // 尝试从出牌记录中识别牌型
          try {
            // 使用CardRecognizer识别牌型
            const possiblePatterns = CardRecognizer.getAllPossiblePatterns(play.cards)
            if (possiblePatterns.length > 0) {
              // 返回第一个识别出的牌型（通常是最合适的）
              return possiblePatterns[0]
            }
          } catch (error) {
            console.warn(`无法从出牌记录中识别牌型:`, error)
          }
          break
        }
      }

      // 如果没有找到有效的出牌记录，返回undefined
      return undefined
    } catch (error) {
      console.error(`获取当前牌型失败:`, error)
      return undefined
    }
  }

  /**
   * 创建出牌选项
   */
  private createPlayOption(
    pattern: CardPatternVO,
    choice: PlayChoice,
    gameSession: GameSession
  ): PlayOption | null {
    try {
      // 使用策略评估这个出牌选项
      const score = this.strategy.evaluatePlay(pattern, gameSession, this.gameMemory)

      return {
        choice,
        cards: [...pattern.cards], // 创建数组副本以避免只读问题
        pattern,
        score,
        scoreDetails: {
          patternStrength: score * 0.4, // 假设牌型强度占40%
          handOptimization: score * 0.3, // 手牌优化占30%
          strategyScore: score * 0.2,   // 策略评分占20%
          riskScore: score * 0.05,      // 风险评分占5%
          teamworkScore: score * 0.05   // 团队协作占5%
        },
        reason: `出牌: ${pattern.type}，评分: ${score}`,
        validation: {
          valid: true,
          message: '合法出牌'
        }
      }
    } catch (error) {
      console.error('创建出牌选项失败:', error)
      return null
    }
  }

  /**
   * 创建过牌选项
   */
  private createPassOption(gameSession: GameSession): PlayOption {
    // 使用策略评估过牌选项
    const score = this.strategy.evaluatePass(gameSession, this.gameMemory)

    return {
      choice: 'pass' as PlayChoice,
      cards: [],
      score,
      scoreDetails: {
        patternStrength: 0,
        handOptimization: score * 0.5, // 过牌主要考虑手牌优化
        strategyScore: score * 0.3,    // 策略考虑
        riskScore: score * 0.1,        // 风险考虑
        teamworkScore: score * 0.1     // 团队考虑
      },
      reason: `选择过牌，评分: ${score}`,
      validation: {
        valid: true,
        message: '合法过牌'
      }
    }
  }

  /**
   * 设置策略
   */
  setStrategy(strategy: BaseStrategy): void {
    this.strategy = strategy
    // 更新配置中的策略类型
    this.config.strategy = this.getStrategyType(strategy)
  }

  /**
   * 获取策略类型
   */
  private getStrategyType(strategy: BaseStrategy): AIStrategyType {
    if (strategy instanceof RandomStrategy) return 'random'
    if (strategy instanceof GreedyStrategy) return 'greedy'
    if (strategy instanceof MemoryStrategy) return 'memory'
    return 'random'
  }

  /**
   * 获取AI配置
   */
  getConfig(): AIPlayerConfig {
    return { ...this.config }
  }

  /**
   * 获取当前手牌
   */
  getHandCards(): Card[] {
    return [...this.handCards]
  }

  /**
   * 获取决策历史
   */
  getDecisionHistory(): PlayDecision[] {
    return [...this.decisionHistory]
  }

  /**
   * 获取游戏记忆
   */
  getGameMemory() {
    return {
      snapshots: [...this.gameMemory.snapshots],
      playRecords: [...this.gameMemory.playRecords],
      playerMemories: new Map(this.gameMemory.playerMemories),
      teamworkState: this.gameMemory.teamworkState ? { ...this.gameMemory.teamworkState } : undefined
    }
  }

  /**
   * 清空游戏记忆
   */
  clearGameMemory(): void {
    this.gameMemory = {
      snapshots: [],
      playRecords: [],
      playerMemories: new Map()
    }
    this.decisionHistory = []
  }

  /**
   * 设置团队协作状态
   */
  setTeamworkState(teamworkState: TeamworkState): void {
    this.gameMemory.teamworkState = teamworkState
  }

  /**
   * 获取团队协作状态
   */
  getTeamworkState(): TeamworkState | undefined {
    return this.gameMemory.teamworkState
  }

  /**
   * 深度合并对象（简单实现）
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target }

    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        // 递归合并嵌套对象
        const targetValue = result[key] as Record<string, any> || {}
        result[key] = this.deepMerge(targetValue, source[key] as Record<string, any>) as any
      } else if (source[key] !== undefined) {
        // 直接赋值非对象值
        result[key] = source[key] as any
      }
    }

    return result
  }

  /**
   * 更新玩家记忆
   */
  updatePlayerMemory(playerId: string, memory: Partial<MemoryEntry>): void {
    const existing = this.gameMemory.playerMemories.get(playerId) || {
      playerId,
      patternPreferences: {},
      playHabits: {
        playBigCardsProbability: 0.5,
        keepBombsProbability: 0.5,
        takeRisksProbability: 0.5,
        teamworkTendency: 0.5
      },
      handPredictions: {
        possibleHands: [],
        handStrengthEstimate: 0,
        remainingCardsEstimate: 0
      },
      lastUpdated: Date.now(),
      confidence: 0.5
    }

    const updated: MemoryEntry = {
      ...this.deepMerge(existing, memory),
      lastUpdated: Date.now()
    }

    this.gameMemory.playerMemories.set(playerId, updated)
  }

  /**
   * 获取玩家记忆
   */
  getPlayerMemory(playerId: string): MemoryEntry | undefined {
    return this.gameMemory.playerMemories.get(playerId)
  }

  /**
   * 静态创建方法（兼容现有代码）
   */
  static create(config: AIPlayerConfig, gameRuleService: GameRuleService): AIPlayer {
    return new AIPlayer(config, gameRuleService)
  }
}