/**
 * 游戏房间实体
 *
 * 掼蛋游戏房间实体
 * - 管理房间基本信息和状态
 * - 管理玩家列表和游戏进程
 * - 管理游戏配置和规则
 */

import { Player, type PlayerPosition } from './Player'
import type { PlayerType } from '../../types/game'

// Card 类型暂时不导入，避免循环依赖

/**
 * 游戏房间状态
 */
export type RoomState = 'waiting' | 'bidding' | 'playing' | 'finished' | 'paused'

/**
 * 房间类型
 */
export type RoomType = 'public' | 'private'

/**
 * 等级配置
 */
export interface LevelConfig {
  level: number
  points: number
  maxPlayers: number
}

/**
 * 房间配置
 */
export interface RoomConfig {
  gameMode: 'standard' | 'casual' | 'ranked' | 'tournament'
}

/**
 * 玩家加入信息
 */
export interface PlayerJoinInfo {
  userId: string
  nickname: string
  type: PlayerType
}

/**
 * 庄家信息
 */
export interface DealerInfo {
  userId: string
  position: string | null
  level: number
  round: number
}

/**
 * 游戏房间实体
 *
 * 领域驱动设计原则：
 * - 有唯一标识（UUID）
 * - 封装房间相关业务逻辑
 * - 管理玩家列表和游戏状态
 */
export class GameRoom {
  /**
   * 房间唯一标识
   */
  readonly id: string

  /**
   * 房间名称
   */
  name: string

  /**
   * 房间密码（私密房间）
   */
  password: string | null

  /**
   * 房间类型
   */
  readonly type: RoomType

  /**
   * 创建者ID
   */
  createdBy: string

  /**
   * 当前游戏状态
   */
  state: RoomState

  /**
   * 最大玩家数（掼蛋固定4人）
   */
  maxPlayers: number

  /**
   * 当前玩家数
   */
  currentPlayers: number

  /**
   * 当前等级
   */
  currentLevel: number

  /**
   * 当前回合数（1-4回合）
   */
  round: number

  /**
   * 当前玩家列表
   */
  players: Map<string, Player>

  /**
   * 房间配置
   */
  config: RoomConfig

  /**
   * 游戏开始时间
   */
  startedAt: Date | null

  /**
   * 游戏结束时间
   */
  endedAt: Date | null

  /**
   * 创建时间
   */
  createdAt: Date

  /**
   * 最后更新时间
   */
  updatedAt: Date

  /**
   * 房间描述
   */
  description: string

  /**
   * 状态描述
   */
  stateDescription: string

  /**
   * 庄家信息
   */
  dealerInfo: DealerInfo | null

  /**
   * 是否允许观战
   */
  allowSpectating: boolean

  /**
   * 活跃玩家计数器
   */
  private activePlayerCount: number

  /**
   * 游戏记录ID
   */
  private gameRecordId: string | null

  /**
   * 创建游戏房间
   */
  constructor(
    id: string,
    name: string,
    createdBy: string,
    type: RoomType = 'public',
    password: string | null = null,
    description: string = ''
  ) {
    this.id = id
    this.name = name
    this.password = password
    this.type = type
    this.createdBy = createdBy
    this.state = 'waiting'
    this.maxPlayers = 4
    this.currentPlayers = 0
    this.currentLevel = 2
    this.round = 1
    this.players = new Map()
    this.config = { gameMode: 'standard' }
    this.startedAt = null
    this.endedAt = null
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.description = description
    this.stateDescription = '等待玩家加入'
    this.dealerInfo = null
    this.allowSpectating = true
    this.activePlayerCount = 0
    this.gameRecordId = null
  }

  /**
   * 添加玩家到房间
   */
  addPlayer(player: Player): void {
    if (this.state !== 'waiting') {
      throw new Error('房间已开始游戏，不能添加玩家')
    }

    if (this.currentPlayers >= this.maxPlayers) {
      throw new Error('房间已满')
    }

    if (this.players.has(player.userId)) {
      throw new Error('玩家已存在')
    }

    this.players.set(player.userId, player)
    this.currentPlayers++
    this.activePlayerCount++
    this.updatedAt = new Date()
  }

  /**
   * 移除玩家
   */
  removePlayer(userId: string): Player | null {
    const player = this.players.get(userId)
    if (player) {
      this.players.delete(userId)
      this.currentPlayers--
      this.updatedAt = new Date()
      return player
    }
    return null
  }

  /**
   * 获取玩家
   */
  getPlayer(userId: string): Player | undefined {
    return this.players.get(userId)
  }

  /**
   * 获取所有玩家ID
   */
  getPlayerIds(): string[] {
    return Array.from(this.players.keys())
  }

  /**
   * 获取玩家数量
   */
  getPlayerCount(): number {
    return this.players.size
  }

  /**
   * 检查玩家是否在房间中
   */
  hasPlayer(userId: string): boolean {
    return this.players.has(userId)
  }

  /**
   * 设置房间状态
   */
  setState(state: RoomState, description?: string): void {
    if (state === 'playing' && this.state === 'waiting') {
      this.startedAt = new Date()
    }

    if (state === 'finished' || state === 'paused') {
      this.endedAt = new Date()
    }

    this.state = state
    this.stateDescription = description || this.getStateDescription(state)
    this.updatedAt = new Date()
  }

  /**
   * 获取房间状态描述
   */
  private getStateDescription(state: RoomState): string {
    switch (state) {
      case 'waiting':
        return `等待玩家加入 (${this.currentPlayers}/${this.maxPlayers})`
      case 'bidding':
        return '叫牌阶段'
      case 'playing':
        return '游戏进行中'
      case 'finished':
        return '游戏结束'
      case 'paused':
        return '游戏暂停'
      default:
        return '未知状态'
    }
  }

  /**
   * 更新等级
   */
  setLevel(level: number): void {
    this.currentLevel = level
    this.updatedAt = new Date()
  }

  /**
   * 更新回合
   */
  setRound(round: number): void {
    if (round < 1 || round > 4) {
      throw new Error('回合数必须在1-4之间')
    }
    this.round = round
    this.updatedAt = new Date()
  }

  /**
   * 设置庄家
   */
  setDealer(userId: string, position: string | null, level: number, round: number): void {
    this.dealerInfo = {
      userId,
      position,
      level,
      round
    }
    this.updatedAt = new Date()
  }

  /**
   * 获取庄家信息
   */
  getDealerInfo(): DealerInfo | null {
    return this.dealerInfo
  }

  /**
   * 开始游戏
   */
  startGame(): void {
    if (this.state !== 'waiting') {
      throw new Error('房间不在等待状态，不能开始游戏')
    }

    if (this.currentPlayers < 1) {
      throw new Error('没有玩家加入')
    }

    this.setState('playing')
    this.activePlayerCount = this.currentPlayers
  }

  /**
   * 结束游戏
   */
  finishGame(): void {
    if (this.state !== 'playing') {
      throw new Error('房间不在游戏状态，不能结束游戏')
    }

    this.setState('finished', '游戏结束')
  }

  /**
   * 暂停游戏
   */
  pauseGame(): void {
    if (this.state !== 'playing') {
      throw new Error('房间不在游戏状态，不能暂停')
    }

    this.setState('paused', '游戏暂停')
  }

  /**
   * 恢复游戏
   */
  resumeGame(): void {
    if (this.state !== 'paused') {
      throw new Error('房间不在暂停状态，不能恢复')
    }

    this.setState('playing')
  }

  /**
   * 更新活跃玩家计数
   */
  updateActivePlayerCount(count: number): void {
    this.activePlayerCount = count
  }

  /**
   * 获取活跃玩家数量
   */
  getActivePlayerCount(): number {
    return this.activePlayerCount
  }

  /**
   * 检查是否可以开始游戏
   */
  canStartGame(): boolean {
    return (
      this.state === 'waiting' &&
      this.currentPlayers >= 1 &&
      this.currentPlayers <= this.maxPlayers
    )
  }

  /**
   * 检查房间是否已满
   */
  isFull(): boolean {
    return this.currentPlayers >= this.maxPlayers
  }

  /**
   * 检查玩家是否是创建者
   */
  isCreator(userId: string): boolean {
    return this.createdBy === userId
  }

  /**
   * 检查房间是否是私有的
   */
  isPrivate(): boolean {
    return this.type === 'private'
  }

  /**
   * 设置允许观战
   */
  setAllowSpectating(allow: boolean): void {
    this.allowSpectating = allow
    this.updatedAt = new Date()
  }

  /**
   * 是否允许观战
   */
  canSpectate(): boolean {
    return this.allowSpectating
  }

  /**
   * 检查玩家是否是庄家
   */
  isDealer(userId: string): boolean {
    return this.dealerInfo?.userId === userId
  }

  /**
   * 获取玩家位置
   */
  getPlayerPosition(userId: string): PlayerPosition | null {
    const player = this.players.get(userId)
    return player?.position || null
  }

  /**
   * 设置玩家位置
   */
  setPlayerPosition(userId: string, position: PlayerPosition | null): void {
    const player = this.players.get(userId)
    if (player) {
      player.setPosition(position)
      this.updatedAt = new Date()
    }
  }

  /**
   * 设置游戏记录ID
   */
  setGameRecordId(recordId: string): void {
    this.gameRecordId = recordId
    this.updatedAt = new Date()
  }

  /**
   * 获取游戏记录ID
   */
  getGameRecordId(): string | null {
    return this.gameRecordId
  }

  /**
   * 获取房间统计信息
   */
  getStatistics(): RoomStatistics {
    const playersArray = Array.from(this.players.values())
    const humanPlayers = playersArray.filter(p => p.type === 'human')
    const aiPlayers = playersArray.filter(p => p.type === 'ai')

    return {
      totalPlayers: playersArray.length,
      humanPlayers: humanPlayers.length,
      aiPlayers: aiPlayers.length,
      readyPlayers: playersArray.filter(p => p.isReady).length,
      positions: {
        south: playersArray.filter(p => p.position === 'south').length,
        north: playersArray.filter(p => p.position === 'north').length,
        west: playersArray.filter(p => p.position === 'west').length,
        east: playersArray.filter(p => p.position === 'east').length,
      }
    }
  }

  /**
   * 检查是否有未准备的玩家
   */
  hasUnreadyPlayer(): boolean {
    return Array.from(this.players.values()).some(p => !p.isReady)
  }

  /**
   * 获取所有未准备的玩家ID
   */
  getUnreadyPlayerIds(): string[] {
    return Array.from(this.players.values())
      .filter(p => !p.isReady)
      .map(p => p.userId)
  }

  /**
   * 标记所有玩家为准备状态
   */
  setAllPlayersReady(isReady: boolean): void {
    this.players.forEach(player => player.setReady(isReady))
    this.updatedAt = new Date()
  }

  /**
   * 检查是否所有玩家都已准备
   */
  areAllPlayersReady(): boolean {
    return Array.from(this.players.values()).every(p => p.isReady)
  }

  /**
   * 获取房间快照（用于持久化）
   */
  toSnapshot(): RoomSnapshot {
    return {
      id: this.id,
      name: this.name,
      password: this.password,
      type: this.type,
      createdBy: this.createdBy,
      state: this.state,
      maxPlayers: this.maxPlayers,
      currentPlayers: this.currentPlayers,
      currentLevel: this.currentLevel,
      round: this.round,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      description: this.description,
      stateDescription: this.stateDescription,
      dealerInfo: this.dealerInfo,
      allowSpectating: this.allowSpectating,
      config: this.config,
      gameRecordId: this.gameRecordId,
    }
  }

  /**
   * 从快照恢复房间状态
   */
  static fromSnapshot(snapshot: RoomSnapshot, players: Map<string, Player>): GameRoom {
    const room = new GameRoom(
      snapshot.id,
      snapshot.name,
      snapshot.createdBy,
      snapshot.type,
      snapshot.password,
      snapshot.description
    )

    room.state = snapshot.state
    room.maxPlayers = snapshot.maxPlayers
    room.currentPlayers = snapshot.currentPlayers
    room.currentLevel = snapshot.currentLevel
    room.round = snapshot.round
    room.startedAt = snapshot.startedAt
    room.endedAt = snapshot.endedAt
    room.createdAt = snapshot.createdAt
    room.updatedAt = snapshot.updatedAt
    room.description = snapshot.description
    room.stateDescription = snapshot.stateDescription
    room.dealerInfo = snapshot.dealerInfo
    room.allowSpectating = snapshot.allowSpectating
    room.config = snapshot.config
    room.gameRecordId = snapshot.gameRecordId
    room.players = players

    return room
  }

  /**
   * 添加系统玩家（AI）
   */
  addSystemPlayer(userId: string, nickname: string): Player {
    const aiPlayer = new Player(userId, nickname, 'ai')
    this.addPlayer(aiPlayer)
    return aiPlayer
  }

  /**
   * 移除系统玩家
   */
  removeSystemPlayer(userId: string): Player | null {
    return this.removePlayer(userId)
  }

  /**
   * 获取活跃的玩家列表
   */
  getActivePlayers(): Player[] {
    return Array.from(this.players.values()).filter(p => !p.isEliminated)
  }

  /**
   * 获取等待状态的玩家列表
   */
  getWaitingPlayers(): Player[] {
    return Array.from(this.players.values()).filter(p => p.state === 'waiting')
  }
}

/**
 * 房间统计信息
 */
export interface RoomStatistics {
  totalPlayers: number
  humanPlayers: number
  aiPlayers: number
  readyPlayers: number
  positions: {
    south: number
    north: number
    west: number
    east: number
  }
}

/**
 * 房间快照接口（用于序列化）
 */
export interface RoomSnapshot {
  id: string
  name: string
  password: string | null
  type: RoomType
  createdBy: string
  state: RoomState
  maxPlayers: number
  currentPlayers: number
  currentLevel: number
  round: number
  startedAt: Date | null
  endedAt: Date | null
  createdAt: Date
  updatedAt: Date
  description: string
  stateDescription: string
  dealerInfo: DealerInfo | null
  allowSpectating: boolean
  config: RoomConfig
  gameRecordId: string | null
}
