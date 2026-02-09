/**
 * 游戏会话实体
 *
 * 掼蛋游戏会话实体
 * - 管理游戏实际进行过程中的状态
 * - 管理回合、出牌、得分等信息
 * - 封装游戏业务规则
 */

import type { Player } from './Player'
import type { Card } from './Card'
import type { GameRoom as Room } from './GameRoom'

/**
 * 游戏阶段
 */
export type GamePhase = 'setup' | 'bidding' | 'playing' | 'round_end' | 'game_end'

/**
 * 出牌方向
 */
export type PlayDirection = 'clockwise' | 'counter-clockwise'

/**
 * 出牌选择
 */
export type PlayChoice = 'play' | 'pass' | 'discard' | 'hint'

/**
 * 玩家出牌信息
 */
export interface PlayerPlayInfo {
  playerId: string
  playerName: string
  cards: Card[]
  choice: PlayChoice
  isPassed: boolean
  timestamp: Date
}

/**
 * 回合信息
 */
export interface RoundInfo {
  roundNumber: number
  dealerId: string
  currentPlayerId: string
  nextPlayerId: string
  direction: PlayDirection
  currentSuit?: string
  minimumCard?: Card
  timestamp: number
}

/**
 * 游戏会话实体
 *
 * 领域驱动设计原则：
 * - 有唯一标识（UUID）
 * - 管理游戏进行过程中的状态
 * - 封装游戏业务规则
 */
export class GameSession {
  /**
   * 游戏会话唯一标识
   */
  readonly id: string

  /**
   * 所属房间ID
   */
  readonly roomId: string

  /**
   * 房间引用（可选，用于访问房间信息）
   */
  private room?: Room

  /**
   * 创建者ID（房间的创建者）
   */
  createdBy: string

  /**
   * 当前游戏阶段
   */
  phase: GamePhase

  /**
   * 当前回合信息
   */
  currentRound: RoundInfo | null

  /**
   * 所有回合记录
   */
  rounds: RoundRecord[]

  /**
   * 当前出牌记录
   */
  plays: PlayerPlayInfo[]

  /**
   * 得分统计
   */
  scores: Map<string, number>

  /**
   * 游戏开始时间
   */
  startedAt: Date

  /**
   * 上一次操作时间
   */
  lastActivityAt: Date

  /**
   * 总游戏时长（毫秒）
   */
  totalDuration: number

  /**
   * 回合计数
   */
  roundCount: number

  /**
   * 游戏设置
   */
  settings: GameSettings

  /**
   * 轮到谁出牌的循环队列
   */
  private turnQueue: string[]

  /**
   * 庄家ID
   */
  private dealerId: string

  /**
   * 当前玩家索引
   */
  private currentPlayerIndex: number

  /**
   * 出牌方向
   */
  private direction: PlayDirection

  /**
   * 是否继续游戏
   */
  private _isContinuing: boolean

  /**
   * 玩家准备状态（游戏开始前）
   */
  private playerReadyStates: Map<string, boolean>

  /**
   * 每回合出牌次数
   */
  private playsPerRound: Map<string, number>

  /**
   * 创建游戏会话
   */
  constructor(
    id: string,
    roomId: string,
    createdBy: string,
    settings: GameSettings = {}
  ) {
    this.id = id
    this.roomId = roomId
    this.createdBy = createdBy
    this.phase = 'setup'
    this.currentRound = null
    this.rounds = []
    this.plays = []
    this.scores = new Map()
    this.startedAt = new Date()
    this.lastActivityAt = new Date()
    this.totalDuration = 0
    this.roundCount = 0
    this.settings = {
      maxRounds: 4,
      allowPass: true,
      allowHint: false,
      allowUndo: false,
      ...settings
    }
    this.turnQueue = []
    this.dealerId = ''
    this.currentPlayerIndex = 0
    this.direction = 'clockwise'
    this._isContinuing = false
    this.playerReadyStates = new Map()
    this.playsPerRound = new Map()
  }

  /**
   * 设置房间引用
   */
  setRoom(room: Room): void {
    this.room = room
  }

  /**
   * 获取房间引用
   */
  getRoom(): Room | undefined {
    return this.room
  }

  /**
   * 获取房间ID
   */
  getRoomId(): string {
    return this.roomId
  }

  /**
   * 设置游戏阶段
   */
  setPhase(phase: GamePhase): void {
    this.phase = phase
    this.lastActivityAt = new Date()

    if (phase === 'playing') {
      this._isContinuing = true
    }
  }

  /**
   * 获取游戏阶段
   */
  getPhase(): GamePhase {
    return this.phase
  }

  /**
   * 更新当前回合信息
   */
  updateCurrentRound(roundInfo: RoundInfo): void {
    this.currentRound = roundInfo
    this.lastActivityAt = new Date()
  }

  /**
   * 创建回合信息
   */
  createRoundInfo(
    dealerId: string,
    currentPlayerId: string,
    nextPlayerId: string,
    direction: PlayDirection,
    currentSuit?: string,
    minimumCard?: Card
  ): RoundInfo {
    return {
      roundNumber: this.roundCount + 1,
      dealerId,
      currentPlayerId,
      nextPlayerId,
      direction,
      currentSuit,
      minimumCard,
      timestamp: Date.now()
    }
  }

  /**
   * 开始新回合
   */
  startRound(
    dealerId: string,
    currentPlayerId: string,
    nextPlayerId: string,
    direction: PlayDirection = 'clockwise'
  ): void {
    this.dealerId = dealerId
    this.roundCount++
    this.currentRound = this.createRoundInfo(
      dealerId,
      currentPlayerId,
      nextPlayerId,
      direction
    )
    this.direction = direction
    this.playsPerRound.clear()

    this.setPhase('playing')
  }

  /**
   * 结束当前回合
   */
  endRound(): void {
    if (!this.currentRound) return

    // 保存回合记录
    this.rounds.push({
      roundNumber: this.currentRound.roundNumber,
      dealerId: this.currentRound.dealerId,
      playCount: this.plays.length,
      totalDuration: Date.now() - this.currentRound.timestamp,
    })

    // 检查是否所有玩家都弃牌
    if (this.isAllPlayersPassed()) {
      this.setPhase('round_end')
    } else if (this.roundCount >= (this.settings.maxRounds ?? 4)) {
      this.setPhase('game_end')
    }
  }

  /**
   * 获取回合信息
   */
  getCurrentRound(): RoundInfo | null {
    return this.currentRound
  }

  /**
   * 获取所有回合记录
   */
  getRounds(): RoundRecord[] {
    return [...this.rounds]
  }

  /**
   * 添加出牌记录
   */
  addPlay(playInfo: PlayerPlayInfo): void {
    this.plays.push(playInfo)
    this.lastActivityAt = new Date()

    // 记录该玩家本回合出牌次数
    const playerId = playInfo.playerId
    this.playsPerRound.set(playerId, (this.playsPerRound.get(playerId) || 0) + 1)
  }

  /**
   * 获取出牌记录
   */
  getPlays(): PlayerPlayInfo[] {
    return [...this.plays]
  }

  /**
   * 获取玩家出牌记录
   */
  getPlayerPlays(playerId: string): PlayerPlayInfo[] {
    return this.plays.filter(play => play.playerId === playerId)
  }

  /**
   * 设置玩家准备状态
   */
  setPlayerReady(playerId: string, isReady: boolean): void {
    this.playerReadyStates.set(playerId, isReady)
    this.lastActivityAt = new Date()
  }

  /**
   * 获取玩家准备状态
   */
  getPlayerReady(playerId: string): boolean {
    return this.playerReadyStates.get(playerId) || false
  }

  /**
   * 检查所有玩家是否都准备
   */
  areAllPlayersReady(): boolean {
    if (!this.room) return false
    const players = this.room.getActivePlayers()
    return players.every(p => this.playerReadyStates.get(p.userId) || false)
  }

  /**
   * 设置玩家索引
   */
  setCurrentPlayerIndex(index: number): void {
    this.currentPlayerIndex = index
    this.lastActivityAt = new Date()
  }

  /**
   * 获取当前玩家索引
   */
  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex
  }

  /**
   * 增加玩家索引
   */
  incrementPlayerIndex(): void {
    this.currentPlayerIndex++
    if (this.currentPlayerIndex >= this.turnQueue.length) {
      this.currentPlayerIndex = 0
    }
    this.lastActivityAt = new Date()
  }

  /**
   * 设置回合队列
   */
  setTurnQueue(playerIds: string[]): void {
    this.turnQueue = [...playerIds]
    this.currentPlayerIndex = 0
    this.lastActivityAt = new Date()
  }

  /**
   * 获取回合队列
   */
  getTurnQueue(): string[] {
    return [...this.turnQueue]
  }

  /**
   * 获取当前玩家ID
   */
  getCurrentPlayerId(): string {
    if (this.turnQueue.length === 0) return ''
    return this.turnQueue[this.currentPlayerIndex]
  }

  /**
   * 获取下一个玩家ID
   */
  getNextPlayerId(): string {
    let nextIndex = this.currentPlayerIndex + 1
    if (nextIndex >= this.turnQueue.length) {
      nextIndex = 0
    }
    return this.turnQueue[nextIndex]
  }

  /**
   * 获取庄家ID
   */
  getDealerId(): string {
    return this.dealerId
  }

  /**
   * 设置出牌方向
   */
  setDirection(direction: PlayDirection): void {
    this.direction = direction
    this.lastActivityAt = new Date()
  }

  /**
   * 获取出牌方向
   */
  getDirection(): PlayDirection {
    return this.direction
  }

  /**
   * 检查是否顺时针出牌
   */
  isClockwise(): boolean {
    return this.direction === 'clockwise'
  }

  /**
   * 检查是否逆时针出牌
   */
  isCounterClockwise(): boolean {
    return this.direction === 'counter-clockwise'
  }

  /**
   * 设置总分
   */
  addScore(playerId: string, points: number): void {
    const currentScore = this.scores.get(playerId) || 0
    this.scores.set(playerId, currentScore + points)
    this.lastActivityAt = new Date()
  }

  /**
   * 获取玩家分数
   */
  getScore(playerId: string): number {
    return this.scores.get(playerId) || 0
  }

  /**
   * 获取所有玩家分数
   */
  getAllScores(): Map<string, number> {
    return new Map(this.scores)
  }

  /**
   * 获取最高分玩家
   */
  getHighestScorers(): string[] {
    if (this.scores.size === 0) return []

    const maxScore = Math.max(...this.scores.values())
    return Array.from(this.scores.entries())
      .filter(([_, score]) => score === maxScore)
      .map(([playerId]) => playerId)
  }

  /**
   * 获取最低分玩家
   */
  getLowestScorers(): string[] {
    if (this.scores.size === 0) return []

    const minScore = Math.min(...this.scores.values())
    return Array.from(this.scores.entries())
      .filter(([_, score]) => score === minScore)
      .map(([playerId]) => playerId)
  }

  /**
   * 获取分数统计
   */
  getScoreStats(): ScoreStats {
    const scoresArray = Array.from(this.scores.entries())
    const values = scoresArray.map(([_, score]) => score)

    return {
      totalPlayers: scoresArray.length,
      totalScore: values.reduce((sum, score) => sum + score, 0),
      maxScore: Math.max(...values),
      minScore: Math.min(...values),
      averageScore: values.length > 0 ? values.reduce((sum, score) => sum + score, 0) / values.length : 0,
    }
  }

  /**
   * 检查玩家是否出局
   */
  isPlayerEliminated(playerId: string): boolean {
    if (!this.room) return false
    const player = this.room.getPlayer(playerId)
    return player?.isEliminated || false
  }

  /**
   * 检查是否所有玩家都弃牌
   */
  isAllPlayersPassed(): boolean {
    if (!this.room) return false
    const players = this.room.getActivePlayers()
    return players.every(p => {
      const playInfo = this.getPlayerPlayInfo(p.userId)
      return playInfo?.isPassed || false
    })
  }

  /**
   * 获取玩家本回合出牌次数
   */
  getPlayerPlaysPerRound(playerId: string): number {
    return this.playsPerRound.get(playerId) || 0
  }

  /**
   * 获取所有玩家出牌次数
   */
  getAllPlaysPerRound(): Map<string, number> {
    return new Map(this.playsPerRound)
  }

  /**
   * 检查是否允许出牌
   */
  canPlayerPlay(playerId: string): boolean {
    const currentPlayerId = this.getCurrentPlayerId()
    return playerId === currentPlayerId && !this.isPlayerEliminated(playerId)
  }

  /**
   * 检查玩家是否可以跳过回合
   */
  canPlayerPass(playerId: string): boolean {
    return (this.settings.allowPass ?? true) && !this.isPlayerEliminated(playerId)
  }

  /**
   * 设置是否继续游戏
   */
  setContinuing(isContinuing: boolean): void {
    this._isContinuing = isContinuing
  }

  /**
   * 检查是否继续游戏
   */
  isContinuing(): boolean {
    return this._isContinuing
  }

  /**
   * 获取出牌次数最多的玩家
   */
  getMostPlayedPlayer(): string | null {
    if (this.playsPerRound.size === 0) return null

    let maxPlays = 0
    let playerId = null

    this.playsPerRound.forEach((plays, id) => {
      if (plays > maxPlays) {
        maxPlays = plays
        playerId = id
      }
    })

    return playerId
  }

  /**
   * 获取玩家出牌记录
   */
  getPlayerPlayInfo(playerId: string): PlayerPlayInfo | null {
    return this.plays.find(play => play.playerId === playerId) || null
  }

  /**
   * 检查玩家是否出过牌
   */
  hasPlayerPlayed(playerId: string): boolean {
    return this.plays.some(play => play.playerId === playerId)
  }

  /**
   * 获取游戏设置
   */
  getSettings(): GameSettings {
    return { ...this.settings }
  }

  /**
   * 更新游戏设置
   */
  updateSettings(settings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...settings }
    this.lastActivityAt = new Date()
  }

  /**
   * 获取游戏开始时间
   */
  getStartedAt(): Date {
    return new Date(this.startedAt)
  }

  /**
   * 获取最后活动时间
   */
  getLastActivityAt(): Date {
    return new Date(this.lastActivityAt)
  }

  /**
   * 获取总游戏时长
   */
  getTotalDuration(): number {
    return this.totalDuration
  }

  /**
   * 更新总游戏时长
   */
  updateDuration(): void {
    this.totalDuration = Date.now() - this.startedAt.getTime()
  }

  /**
   * 获取当前回合出牌次数
   */
  getCurrentRoundPlayCount(): number {
    return this.plays.length
  }

  /**
   * 检查玩家是否是当前玩家
   */
  isCurrentPlayer(playerId: string): boolean {
    const currentPlayerId = this.getCurrentPlayerId()
    return playerId === currentPlayerId
  }

  /**
   * 检查玩家是否是庄家
   */
  isDealer(playerId: string): boolean {
    return this.dealerId === playerId
  }

  /**
   * 获取玩家出牌总数
   */
  getPlayerTotalPlays(playerId: string): number {
    return this.getPlayerPlays(playerId).length
  }

  /**
   * 获取回合记录
   */
  getRoundByNumber(roundNumber: number): RoundRecord | null {
    return this.rounds.find(r => r.roundNumber === roundNumber) || null
  }

  /**
   * 添加回合记录
   */
  addRoundRecord(record: RoundRecord): void {
    this.rounds.push(record)
  }

  /**
   * 获取回合记录数量
   */
  getRoundCount(): number {
    return this.rounds.length
  }

  /**
   * 获取出牌记录数量
   */
  getPlayCount(): number {
    return this.plays.length
  }

  /**
   * 获取游戏会话快照（用于持久化）
   */
  toSnapshot(): GameSessionSnapshot {
    return {
      id: this.id,
      roomId: this.roomId,
      createdBy: this.createdBy,
      phase: this.phase,
      currentRound: this.currentRound,
      rounds: this.rounds,
      plays: this.plays,
      scores: Array.from(this.scores.entries()),
      startedAt: this.startedAt,
      lastActivityAt: this.lastActivityAt,
      totalDuration: this.totalDuration,
      roundCount: this.roundCount,
      settings: this.settings,
      turnQueue: this.turnQueue,
      dealerId: this.dealerId,
      currentPlayerIndex: this.currentPlayerIndex,
      direction: this.direction,
      isContinuing: this._isContinuing,
      playerReadyStates: Array.from(this.playerReadyStates.entries()),
      playsPerRound: Array.from(this.playsPerRound.entries()),
    }
  }

  /**
   * 从快照恢复游戏会话
   */
  static fromSnapshot(snapshot: GameSessionSnapshot): GameSession {
    const session = new GameSession(
      snapshot.id,
      snapshot.roomId,
      snapshot.createdBy,
      snapshot.settings
    )

    session.phase = snapshot.phase
    session.currentRound = snapshot.currentRound
    session.rounds = [...snapshot.rounds]
    session.plays = [...snapshot.plays]
    session.scores = new Map(snapshot.scores)
    session.startedAt = snapshot.startedAt
    session.lastActivityAt = snapshot.lastActivityAt
    session.totalDuration = snapshot.totalDuration
    session.roundCount = snapshot.roundCount
    session.turnQueue = [...snapshot.turnQueue]
    session.dealerId = snapshot.dealerId
    session.currentPlayerIndex = snapshot.currentPlayerIndex
    session.direction = snapshot.direction
    session._isContinuing = snapshot.isContinuing
    session.playerReadyStates = new Map(snapshot.playerReadyStates)
    session.playsPerRound = new Map(snapshot.playsPerRound)

    return session
  }

  /**
   * 检查游戏是否需要开始
   */
  needsStart(): boolean {
    return this.phase === 'setup' && this.areAllPlayersReady()
  }

  /**
   * 检查游戏是否可以结束
   */
  canEnd(): boolean {
    return this.phase === 'playing'
  }

  /**
   * 检查是否是新的一轮（玩家出牌次数都归零）
   */
  isNewRound(): boolean {
    return this.playsPerRound.size === 0
  }

  /**
   * 重置玩家准备状态
   */
  resetPlayerReadyStates(): void {
    this.playerReadyStates.clear()
  }

  /**
   * 获取存活玩家数量
   */
  getActivePlayerCount(): number {
    if (!this.room) return 0
    return this.room.getActivePlayers().length
  }

  /**
   * 获取弃牌玩家ID列表
   */
  getPassedPlayerIds(): string[] {
    return this.plays
      .filter(play => play.isPassed)
      .map(play => play.playerId)
  }

  /**
   * 获取出牌玩家ID列表
   */
  getPlayedPlayerIds(): string[] {
    return this.plays
      .filter(play => !play.isPassed)
      .map(play => play.playerId)
  }

  /**
   * 检查是否有玩家弃牌
   */
  hasPlayerPassed(playerId: string): boolean {
    return this.getPlayerPlayInfo(playerId)?.isPassed || false
  }

  /**
   * 检查是否有玩家弃牌
   */
  hasAnyPlayerPassed(): boolean {
    return this.plays.some(play => play.isPassed)
  }
}

/**
 * 游戏设置
 */
export interface GameSettings {
  maxRounds?: number
  allowPass?: boolean
  allowHint?: boolean
  allowUndo?: boolean
}

/**
 * 回合记录
 */
export interface RoundRecord {
  roundNumber: number
  dealerId: string
  playCount: number
  totalDuration: number
}

/**
 * 得分统计
 */
export interface ScoreStats {
  totalPlayers: number
  totalScore: number
  maxScore: number
  minScore: number
  averageScore: number
}

/**
 * 游戏会话快照接口（用于序列化）
 */
export interface GameSessionSnapshot {
  id: string
  roomId: string
  createdBy: string
  phase: GamePhase
  currentRound: RoundInfo | null
  rounds: RoundRecord[]
  plays: PlayerPlayInfo[]
  scores: [string, number][]
  startedAt: Date
  lastActivityAt: Date
  totalDuration: number
  roundCount: number
  settings: GameSettings
  turnQueue: string[]
  dealerId: string
  currentPlayerIndex: number
  direction: PlayDirection
  isContinuing: boolean
  playerReadyStates: [string, boolean][]
  playsPerRound: [string, number][]
}
