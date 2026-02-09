/**
 * 游戏状态 Store（集成游戏规则服务）
 * 基于 Retro-Futurism 设计系统
 * 集成 Supabase 实时通信和游戏规则验证
 */

import { create } from 'zustand'
import { supabase } from '@/lib/infrastructure/supabase/client'
import { GameRules } from '../features/game/rules'
import type { GameRoom } from './lobbyStore'
import type { Card } from '../domain/entities/Card'
import type { ValidationResult } from '../features/game/rules/types'
import { GameState as GameStateEnum } from '../features/game/rules/types'

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

  // 新增字段：游戏规则相关
  ruleValidation?: ValidationResult
  currentPattern?: any // 当前牌桌上的牌型
  passedPlayers: string[] // 已过牌的玩家ID
  gamePhase: GameStateEnum // 游戏规则状态
}

export interface PlayerGameState {
  playerId: string
  nickname: string
  hand: any[]
  score: number
  isCurrentPlayer: boolean
  teamId: string // 新增：队伍ID
  level: number // 新增：当前等级
}

interface GameStoreWithRulesState {
  // 游戏状态
  currentGame: GameState | null
  playerStates: PlayerGameState[]
  tableCards: any[]

  // 游戏规则服务
  gameRules: typeof GameRules

  // 加载状态
  isLoading: boolean
  error: string | null

  // 实时连接状态
  isConnected: boolean

  // 动作
  fetchGameState: (roomId: string) => Promise<void>
  updateGameState: (updates: Partial<GameState>) => Promise<void>
  playCards: (playerId: string, cards: Card[]) => Promise<ValidationResult>
  validatePlay: (playerId: string, cards: Card[]) => ValidationResult
  subscribeToGameChanges: (roomId: string) => () => void
  clearError: () => void

  // 新增动作：游戏规则相关
  initializeGameRules: () => void
  getGameRulesStatus: () => any
  calculateScores: (roundResult: any) => Promise<any>
  transitionGameState: (newState: GameStateEnum) => Promise<boolean>
}

export const useGameStoreWithRules = create<GameStoreWithRulesState>((set, get) => ({
  // 初始状态
  currentGame: null,
  playerStates: [],
  tableCards: [],

  // 游戏规则服务
  gameRules: GameRules,

  isLoading: false,
  error: null,
  isConnected: false,

  // 初始化游戏规则
  initializeGameRules: () => {
    console.log('初始化游戏规则服务...')
    const { gameRuleService, scoringService, specialRuleService, stateMachine, ruleValidator } = GameRules.initialize()
    console.log('游戏规则服务初始化完成')

    // 获取状态报告
    const statusReport = GameRules.getStatusReport()
    console.log('游戏规则服务状态报告:', statusReport)
  },

  // 获取游戏规则状态
  getGameRulesStatus: () => {
    return GameRules.getStatusReport()
  },

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
          passedPlayers: gameData.passed_players || [],
          gamePhase: gameData.game_phase || 'preparing'
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
          passedPlayers: [],
          gamePhase: GameStateEnum.PREPARING
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
        passed_players: updates.passedPlayers || currentGame.passedPlayers,
        game_phase: updates.gamePhase || currentGame.gamePhase,
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

  // 验证玩家出牌
  validatePlay: (playerId: string, cards: Card[]): ValidationResult => {
    const { currentGame, playerStates } = get()
    if (!currentGame) {
      return {
        valid: false,
        message: '游戏未开始',
        errorCode: 'GAME_NOT_STARTED'
      }
    }

    // 创建模拟游戏会话
    const mockGameSession = {
      id: currentGame.id,
      roomId: currentGame.roomId,
      phase: currentGame.status === 'playing' ? 'playing' : 'setup',
      currentRound: currentGame.currentRound,
      rounds: currentGame.roundHistory,
      players: playerStates.map(p => ({
        id: p.playerId,
        name: p.nickname,
        teamId: p.teamId
      }))
    }

    // 获取当前牌型（如果有）
    const currentPattern = currentGame.currentPattern

    // 使用规则验证器验证出牌
    const validationResult = GameRules.ruleValidator.validatePlay(
      playerId,
      cards,
      currentPattern,
      mockGameSession as any
    )

    // 更新验证结果到状态
    if (validationResult.valid) {
      set({
        currentGame: {
          ...currentGame,
          ruleValidation: validationResult
        }
      })
    }

    return validationResult
  },

  // 玩家出牌（集成规则验证）
  playCards: async (playerId: string, cards: Card[]): Promise<ValidationResult> => {
    const { currentGame, tableCards, validatePlay, updateGameState } = get()
    if (!currentGame) {
      return {
        valid: false,
        message: '游戏未开始',
        errorCode: 'GAME_NOT_STARTED'
      }
    }

    set({ isLoading: true, error: null })

    try {
      // 1. 验证出牌
      const validationResult = validatePlay(playerId, cards)
      if (!validationResult.valid) {
        set({ isLoading: false })
        return validationResult
      }

      // 2. 更新牌桌
      const newTableCards = [...tableCards, ...cards]
      set({ tableCards: newTableCards })

      // 3. 更新当前牌型
      const pattern = validationResult.details?.pattern
      const updates: Partial<GameState> = {
        tableCards: newTableCards,
        currentPattern: pattern
      }

      // 4. 检查是否需要更新过牌玩家列表
      if (validationResult.details?.patternType === 'pass') {
        updates.passedPlayers = [...currentGame.passedPlayers, playerId]
      }

      // 5. 更新游戏状态
      await updateGameState(updates)

      // 6. 检查回合是否结束
      const players = get().playerStates
      const isRoundEnd = GameRules.ruleValidator.isRoundEnd(
        players.map(p => ({ id: p.playerId } as any)),
        updates.passedPlayers || currentGame.passedPlayers,
        playerId
      )

      if (isRoundEnd) {
        // 回合结束，计算积分
        await get().calculateScores({
          roundNumber: currentGame.currentRound,
          winningTeamId: 'team1', // 需要根据实际情况确定
          playRecords: [] // 需要记录出牌记录
        })
      }

      set({ isLoading: false })
      return validationResult

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '出牌失败'
      set({
        error: errorMessage,
        isLoading: false,
      })
      return {
        valid: false,
        message: errorMessage,
        errorCode: 'UNKNOWN_ERROR'
      }
    }
  },

  // 计算积分
  calculateScores: async (roundResult: any): Promise<any> => {
    const { currentGame, playerStates, updateGameState } = get()
    if (!currentGame) return null

    try {
      // 使用积分计算服务
      const baseScore = GameRules.scoringService.calculateBaseScore(roundResult)
      const totalScore = GameRules.scoringService.applyBombBonus(roundResult.bombCount || 0, baseScore)

      // 更新玩家积分
      const updatedScores = { ...currentGame.scores }
      const updatedPlayerStates = [...playerStates]

      // 假设队伍1获胜
      playerStates.forEach((player, index) => {
        if (player.teamId === 'team1') {
          const newScore = (updatedScores[player.playerId] || 0) + totalScore
          updatedScores[player.playerId] = newScore

          // 计算新等级
          const newLevel = GameRules.scoringService.calculateLevelUp(totalScore, player.level || 5)

          updatedPlayerStates[index] = {
            ...player,
            score: newScore,
            level: newLevel
          }
        }
      })

      // 更新游戏状态
      await updateGameState({
        scores: updatedScores,
        currentRound: currentGame.currentRound + 1,
        passedPlayers: [], // 重置过牌玩家
        currentPattern: undefined // 重置当前牌型
      })

      // 更新玩家状态
      set({ playerStates: updatedPlayerStates })

      return {
        baseScore,
        totalScore,
        updatedScores,
        playerStates: updatedPlayerStates
      }

    } catch (error) {
      console.error('计算积分错误:', error)
      return null
    }
  },

  // 状态转移
  transitionGameState: async (newState: GameStateEnum): Promise<boolean> => {
    const { currentGame, playerStates } = get()
    if (!currentGame) return false

    try {
      // 创建模拟游戏会话
      const mockGameSession = {
        id: currentGame.id,
        roomId: currentGame.roomId,
        phase: currentGame.gamePhase,
        currentRound: currentGame.currentRound,
        rounds: currentGame.roundHistory,
        players: playerStates.map(p => ({
          id: p.playerId,
          name: p.nickname,
          teamId: p.teamId
        }))
      }

      // 使用状态机进行状态转移
      const success = GameRules.stateMachine.transitionTo(newState, mockGameSession as any)
      if (success) {
        // 更新游戏状态
        await get().updateGameState({
          gamePhase: newState
        })
      }

      return success

    } catch (error) {
      console.error('状态转移错误:', error)
      return false
    }
  },

  // 订阅游戏变化
  subscribeToGameChanges: (roomId: string) => {
    const channel = supabase
      .channel(`game-state:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const { currentGame } = get()
          if (currentGame && payload.new) {
            // 更新本地状态
            const newData = payload.new as any
            const updatedGame: GameState = {
              ...currentGame,
              status: newData.status,
              currentRound: newData.current_round,
              currentPlayerIndex: newData.current_player_index,
              tableCards: newData.table_cards || [],
              roundHistory: newData.round_history || [],
              scores: newData.scores || {},
              passedPlayers: newData.passed_players || [],
              gamePhase: newData.game_phase || 'preparing',
              updatedAt: new Date(newData.updated_at),
            }

            set({ currentGame: updatedGame })
          }
        }
      )
      .subscribe()

    set({ isConnected: true })

    // 返回取消订阅函数
    return () => {
      supabase.removeChannel(channel)
      set({ isConnected: false })
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },
}))