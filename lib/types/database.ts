/**
 * Supabase 数据库类型定义
 * 游客模式：不需要 users 表
 */

// 游戏房间表
export interface DatabaseGameRoom {
  id: string
  name: string
  password: string | null
  max_players: number
  current_players: number
  status: 'waiting' | 'playing' | 'finished'
  current_level: number
  round: number
  dealer_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// 房间玩家关联表（游客模式）
// 注意：position 用于标识玩家位置，spectator 用于标识观战者
export interface DatabaseRoomPlayer {
  id: string
  room_id: string
  user_id: string
  position: string | null // 玩家位置，如 'south', 'north', 'west', 'east'
  is_ready: boolean
  is_dealer: boolean
  score: number
  cards: any
  joined_at: string
  left_at: string | null
}

// 游戏记录表
export interface DatabaseGameRecord {
  id: string
  room_id: string
  player_count: number
  winner_ids: any
  scores: any
  player_data: any
  game_data: any
  started_at: string
  ended_at: string | null
  duration: number | null
}

// 房间玩家关联查询结果
export interface RoomPlayerWithInfo extends DatabaseRoomPlayer {
  // 游客模式下不需要用户信息，避免跨表查询
}

// 房间查询结果（包含玩家和观战者）
export interface GameRoomWithPlayers extends DatabaseGameRoom {
  players: RoomPlayerWithInfo[]
  spectator_count: number
}

// 观战者信息
export interface Spectator {
  userId: string
  nickname: string
  joinedAt: string
}

// 观战者列表（客户端临时存储）
export interface SpectatorList {
  [userId: string]: Spectator
}
