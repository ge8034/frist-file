import { supabase } from '../client'
import type { DatabaseGameRoom, GameRoomWithPlayers } from '../../../types/database'

/**
 * 房间仓储
 * 负责所有房间相关数据的数据库操作
 */
export class RoomRepository {
  /**
   * 创建房间
   */
  static async createRoom(
    roomName: string,
    createdBy: string,
    maxPlayers: number = 4,
    password?: string
  ): Promise<DatabaseGameRoom> {
    const { data, error } = await supabase
      .from('game_rooms')
      .insert({
        name: roomName,
        max_players: maxPlayers,
        password: password || null,
        current_players: 0,
        status: 'waiting',
        current_level: 2,
        round: 1,
        created_by: createdBy,
      })
      .select()
      .single()

    if (error) throw new Error(`创建房间失败: ${error.message}`)
    return data
  }

  /**
   * 获取所有等待中的房间
   */
  static async getWaitingRooms(): Promise<DatabaseGameRoom[]> {
    const { data, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`获取房间列表失败: ${error.message}`)
    return data || []
  }

  /**
   * 获取房间详情（包含玩家列表）
   */
  static async getRoomWithPlayers(roomId: string): Promise<GameRoomWithPlayers> {
    const { data, error } = await supabase
      .from('game_rooms')
      .select(`
        *,
        players:room_players(*)
      `)
      .eq('id', roomId)
      .single()

    if (error || !data) throw new Error(`房间不存在: ${error?.message || '房间不存在'}`)

    // 计算观战者数量
    const spectatorCount = data.players.filter((p: any) => p.left_at !== null).length

    return {
      ...data,
      players: data.players,
      spectator_count: spectatorCount,
    }
  }

  /**
   * 更新房间状态
   */
  static async updateRoomStatus(
    roomId: string,
    status: 'waiting' | 'playing' | 'finished'
  ): Promise<DatabaseGameRoom> {
    const { data, error } = await supabase
      .from('game_rooms')
      .update({ status })
      .eq('id', roomId)
      .select()
      .single()

    if (error) throw new Error(`更新房间状态失败: ${error.message}`)
    return data
  }

  /**
   * 更新玩家数量
   */
  static async updatePlayerCount(
    roomId: string,
    newCount: number
  ): Promise<DatabaseGameRoom> {
    const { data, error } = await supabase
      .from('game_rooms')
      .update({ current_players: newCount })
      .eq('id', roomId)
      .select()
      .single()

    if (error) throw new Error(`更新玩家数量失败: ${error.message}`)
    return data
  }

  /**
   * 删除房间（只有创建者可以删除）
   */
  static async deleteRoom(roomId: string, createdBy: string): Promise<void> {
    const room = await this.getRoomWithPlayers(roomId)

    if (room.created_by !== createdBy) {
      throw new Error('只有房间创建者可以删除房间')
    }

    const { error } = await supabase
      .from('game_rooms')
      .delete()
      .eq('id', roomId)

    if (error) throw new Error(`删除房间失败: ${error.message}`)
  }
}
