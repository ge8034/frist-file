import { getCurrentGuestUserId } from '../../../infrastructure/supabase/client'
import { RoomRepository, SessionRepository } from '../../../infrastructure/supabase/repositories'
import { AIService } from '../../../infrastructure/supabase/repositories/AIService'
import type { DatabaseRoomPlayer } from '../../../types/database'
import { supabase } from '../../../infrastructure/supabase/client'

/**
 * 游戏房间服务
 * 游客模式：无需登录，使用随机游客ID
 * 强制4人模式，AI 自动补位
 */
export class GameRoomService {
  private static instance: GameRoomService
  private currentRoomId: string | null = null
  private static readonly MAX_PLAYERS = 4

  static getInstance(): GameRoomService {
    if (!GameRoomService.instance) {
      GameRoomService.instance = new GameRoomService()
    }
    return GameRoomService.instance
  }

  /**
   * 确保4人满员（AI 自动补位）
   */
  private async ensureFourPlayers(roomId: string): Promise<void> {
    const room = await RoomRepository.getRoomWithPlayers(roomId)
    const humanPlayers = room.players.filter((p: DatabaseRoomPlayer) => !p.user_id.startsWith('ai_')).length
    const aiPlayersNeeded = GameRoomService.MAX_PLAYERS - humanPlayers

    for (let i = 0; i < aiPlayersNeeded; i++) {
      const aiPlayer = AIService.createAIPlayer()

      // 添加 AI 玩家到房间
      const { data, error } = await supabase
        .from('room_players')
        .insert({
          room_id: roomId,
          user_id: aiPlayer.userId,
          position: null,
          is_ready: true, // AI 自动就绪
          is_dealer: false,
          score: 0,
          cards: null,
          left_at: null,
        })
        .select()
        .single()

      if (error) {
        console.error('添加 AI 玩家失败:', error.message)
        continue
      }

      // 更新房间玩家数量
      await RoomRepository.updatePlayerCount(roomId, room.current_players + 1)
    }
  }

  /**
   * 创建房间（强制4人模式，当前玩家自动加入）
   * @param roomName 房间名称
   * @param password 可选密码
   */
  async createRoom(
    roomName: string,
    password?: string
  ): Promise<string> {
    // 创建房间（固定4人模式）
    const currentUserId = getCurrentGuestUserId()
    const room = await RoomRepository.createRoom(
      roomName,
      currentUserId,
      GameRoomService.MAX_PLAYERS,
      password
    )

    // 当前玩家自动加入
    await SessionRepository.joinRoom(room.id, currentUserId, null, password)

    // 检查是否需要 AI 补位
    await this.ensureFourPlayers(room.id)

    this.currentRoomId = room.id
    return room.id
  }

  /**
   * 玩家准备/取消准备
   */
  async setReady(isReady: boolean): Promise<void> {
    if (!this.currentRoomId) return

    const userId = getCurrentGuestUserId()
    await SessionRepository.updateReadyStatus(this.currentRoomId, userId, isReady)
  }

  /**
   * 加入房间
   * 玩家加入后自动补位至4人
   */
  async joinRoom(
    roomId: string,
    password?: string
  ): Promise<void> {
    const userId = getCurrentGuestUserId()
    await SessionRepository.joinRoom(roomId, userId, null, password)

    // 确保仍然满员
    await this.ensureFourPlayers(roomId)

    this.currentRoomId = roomId
  }

  /**
   * 加入观战（游戏进行中）
   */
  async joinAsSpectator(
    roomId: string,
    password?: string
  ): Promise<void> {
    const userId = getCurrentGuestUserId()
    await SessionRepository.joinAsSpectator(roomId, userId, password)
    this.currentRoomId = roomId
  }

  /**
   * 玩家加入观战
   */
  async startSpectating(): Promise<void> {
    if (!this.currentRoomId) return

    const userId = getCurrentGuestUserId()
    await SessionRepository.startSpectating(this.currentRoomId, userId)
  }

  /**
   * 玩家退出观战
   */
  async stopSpectating(): Promise<void> {
    if (!this.currentRoomId) return

    const userId = getCurrentGuestUserId()
    await SessionRepository.stopSpectating(this.currentRoomId, userId)
  }

  /**
   * 离开房间
   */
  async leaveRoom(): Promise<void> {
    if (!this.currentRoomId) return

    const userId = getCurrentGuestUserId()
    await SessionRepository.leaveRoom(this.currentRoomId, userId)
    this.currentRoomId = null
  }

  /**
   * 获取房间信息（包含玩家列表）
   */
  async getRoomInfo(roomId: string) {
    return RoomRepository.getRoomWithPlayers(roomId)
  }

  /**
   * 获取所有等待中的房间
   */
  async getWaitingRooms() {
    return RoomRepository.getWaitingRooms()
  }

  /**
   * 开始游戏
   */
  async startGame(): Promise<void> {
    if (!this.currentRoomId) throw new Error('未加入任何房间')

    const room = await RoomRepository.getRoomWithPlayers(this.currentRoomId)
    const players = room.players.filter((p: DatabaseRoomPlayer) => p.left_at === null)

    if (players.length < 1) {
      throw new Error('至少需要1名玩家才能开始游戏')
    }

    // 保存游戏记录
    await SessionRepository.recordGameStart(this.currentRoomId, players.length)
  }

  /**
   * 获取当前房间ID
   */
  getCurrentRoomId(): string | null {
    return this.currentRoomId
  }
}
