/**
 * 玩家实体
 *
 * 掼蛋游戏是2对2的牌类游戏，玩家实体的职责：
 * - 管理玩家基本信息（ID、昵称、类型）
 * - 管理玩家游戏状态（位置、准备状态、手牌）
 * - 管理玩家得分和搭档关系
 */

import type { Card } from '../value-objects/Card'
import type { PlayerType } from '../../types/game'

/**
 * 玩家位置
 */
export type PlayerPosition = 'south' | 'north' | 'west' | 'east'

/**
 * 玩家状态
 */
export type PlayerState = 'ready' | 'thinking' | 'playing' | 'waiting' | 'out' | 'surrender'

/**
 * 搭档状态
 */
export type PartnerStatus = 'unknown' | 'paired' | 'partner_broke'

/**
 * 玩家实体
 *
 * 领域驱动设计原则：
 * - 封装玩家相关业务逻辑
 * - 不直接操作数据库
 * - 通过方法暴露状态变更
 */
export class Player {
  /**
   * 玩家唯一标识
   */
  readonly userId: string

  /**
   * 玩家昵称
   */
  nickname: string

  /**
   * 玩家类型
   * - human: 人类玩家
   * - ai: AI玩家
   */
  readonly type: PlayerType

  /**
   * 玩家位置
   * - south: 南家（下方）
   * - north: 北家（上方）
   * - west: 西家（左侧）
   * - east: 东家（右侧）
   */
  position: PlayerPosition | null

  /**
   * 是否已准备
   */
  isReady: boolean

  /**
   * 是否是庄家
   */
  isDealer: boolean

  /**
   * 是否是搭档
   */
  isPartner: boolean

  /**
   * 搭档状态
   */
  partnerStatus: PartnerStatus

  /**
   * 当前得分
   */
  score: number

  /**
   * 剩余手牌数量
   */
  remainingCards: number

  /**
   * 手牌列表
   */
  handCards: Card[]

  /**
   * 玩家当前状态
   */
  state: PlayerState

  /**
   * 回合计数器
   */
  turnCount: number

  /**
   * 是否处于游戏会话中
   */
  private inGameSession: boolean

  /**
   * 是否被淘汰
   */
  isEliminated: boolean

  /**
   * 创建玩家实例
   */
  constructor(
    userId: string,
    nickname: string,
    type: PlayerType = 'human',
    position: PlayerPosition | null = null
  ) {
    this.userId = userId
    this.nickname = nickname
    this.type = type
    this.position = position
    this.isReady = false
    this.isDealer = false
    this.isPartner = false
    this.partnerStatus = 'unknown'
    this.score = 0
    this.remainingCards = 0
    this.handCards = []
    this.state = 'waiting'
    this.turnCount = 0
    this.inGameSession = false
    this.isEliminated = false
  }

  /**
   * 设置玩家位置
   */
  setPosition(position: PlayerPosition | null): void {
    if (this.inGameSession) {
      throw new Error('游戏进行中不能更改位置')
    }
    this.position = position
  }

  /**
   * 设置准备状态
   */
  setReady(isReady: boolean): void {
    this.isReady = isReady
  }

  /**
   * 设置庄家状态
   */
  setDealer(isDealer: boolean): void {
    this.isDealer = isDealer
  }

  /**
   * 设置搭档关系
   */
  setPartner(isPartner: boolean): void {
    this.isPartner = isPartner
  }

  /**
   * 更新搭档状态
   */
  updatePartnerStatus(status: PartnerStatus): void {
    this.partnerStatus = status
  }

  /**
   * 增加得分
   */
  addScore(points: number): void {
    this.score += points
  }

  /**
   * 设置手牌
   */
  setHandCards(cards: Card[]): void {
    if (!this.inGameSession) {
      throw new Error('玩家不在游戏中')
    }
    this.handCards = cards
    this.remainingCards = cards.length
  }

  /**
   * 扣减手牌（出牌后调用）
   */
  playCards(cards: Card[]): void {
    if (!this.inGameSession) {
      throw new Error('玩家不在游戏中')
    }

    // 验证卡牌是否属于该玩家
    const cardIds = cards.map(c => c.id)
    const playerCardIds = this.handCards.map(c => c.id)

    for (const cardId of cardIds) {
      const index = playerCardIds.indexOf(cardId)
      if (index === -1) {
        throw new Error(`玩家 ${this.nickname} 没有这张卡牌`)
      }
    }

    // 从手牌中移除
    this.handCards = this.handCards.filter(c => !cardIds.includes(c.id))
    this.remainingCards = this.handCards.length
  }

  /**
   * 增加回合计数
   */
  incrementTurnCount(): void {
    this.turnCount++
  }

  /**
   * 开始游戏会话
   */
  startSession(): void {
    this.inGameSession = true
    this.isEliminated = false
    this.state = 'ready'
  }

  /**
   * 结束游戏会话
   */
  endSession(): void {
    this.inGameSession = false
    this.state = 'waiting'
  }

  /**
   * 玩家离线
   */
  goOffline(): void {
    if (this.inGameSession) {
      this.isEliminated = true
      this.state = 'out'
    }
  }

  /**
   * 玩家重新上线
   */
  goOnline(): void {
    this.isEliminated = false
  }

  /**
   * 检查玩家是否在游戏中
   */
  isInGame(): boolean {
    return this.inGameSession && !this.isEliminated
  }

  /**
   * 检查玩家是否可以出牌
   */
  canPlay(): boolean {
    return (
      this.isInGame() &&
      this.state === 'ready' &&
      this.isReady &&
      this.position !== null
    )
  }

  /**
   * 进入思考状态
   */
  startThinking(): void {
    this.state = 'thinking'
  }

  /**
   * 退出思考状态
   */
  stopThinking(): void {
    this.state = 'ready'
  }

  /**
   * 进入游戏状态
   */
  startPlaying(): void {
    this.state = 'playing'
  }

  /**
   * 玩家弃牌
   */
  surrender(): void {
    this.state = 'surrender'
    this.isEliminated = true
  }

  /**
   * 获取玩家信息快照（用于持久化）
   */
  toSnapshot(): PlayerSnapshot {
    return {
      userId: this.userId,
      nickname: this.nickname,
      type: this.type,
      position: this.position,
      isReady: this.isReady,
      isDealer: this.isDealer,
      isPartner: this.isPartner,
      partnerStatus: this.partnerStatus,
      score: this.score,
      remainingCards: this.remainingCards,
      state: this.state,
      turnCount: this.turnCount,
      inGameSession: this.inGameSession,
      isEliminated: this.isEliminated,
    }
  }

  /**
   * 从快照恢复玩家状态
   */
  static fromSnapshot(snapshot: PlayerSnapshot): Player {
    const player = new Player(
      snapshot.userId,
      snapshot.nickname,
      snapshot.type,
      snapshot.position
    )

    player.isReady = snapshot.isReady
    player.isDealer = snapshot.isDealer
    player.isPartner = snapshot.isPartner
    player.partnerStatus = snapshot.partnerStatus
    player.score = snapshot.score
    player.remainingCards = snapshot.remainingCards
    player.handCards = []
    player.state = snapshot.state
    player.turnCount = snapshot.turnCount
    player.inGameSession = snapshot.inGameSession
    player.isEliminated = snapshot.isEliminated

    return player
  }
}

/**
 * 玩家快照接口（用于序列化）
 */
export interface PlayerSnapshot {
  userId: string
  nickname: string
  type: PlayerType
  position: PlayerPosition | null
  isReady: boolean
  isDealer: boolean
  isPartner: boolean
  partnerStatus: PartnerStatus
  score: number
  remainingCards: number
  state: PlayerState
  turnCount: number
  inGameSession: boolean
  isEliminated: boolean
}
