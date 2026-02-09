import { supabase } from '../client'
import type { DatabaseRoomPlayer, DatabaseGameRecord } from '../../../types/database'
import { RoomRepository } from './RoomRepository'

/**
 * 会话仓储
 * 负责玩家加入/离开房间、游戏记录等操作
 */
export class SessionRepository {
  /**
   * 玩家加入房间
   */
  static async joinRoom(
    roomId: string,
    userId: string,
    position: string | null,
    password?: string
  ): Promise<DatabaseRoomPlayer> {
    // 检查房间是否存在
    const room = await RoomRepository.getRoomWithPlayers(roomId)

    // 检查密码
    if (room.password && room.password !== password) {
      throw new Error('房间密码错误')
    }

    // 检查房间是否已满（只有玩家不能超过 max_players）
    const currentPlayers = room.players.filter(p => p.left_at === null).length
    if (currentPlayers >= room.max_players) {
      throw new Error('房间已满')
    }

    // 添加玩家到房间
    const { data, error } = await supabase
      .from('room_players')
      .insert({
        room_id: roomId,
        user_id: userId,
        position,
        is_ready: false,
        is_dealer: false,
        score: 0,
        cards: null,
        left_at: null, // 清除观战状态
      })
      .select()
      .single()

    if (error) throw new Error(`加入房间失败: ${error.message}`)

    // 更新房间玩家数量
    await RoomRepository.updatePlayerCount(roomId, room.current_players + 1)

    return data
  }

  /**
   * 观战者加入房间
   */
  static async joinAsSpectator(
    roomId: string,
    userId: string,
    password?: string
  ): Promise<DatabaseRoomPlayer> {
    // 检查房间是否存在
    const room = await RoomRepository.getRoomWithPlayers(roomId)

    // 检查房间状态（只有进行中的游戏可以观战）
    if (room.status !== 'playing') {
      throw new Error('只有游戏进行中才允许观战')
    }

    // 检查密码
    if (room.password && room.password !== password) {
      throw new Error('房间密码错误')
    }

    // 检查是否已是玩家
    const existingPlayer = room.players.find(p => p.user_id === userId && p.left_at === null)
    if (existingPlayer) {
      throw new Error('您已经是房间成员，不能作为观战者加入')
    }

    // 添加观战者
    const { data, error } = await supabase
      .from('room_players')
      .insert({
        room_id: roomId,
        user_id: userId,
        position: null,
        is_ready: false,
        is_dealer: false,
        score: 0,
        cards: null,
        left_at: new Date().toISOString(), // 设置为观战状态
      })
      .select()
      .single()

    if (error) throw new Error(`加入观战失败: ${error.message}`)

    return data
  }

  /**
   * 玩家加入观战
   */
  static async startSpectating(
    roomId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('room_players')
      .update({
        left_at: new Date().toISOString(), // 标记为观战状态
      })
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (error) throw new Error(`加入观战失败: ${error.message}`)
  }

  /**
   * 玩家离开观战（重新成为玩家）
   */
  static async stopSpectating(
    roomId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('room_players')
      .update({
        left_at: null, // 清除观战状态
      })
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (error) throw new Error(`退出观战失败: ${error.message}`)
  }

  /**
   * 获取房间所有玩家（包括观战者）
   */
  static async getRoomPlayers(roomId: string): Promise<DatabaseRoomPlayer[]> {
    const { data, error } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at')

    if (error) throw new Error(`获取房间玩家失败: ${error.message}`)
    return data || []
  }

  /**
   * 玩家离开房间
   */
  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    // 删除玩家记录
    const { error: deleteError } = await supabase
      .from('room_players')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (deleteError) throw new Error(`离开房间失败: ${deleteError.message}`)

    // 更新房间玩家数量
    const room = await RoomRepository.getRoomWithPlayers(roomId)
    await RoomRepository.updatePlayerCount(roomId, room.current_players - 1)
  }

  /**
   * 更新玩家准备状态
   */
  static async updateReadyStatus(
    roomId: string,
    userId: string,
    isReady: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('room_players')
      .update({ is_ready: isReady })
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (error) throw new Error(`更新准备状态失败: ${error.message}`)
  }

  /**
   * 设置庄家
   */
  static async setDealer(roomId: string, userId: string): Promise<void> {
    // 清除所有玩家的庄家状态
    await supabase
      .from('room_players')
      .update({ is_dealer: false })
      .eq('room_id', roomId)

    // 设置新的庄家
    const { error } = await supabase
      .from('room_players')
      .update({ is_dealer: true })
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (error) throw new Error(`设置庄家失败: ${error.message}`)
  }

  /**
   * 保存玩家手牌（用于游戏进行中）
   */
  static async savePlayerCards(
    roomId: string,
    userId: string,
    cards: any[]
  ): Promise<void> {
    const { error } = await supabase
      .from('room_players')
      .update({ cards })
      .eq('room_id', roomId)
      .eq('user_id', userId)

    if (error) throw new Error(`保存手牌失败: ${error.message}`)
  }

  /**
   * 记录游戏开始
   */
  static async recordGameStart(
    roomId: string,
    playerCount: number
  ): Promise<DatabaseGameRecord> {
    const { data, error } = await supabase
      .from('game_records')
      .insert({
        room_id: roomId,
        player_count: playerCount,
        winner_ids: null,
        scores: null,
        player_data: null,
        game_data: null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`记录游戏开始失败: ${error.message}`)

    // 更新房间状态
    await RoomRepository.updateRoomStatus(roomId, 'playing')

    return data
  }

  /**
   * 记录游戏结束
   */
  static async recordGameEnd(
    recordId: string,
    winnerIds: string[],
    scores: Record<string, number>,
    playerData: any,
    gameData: any
  ): Promise<void> {
    const { error } = await supabase
      .from('game_records')
      .update({
        winner_ids: winnerIds,
        scores,
        player_data: playerData,
        game_data: gameData,
        ended_at: new Date().toISOString(),
      })
      .eq('id', recordId)

    if (error) throw new Error(`记录游戏结束失败: ${error.message}`)
  }
}
