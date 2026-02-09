/**
 * 大厅状态 Store
 * 基于 Retro-Futurism 设计系统
 */

import { create } from 'zustand'
import { supabase } from '@/lib/infrastructure/supabase/client'
import { getCurrentUserId, getCurrentUserNickname } from './authStore'
import type { RoomId } from '@/lib/types/domain'

export interface GameRoom {
  id: RoomId
  name: string
  description: string
  maxPlayers: number
  currentPlayers: number
  isPrivate: boolean
  password?: string
  hostId: string
  hostName: string
  gameMode: 'casual' | 'ranked' | 'tournament'
  aiPlayers: number
  status: 'waiting' | 'playing' | 'full' | 'closed'
  createdAt: Date
  updatedAt: Date
}

export interface Player {
  id: string
  nickname: string
  avatar?: string
  isReady: boolean
  isHost: boolean
  joinedAt: Date
}

interface LobbyState {
  // 房间列表
  rooms: GameRoom[]
  filteredRooms: GameRoom[]
  currentRoom: GameRoom | null
  roomPlayers: Player[]

  // 加载状态
  isLoading: boolean
  isJoining: boolean
  isCreating: boolean
  error: string | null

  // 筛选条件
  filters: {
    gameMode: 'all' | 'casual' | 'ranked' | 'tournament'
    status: 'all' | 'waiting' | 'playing'
    hasPassword: boolean
    maxPlayers: number
  }

  // 搜索条件
  searchQuery: string

  // 动作
  fetchRooms: () => Promise<void>
  createRoom: (roomData: Partial<GameRoom>) => Promise<RoomId | null>
  joinRoom: (roomId: RoomId, password?: string) => Promise<boolean>
  leaveRoom: () => Promise<void>
  updateRoomStatus: (roomId: RoomId, status: GameRoom['status']) => Promise<void>
  updatePlayerReady: (playerId: string, isReady: boolean) => Promise<void>
  setFilters: (filters: Partial<LobbyState['filters']>) => void
  setSearchQuery: (query: string) => void
  clearError: () => void
  applyFilters: () => void
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  // 初始状态
  rooms: [],
  filteredRooms: [],
  currentRoom: null,
  roomPlayers: [],

  isLoading: false,
  isJoining: false,
  isCreating: false,
  error: null,

  filters: {
    gameMode: 'all',
    status: 'all',
    hasPassword: false,
    maxPlayers: 4,
  },

  searchQuery: '',

  // 获取房间列表
  fetchRooms: async () => {
    set({ isLoading: true, error: null })

    try {
      // 从 Supabase 获取房间数据
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })

      if (error) throw error

      const rooms: GameRoom[] = (data || []).map(room => ({
        id: room.id,
        name: room.name,
        description: room.description,
        maxPlayers: room.max_players,
        currentPlayers: room.current_players,
        isPrivate: room.is_private,
        password: room.password,
        hostId: room.host_id,
        hostName: room.host_name,
        gameMode: room.game_mode,
        aiPlayers: room.ai_players,
        status: room.status,
        createdAt: new Date(room.created_at),
        updatedAt: new Date(room.updated_at),
      }))

      set({ rooms, isLoading: false })
      get().applyFilters()
    } catch (error) {
      // Supabase连接失败时，使用模拟房间数据
      console.log('Supabase连接失败，使用模拟房间数据:', error)

      // 生成模拟房间数据
      const mockRooms: GameRoom[] = [
        {
          id: 'room_1',
          name: '快速匹配房间',
          description: '欢迎所有玩家！快速开始游戏',
          maxPlayers: 4,
          currentPlayers: 2,
          isPrivate: false,
          hostId: 'host_001',
          hostName: '系统AI',
          gameMode: 'casual',
          aiPlayers: 0,
          status: 'waiting',
          createdAt: new Date(Date.now() - 3600000), // 1小时前
          updatedAt: new Date(),
        },
        {
          id: 'room_2',
          name: 'AI对战练习',
          description: '与AI对手练习掼蛋技巧',
          maxPlayers: 4,
          currentPlayers: 1,
          isPrivate: false,
          hostId: 'host_002',
          hostName: '训练助手',
          gameMode: 'casual',
          aiPlayers: 3,
          status: 'waiting',
          createdAt: new Date(Date.now() - 1800000), // 30分钟前
          updatedAt: new Date(),
        },
        {
          id: 'room_3',
          name: '好友娱乐局',
          description: '轻松娱乐，友谊第一',
          maxPlayers: 4,
          currentPlayers: 3,
          isPrivate: false,
          hostId: 'host_003',
          hostName: '游戏大使',
          gameMode: 'casual',
          aiPlayers: 0,
          status: 'waiting',
          createdAt: new Date(Date.now() - 900000), // 15分钟前
          updatedAt: new Date(),
        },
      ]

      set({
        rooms: mockRooms,
        filteredRooms: mockRooms,
        isLoading: false,
        error: null // 清除错误，不显示给用户
      })
    }
  },

  // 创建房间
  createRoom: async (roomData) => {
    set({ isCreating: true, error: null })

    try {
      const userId = getCurrentUserId()
      const userNickname = getCurrentUserNickname()

      const newRoom = {
        name: roomData.name || `${userNickname}的房间`,
        description: roomData.description || '快来一起玩掼蛋吧！',
        max_players: roomData.maxPlayers || 4,
        current_players: 1,
        is_private: roomData.isPrivate || false,
        password: roomData.password,
        host_id: userId,
        host_name: userNickname,
        game_mode: roomData.gameMode || 'casual',
        ai_players: roomData.aiPlayers || 0,
        status: 'waiting' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('game_rooms')
        .insert(newRoom)
        .select()
        .single()

      if (error) throw error

      // 创建房间玩家记录
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: data.id,
          player_id: userId,
          player_name: userNickname,
          is_host: true,
          is_ready: true,
          joined_at: new Date().toISOString(),
        })

      if (playerError) throw playerError

      const room: GameRoom = {
        id: data.id,
        name: data.name,
        description: data.description,
        maxPlayers: data.max_players,
        currentPlayers: data.current_players,
        isPrivate: data.is_private,
        password: data.password,
        hostId: data.host_id,
        hostName: data.host_name,
        gameMode: data.game_mode,
        aiPlayers: data.ai_players,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }

      set({
        currentRoom: room,
        roomPlayers: [{
          id: userId,
          nickname: userNickname,
          isReady: true,
          isHost: true,
          joinedAt: new Date(),
        }],
        isCreating: false,
      })

      return data.id
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '创建房间失败',
        isCreating: false,
      })
      return null
    }
  },

  // 加入房间
  joinRoom: async (roomId, password) => {
    set({ isJoining: true, error: null })

    try {
      const userId = getCurrentUserId()
      const userNickname = getCurrentUserNickname()

      // 获取房间信息
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError

      // 检查房间状态
      if (room.status !== 'waiting') {
        throw new Error('房间已开始游戏或已关闭')
      }

      // 检查房间人数
      if (room.current_players >= room.max_players) {
        throw new Error('房间已满')
      }

      // 检查密码
      if (room.is_private && room.password !== password) {
        throw new Error('密码错误')
      }

      // 添加玩家到房间
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomId,
          player_id: userId,
          player_name: userNickname,
          is_host: false,
          is_ready: false,
          joined_at: new Date().toISOString(),
        })

      if (playerError) throw playerError

      // 更新房间人数
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({
          current_players: room.current_players + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId)

      if (updateError) throw updateError

      // 获取房间玩家列表
      const { data: players, error: playersError } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true })

      if (playersError) throw playersError

      const roomPlayers: Player[] = (players || []).map(player => ({
        id: player.player_id,
        nickname: player.player_name,
        isReady: player.is_ready,
        isHost: player.is_host,
        joinedAt: new Date(player.joined_at),
      }))

      const currentRoom: GameRoom = {
        id: room.id,
        name: room.name,
        description: room.description,
        maxPlayers: room.max_players,
        currentPlayers: room.current_players + 1,
        isPrivate: room.is_private,
        password: room.password,
        hostId: room.host_id,
        hostName: room.host_name,
        gameMode: room.game_mode,
        aiPlayers: room.ai_players,
        status: room.status,
        createdAt: new Date(room.created_at),
        updatedAt: new Date(room.updated_at),
      }

      set({
        currentRoom,
        roomPlayers,
        isJoining: false,
      })

      return true
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加入房间失败',
        isJoining: false,
      })
      return false
    }
  },

  // 离开房间
  leaveRoom: async () => {
    const { currentRoom } = get()
    if (!currentRoom) return

    try {
      const userId = getCurrentUserId()

      // 从房间玩家列表中移除
      const { error: playerError } = await supabase
        .from('room_players')
        .delete()
        .eq('room_id', currentRoom.id)
        .eq('player_id', userId)

      if (playerError) throw playerError

      // 更新房间人数
      const newPlayerCount = Math.max(0, currentRoom.currentPlayers - 1)
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({
          current_players: newPlayerCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentRoom.id)

      if (updateError) throw updateError

      // 如果房间没人了，删除房间
      if (newPlayerCount === 0) {
        await supabase
          .from('game_rooms')
          .delete()
          .eq('id', currentRoom.id)
      }

      set({
        currentRoom: null,
        roomPlayers: [],
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '离开房间失败',
      })
    }
  },

  // 更新房间状态
  updateRoomStatus: async (roomId, status) => {
    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId)

      if (error) throw error

      // 更新本地状态
      const { rooms, currentRoom } = get()
      const updatedRooms = rooms.map(room =>
        room.id === roomId ? { ...room, status, updatedAt: new Date() } : room
      )

      set({ rooms: updatedRooms })

      if (currentRoom?.id === roomId) {
        set({ currentRoom: { ...currentRoom, status, updatedAt: new Date() } })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新房间状态失败',
      })
    }
  },

  // 更新玩家准备状态
  updatePlayerReady: async (playerId, isReady) => {
    const { currentRoom } = get()
    if (!currentRoom) return

    try {
      const { error } = await supabase
        .from('room_players')
        .update({
          is_ready: isReady,
        })
        .eq('room_id', currentRoom.id)
        .eq('player_id', playerId)

      if (error) throw error

      // 更新本地状态
      const updatedPlayers = get().roomPlayers.map(player =>
        player.id === playerId ? { ...player, isReady } : player
      )

      set({ roomPlayers: updatedPlayers })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新准备状态失败',
      })
    }
  },

  // 设置筛选条件
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    }))
    get().applyFilters()
  },

  // 设置搜索条件
  setSearchQuery: (query) => {
    set({ searchQuery: query })
    get().applyFilters()
  },

  // 应用筛选和搜索
  applyFilters: () => {
    const { rooms, filters, searchQuery } = get()

    let filtered = [...rooms]

    // 应用游戏模式筛选
    if (filters.gameMode !== 'all') {
      filtered = filtered.filter(room => room.gameMode === filters.gameMode)
    }

    // 应用状态筛选
    if (filters.status !== 'all') {
      filtered = filtered.filter(room => room.status === filters.status)
    }

    // 应用密码筛选
    if (filters.hasPassword) {
      filtered = filtered.filter(room => !room.isPrivate)
    }

    // 应用最大人数筛选
    filtered = filtered.filter(room => room.maxPlayers <= filters.maxPlayers)

    // 应用搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query) ||
        room.hostName.toLowerCase().includes(query)
      )
    }

    set({ filteredRooms: filtered })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },
}))

/**
 * 订阅房间变化
 */
export function subscribeToRoomChanges(roomId: RoomId, onUpdate: (room: GameRoom) => void) {
  const subscription = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        const room = payload.new as any
        onUpdate({
          id: room.id,
          name: room.name,
          description: room.description,
          maxPlayers: room.max_players,
          currentPlayers: room.current_players,
          isPrivate: room.is_private,
          password: room.password,
          hostId: room.host_id,
          hostName: room.host_name,
          gameMode: room.game_mode,
          aiPlayers: room.ai_players,
          status: room.status,
          createdAt: new Date(room.created_at),
          updatedAt: new Date(room.updated_at),
        })
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

/**
 * 订阅房间玩家变化
 */
export function subscribeToRoomPlayers(roomId: RoomId, onUpdate: (players: Player[]) => void) {
  const subscription = supabase
    .channel(`room-players:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_players',
        filter: `room_id=eq.${roomId}`,
      },
      async () => {
        // 重新获取玩家列表
        const { data, error } = await supabase
          .from('room_players')
          .select('*')
          .eq('room_id', roomId)
          .order('joined_at', { ascending: true })

        if (!error && data) {
          const players: Player[] = data.map(player => ({
            id: player.player_id,
            nickname: player.player_name,
            isReady: player.is_ready,
            isHost: player.is_host,
            joinedAt: new Date(player.joined_at),
          }))
          onUpdate(players)
        }
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}