/**
 * 游戏状态 Store
 * 基于 Retro-Futurism 设计系统
 * 集成 Supabase 实时通信
 */

import { create } from 'zustand'
import { supabase } from '@/lib/infrastructure/supabase/client'
import type { GameRoom } from './lobbyStore'

export interface GameState {
  id: string
  roomId: string
  status: 'waiting' | 'playing' | 'paused' | 'finished'
  currentRound: number
  totalRounds: number
  currentPlayerIndex: number
  tableCards: any[]
  roundHistory: any[]
  scores: Record<string, number>
  createdAt: Date
  updatedAt: Date
}

export interface PlayerGameState {
  playerId: string
  nickname: string
  hand: any[]
  score: number
  isCurrentPlayer: boolean
}

interface GameStoreState {
  // 游戏状态
  currentGame: GameState | null
  playerStates: PlayerGameState[]
  tableCards: any[]

  // 加载状态
  isLoading: boolean
  error: string | null

  // 实时连接状态
  isConnected: boolean

  // 动作
  fetchGameState: (roomId: string) => Promise<void>
  updateGameState: (updates: Partial<GameState>) => Promise<void>
  playCards: (playerId: string, cards: any[]) => Promise<void>
  subscribeToGameChanges: (roomId: string) => () => void
  clearError: () => void
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // 初始状态
  currentGame: null,
  playerStates: [],
  tableCards: [],

  isLoading: false,
  error: null,
  isConnected: false,

  // 获取游戏状态
  fetchGameState: async (roomId: string) => {
    set({ isLoading: true, error: null })

    try {
      // 从 Supabase 获取游戏状态
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('room_id', roomId)
        .single()

      if (gameError && gameError.code !== 'PGRST116') {
        // PGRST116 表示没有找到记录，这是正常的
        throw gameError
      }

      if (gameData) {
        const gameState: GameState = {
          id: gameData.id,
          roomId: gameData.room_id,
          status: gameData.status,
          currentRound: gameData.current_round,
          totalRounds: gameData.total_rounds,
          currentPlayerIndex: gameData.current_player_index,
          tableCards: gameData.table_cards || [],
          roundHistory: gameData.round_history || [],
          scores: gameData.scores || {},
          createdAt: new Date(gameData.created_at),
          updatedAt: new Date(gameData.updated_at),
        }

        set({ currentGame: gameState, isLoading: false })
      } else {
        // 如果没有游戏状态，创建一个默认的
        const defaultGame: GameState = {
          id: crypto.randomUUID(),
          roomId,
          status: 'waiting',
          currentRound: 1,
          totalRounds: 4,
          currentPlayerIndex: 0,
          tableCards: [],
          roundHistory: [],
          scores: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set({ currentGame: defaultGame, isLoading: false })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取游戏状态失败',
        isLoading: false,
      })
    }
  },

  // 更新游戏状态
  updateGameState: async (updates: Partial<GameState>) => {
    const { currentGame } = get()
    if (!currentGame) return

    try {
      const gameUpdate = {
        status: updates.status || currentGame.status,
        current_round: updates.currentRound || currentGame.currentRound,
        current_player_index: updates.currentPlayerIndex || currentGame.currentPlayerIndex,
        table_cards: updates.tableCards || currentGame.tableCards,
        round_history: updates.roundHistory || currentGame.roundHistory,
        scores: updates.scores || currentGame.scores,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('games')
        .upsert({
          id: currentGame.id,
          room_id: currentGame.roomId,
          ...gameUpdate,
        })

      if (error) throw error

      // 更新本地状态
      set({
        currentGame: {
          ...currentGame,
          ...updates,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新游戏状态失败',
      })
    }
  },

  // 玩家出牌
  playCards: async (playerId: string, cards: any[]) => {
    const { currentGame, tableCards } = get()
    if (!currentGame) return

    try {
      const newTableCards = [...tableCards, ...cards]

      // 更新数据库
      const { error } = await supabase
        .from('games')
        .update({
          table_cards: newTableCards,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentGame.id)

      if (error) throw error

      // 更新本地状态
      set({ tableCards: newTableCards })

      // 通知其他玩家（通过实时订阅）
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '出牌失败',
      })
    }
  },

  // 订阅游戏变化
  subscribeToGameChanges: (roomId: string) => {
    const channel = supabase
      .channel(`game-state:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const gameData = payload.new as any
          const gameState: GameState = {
            id: gameData.id,
            roomId: gameData.room_id,
            status: gameData.status,
            currentRound: gameData.current_round,
            totalRounds: gameData.total_rounds,
            currentPlayerIndex: gameData.current_player_index,
            tableCards: gameData.table_cards || [],
            roundHistory: gameData.round_history || [],
            scores: gameData.scores || {},
            createdAt: new Date(gameData.created_at),
            updatedAt: new Date(gameData.updated_at),
          }

          set({ currentGame: gameState })
        }
      )
      .subscribe((status) => {
        set({ isConnected: status === 'SUBSCRIBED' })
      })

    // 返回取消订阅函数
    return () => {
      supabase.removeChannel(channel)
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },
}))
