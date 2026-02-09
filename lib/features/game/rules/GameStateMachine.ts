/**
 * 游戏状态机
 *
 * 管理掼蛋游戏的状态流转和状态转移规则
 */

import type { GameSession } from '../../../domain/entities/GameSession'
import {
  IGameStateMachine,
  GameState,
  ValidationResult,
  StateInfo,
  RuleValidationError
} from './types'

/**
 * 状态转移规则
 */
interface StateTransitionRule {
  /** 起始状态 */
  from: GameState

  /** 目标状态 */
  to: GameState

  /** 转移条件 */
  condition: (gameSession: GameSession) => boolean

  /** 转移动作 */
  action?: (gameSession: GameSession) => void

  /** 转移描述 */
  description: string
}

/**
 * 游戏状态机实现
 */
export class GameStateMachine implements IGameStateMachine {
  // 状态转移规则定义
  private readonly transitionRules: StateTransitionRule[] = [
    // 准备阶段 -> 发牌阶段
    {
      from: GameState.PREPARING,
      to: GameState.DEALING,
      condition: (session) => this.canStartDealing(session),
      description: '所有玩家准备就绪，开始发牌'
    },

    // 发牌阶段 -> 叫牌阶段
    {
      from: GameState.DEALING,
      to: GameState.BIDDING,
      condition: (session) => this.canStartBidding(session),
      action: (session) => this.onStartBidding(session),
      description: '发牌完成，开始叫牌'
    },

    // 叫牌阶段 -> 出牌阶段
    {
      from: GameState.BIDDING,
      to: GameState.PLAYING,
      condition: (session) => this.canStartPlaying(session),
      action: (session) => this.onStartPlaying(session),
      description: '叫牌完成，开始出牌'
    },

    // 出牌阶段 -> 回合结束
    {
      from: GameState.PLAYING,
      to: GameState.ROUND_END,
      condition: (session) => this.canEndRound(session),
      action: (session) => this.onEndRound(session),
      description: '回合结束，计算积分'
    },

    // 回合结束 -> 出牌阶段（下一回合）
    {
      from: GameState.ROUND_END,
      to: GameState.PLAYING,
      condition: (session) => this.canStartNextRound(session),
      action: (session) => this.onStartNextRound(session),
      description: '开始下一回合'
    },

    // 回合结束 -> 游戏结束
    {
      from: GameState.ROUND_END,
      to: GameState.GAME_END,
      condition: (session) => this.canEndGame(session),
      action: (session) => this.onEndGame(session),
      description: '游戏结束'
    },

    // 游戏结束 -> 准备阶段（重新开始）
    {
      from: GameState.GAME_END,
      to: GameState.PREPARING,
      condition: (session) => this.canRestartGame(session),
      action: (session) => this.onRestartGame(session),
      description: '重新开始游戏'
    }
  ]

  // 状态信息定义
  private readonly stateInfo: Record<GameState, Omit<StateInfo, 'startTime' | 'endTime'>> = {
    [GameState.PREPARING]: {
      currentState: GameState.PREPARING,
      description: '准备阶段：玩家加入房间，准备游戏',
      allowedActions: ['join', 'leave', 'ready', 'unready'],
      duration: undefined // 无时间限制
    },
    [GameState.DEALING]: {
      currentState: GameState.DEALING,
      description: '发牌阶段：系统发牌给玩家',
      allowedActions: [],
      duration: 5000 // 5秒发牌时间
    },
    [GameState.BIDDING]: {
      currentState: GameState.BIDDING,
      description: '叫牌阶段：玩家叫主牌',
      allowedActions: ['bid', 'pass'],
      duration: 30000 // 30秒叫牌时间
    },
    [GameState.PLAYING]: {
      currentState: GameState.PLAYING,
      description: '出牌阶段：玩家轮流出牌',
      allowedActions: ['play', 'pass', 'hint'],
      duration: undefined // 无时间限制，但每个玩家有出牌时限
    },
    [GameState.ROUND_END]: {
      currentState: GameState.ROUND_END,
      description: '回合结束：计算积分，准备下一回合',
      allowedActions: ['continue', 'view_score'],
      duration: 10000 // 10秒查看积分时间
    },
    [GameState.GAME_END]: {
      currentState: GameState.GAME_END,
      description: '游戏结束：显示最终结果',
      allowedActions: ['restart', 'leave', 'view_stats'],
      duration: 30000 // 30秒查看统计时间
    }
  }

  /**
   * 状态转移
   */
  transitionTo(newState: GameState, gameSession: GameSession): boolean {
    try {
      const currentState = this.getCurrentState(gameSession)

      // 验证状态转移
      const validation = this.validateTransition(currentState, newState, gameSession)
      if (!validation.valid) {
        console.warn('状态转移验证失败:', validation.message)
        return false
      }

      // 执行状态转移
      const transitionRule = this.findTransitionRule(currentState, newState)
      if (!transitionRule) {
        console.error('找不到状态转移规则')
        return false
      }

      // 执行转移动作（如果有）
      if (transitionRule.action) {
        transitionRule.action(gameSession)
      }

      // 更新游戏会话状态
      this.updateGameSessionState(gameSession, newState)

      console.log(`状态转移成功: ${currentState} -> ${newState}`)
      return true

    } catch (error) {
      console.error('状态转移错误:', error)
      return false
    }
  }

  /**
   * 获取有效转移状态
   */
  getValidTransitions(currentState: GameState, gameSession: GameSession): GameState[] {
    try {
      const validTransitions: GameState[] = []

      for (const rule of this.transitionRules) {
        if (rule.from === currentState && rule.condition(gameSession)) {
          validTransitions.push(rule.to)
        }
      }

      return validTransitions
    } catch (error) {
      console.error('获取有效转移状态错误:', error)
      return []
    }
  }

  /**
   * 验证状态转移
   */
  validateTransition(fromState: GameState, toState: GameState, gameSession: GameSession): ValidationResult {
    try {
      // 检查是否为相同状态
      if (fromState === toState) {
        return {
          valid: false,
          message: '不能转移到相同状态',
          errorCode: RuleValidationError.INVALID_GAME_STATE
        }
      }

      // 查找转移规则
      const transitionRule = this.findTransitionRule(fromState, toState)
      if (!transitionRule) {
        return {
          valid: false,
          message: `不允许的状态转移: ${fromState} -> ${toState}`,
          errorCode: RuleValidationError.INVALID_GAME_STATE,
          details: {
            allowedTransitions: this.getValidTransitions(fromState, gameSession)
          }
        }
      }

      // 检查转移条件
      if (!transitionRule.condition(gameSession)) {
        return {
          valid: false,
          message: '不满足状态转移条件',
          errorCode: RuleValidationError.INVALID_GAME_STATE,
          details: {
            conditionDescription: transitionRule.description
          }
        }
      }

      return {
        valid: true,
        message: '状态转移验证通过'
      }
    } catch (error) {
      console.error('验证状态转移错误:', error)
      return {
        valid: false,
        message: '状态转移验证过程中发生错误',
        errorCode: RuleValidationError.UNKNOWN_ERROR
      }
    }
  }

  /**
   * 获取当前状态信息
   */
  getStateInfo(gameSession: GameSession): StateInfo {
    try {
      const currentState = this.getCurrentState(gameSession)
      const baseInfo = this.stateInfo[currentState]

      // 获取状态开始时间（从游戏会话中获取）
      const startTime = this.getStateStartTime(gameSession, currentState)

      return {
        ...baseInfo,
        startTime,
        endTime: baseInfo.duration ? new Date(startTime.getTime() + baseInfo.duration) : undefined
      }
    } catch (error) {
      console.error('获取状态信息错误:', error)
      return {
        currentState: GameState.PREPARING,
        description: '错误状态',
        allowedActions: [],
        startTime: new Date()
      }
    }
  }

  // ==================== 状态转移条件检查 ====================

  /**
   * 检查是否可以开始发牌
   */
  private canStartDealing(gameSession: GameSession): boolean {
    // 需要所有玩家准备就绪
    // 这里需要从游戏会话中获取玩家信息
    // 暂时返回true
    return true
  }

  /**
   * 检查是否可以开始叫牌
   */
  private canStartBidding(gameSession: GameSession): boolean {
    // 发牌完成后可以开始叫牌
    // 需要检查发牌是否完成
    // 暂时返回true
    return true
  }

  /**
   * 检查是否可以开始出牌
   */
  private canStartPlaying(gameSession: GameSession): boolean {
    // 叫牌完成后可以开始出牌
    // 需要检查叫牌是否完成
    // 暂时返回true
    return true
  }

  /**
   * 检查是否可以结束回合
   */
  private canEndRound(gameSession: GameSession): boolean {
    // 当有玩家出完所有牌时，回合结束
    // 需要检查玩家手牌
    // 暂时返回false
    return false
  }

  /**
   * 检查是否可以开始下一回合
   */
  private canStartNextRound(gameSession: GameSession): boolean {
    // 回合结束后，如果没有玩家达到胜利条件，可以开始下一回合
    // 需要检查游戏是否结束
    // 暂时返回true
    return true
  }

  /**
   * 检查是否可以结束游戏
   */
  private canEndGame(gameSession: GameSession): boolean {
    // 当有队伍达到胜利条件时，游戏结束
    // 需要检查积分和等级
    // 暂时返回false
    return false
  }

  /**
   * 检查是否可以重新开始游戏
   */
  private canRestartGame(gameSession: GameSession): boolean {
    // 游戏结束后，玩家可以选择重新开始
    // 需要检查玩家意愿
    // 暂时返回true
    return true
  }

  // ==================== 状态转移动作 ====================

  /**
   * 开始叫牌时的动作
   */
  private onStartBidding(gameSession: GameSession): void {
    // 初始化叫牌状态
    console.log('开始叫牌')
  }

  /**
   * 开始出牌时的动作
   */
  private onStartPlaying(gameSession: GameSession): void {
    // 初始化出牌状态
    console.log('开始出牌')
  }

  /**
   * 结束回合时的动作
   */
  private onEndRound(gameSession: GameSession): void {
    // 计算积分，更新等级
    console.log('回合结束，计算积分')
  }

  /**
   * 开始下一回合时的动作
   */
  private onStartNextRound(gameSession: GameSession): void {
    // 重新发牌，重置回合状态
    console.log('开始下一回合')
  }

  /**
   * 结束游戏时的动作
   */
  private onEndGame(gameSession: GameSession): void {
    // 计算最终结果，显示统计信息
    console.log('游戏结束')
  }

  /**
   * 重新开始游戏时的动作
   */
  private onRestartGame(gameSession: GameSession): void {
    // 重置游戏状态
    console.log('重新开始游戏')
  }

  // ==================== 辅助方法 ====================

  /**
   * 查找状态转移规则
   */
  private findTransitionRule(fromState: GameState, toState: GameState): StateTransitionRule | undefined {
    return this.transitionRules.find(rule => rule.from === fromState && rule.to === toState)
  }

  /**
   * 获取当前状态
   */
  private getCurrentState(gameSession: GameSession): GameState {
    // 从游戏会话中获取当前状态
    // 需要将 GameSession 的 phase 映射到 GameState
    const phaseMap: Record<string, GameState> = {
      'setup': GameState.PREPARING,
      'bidding': GameState.BIDDING,
      'playing': GameState.PLAYING,
      'round_end': GameState.ROUND_END,
      'game_end': GameState.GAME_END
    }

    return phaseMap[gameSession.phase] || GameState.PREPARING
  }

  /**
   * 更新游戏会话状态
   */
  private updateGameSessionState(gameSession: GameSession, newState: GameState): void {
    // 更新游戏会话的 phase
    const stateToPhase: Record<GameState, string> = {
      [GameState.PREPARING]: 'setup',
      [GameState.DEALING]: 'setup', // 发牌属于准备阶段
      [GameState.BIDDING]: 'bidding',
      [GameState.PLAYING]: 'playing',
      [GameState.ROUND_END]: 'round_end',
      [GameState.GAME_END]: 'game_end'
    }

    gameSession.phase = stateToPhase[newState] as any

    // 记录状态转移时间
    this.recordStateTransition(gameSession, newState)
  }

  /**
   * 记录状态转移
   */
  private recordStateTransition(gameSession: GameSession, newState: GameState): void {
    // 在实际实现中，这里应该记录状态转移日志
    // 暂时只打印日志
    console.log(`记录状态转移: ${this.getCurrentState(gameSession)} -> ${newState}`)
  }

  /**
   * 获取状态开始时间
   */
  private getStateStartTime(gameSession: GameSession, state: GameState): Date {
    // 从游戏会话中获取状态开始时间
    // 暂时返回当前时间
    return new Date()
  }

  /**
   * 获取状态转移规则描述
   */
  getTransitionRulesDescription(): string {
    return this.transitionRules.map(rule =>
      `${rule.from} -> ${rule.to}: ${rule.description}`
    ).join('\n')
  }

  /**
   * 获取所有状态信息
   */
  getAllStateInfo(): Record<GameState, Omit<StateInfo, 'startTime' | 'endTime'>> {
    return this.stateInfo
  }
}

/**
 * 游戏状态机单例
 */
export class GameStateMachineSingleton {
  private static instance: GameStateMachine

  static getInstance(): GameStateMachine {
    if (!GameStateMachineSingleton.instance) {
      GameStateMachineSingleton.instance = new GameStateMachine()
    }
    return GameStateMachineSingleton.instance
  }
}