/**
 * 游戏房间服务（集成游戏规则服务）
 *
 * 扩展原有的 GameRoomService，集成游戏规则验证和流程管理
 */

import { getCurrentGuestUserId } from '../../../infrastructure/supabase/client'
import { RoomRepository, SessionRepository } from '../../../infrastructure/supabase/repositories'
import { AIService } from '../../../infrastructure/supabase/repositories/AIService'
import type { DatabaseRoomPlayer } from '../../../types/database'
import { supabase } from '../../../infrastructure/supabase/client'
import { GameRules } from '../rules'
import type { Card } from '../../../domain/entities/Card'
import type { ValidationResult } from '../rules/types'

/**
 * 游戏房间服务（集成规则）
 */
export class GameRoomServiceWithRules {
  private static instance: GameRoomServiceWithRules
  private currentRoomId: string | null = null
  private static readonly MAX_PLAYERS = 4

  // 游戏规则服务
  private gameRules = GameRules

  static getInstance(): GameRoomServiceWithRules {
    if (!GameRoomServiceWithRules.instance) {
      GameRoomServiceWithRules.instance = new GameRoomServiceWithRules()
    }
    return GameRoomServiceWithRules.instance
  }

  /**
   * 初始化游戏规则服务
   */
  initializeGameRules(): void {
    console.log('初始化游戏规则服务...')
    this.gameRules.initialize()
    console.log('游戏规则服务初始化完成')
  }

  /**
   * 确保4人满员（AI 自动补位）
   */
  private async ensureFourPlayers(roomId: string): Promise<void> {
    const room = await RoomRepository.getRoomWithPlayers(roomId)
    const humanPlayers = room.players.filter((p: DatabaseRoomPlayer) => !p.user_id.startsWith('ai_')).length
    const aiPlayersNeeded = GameRoomServiceWithRules.MAX_PLAYERS - humanPlayers

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
      GameRoomServiceWithRules.MAX_PLAYERS,
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
   * 开始游戏（集成规则验证）
   */
  async startGame(): Promise<ValidationResult> {
    if (!this.currentRoomId) {
      return {
        valid: false,
        message: '未加入任何房间',
        errorCode: 'GAME_NOT_STARTED'
      }
    }

    try {
      const room = await RoomRepository.getRoomWithPlayers(this.currentRoomId)
      const players = room.players.filter((p: DatabaseRoomPlayer) => p.left_at === null)

      if (players.length < 1) {
        return {
          valid: false,
          message: '至少需要1名玩家才能开始游戏',
          errorCode: 'INVALID_GAME_STATE'
        }
      }

      // 使用规则验证器验证游戏是否可以开始
      const mockRoom = {
        status: room.status,
        players: players.map(p => ({
          id: p.user_id,
          isReady: p.is_ready
        })),
        config: { gameMode: 'standard' }
      }

      const validation = this.gameRules.ruleValidator.validateGameStart(mockRoom as any)
      if (!validation.valid) {
        return validation
      }

      // 保存游戏记录
      await SessionRepository.recordGameStart(this.currentRoomId, players.length)

      return {
        valid: true,
        message: '游戏开始成功'
      }

    } catch (error) {
      console.error('开始游戏错误:', error)
      return {
        valid: false,
        message: error instanceof Error ? error.message : '开始游戏失败',
        errorCode: 'UNKNOWN_ERROR'
      }
    }
  }

  /**
   * 验证玩家出牌
   */
  async validatePlay(
    playerId: string,
    cards: Card[],
    currentPattern?: any,
    gameSession?: any
  ): Promise<ValidationResult> {
    try {
      return this.gameRules.ruleValidator.validatePlay(playerId, cards, currentPattern, gameSession)
    } catch (error) {
      console.error('验证出牌错误:', error)
      return {
        valid: false,
        message: '验证出牌过程中发生错误',
        errorCode: 'UNKNOWN_ERROR'
      }
    }
  }

  /**
   * 玩家出牌（集成规则验证）
   */
  async playCards(
    playerId: string,
    cards: Card[],
    roomId?: string
  ): Promise<ValidationResult> {
    const targetRoomId = roomId || this.currentRoomId
    if (!targetRoomId) {
      return {
        valid: false,
        message: '未指定房间',
        errorCode: 'GAME_NOT_STARTED'
      }
    }

    try {
      // 获取当前游戏状态
      const room = await RoomRepository.getRoomWithPlayers(targetRoomId)

      // 创建模拟游戏会话
      const mockGameSession = {
        id: room.id,
        roomId: room.id,
        phase: room.status === 'playing' ? 'playing' : 'setup',
        currentRound: 1,
        rounds: [],
        players: room.players.map((p: DatabaseRoomPlayer) => ({
          id: p.user_id,
          name: p.user_id.startsWith('ai_') ? 'AI玩家' : '玩家',
          teamId: p.position ? (p.position === 'south' || p.position === 'north' ? 'team_1' : 'team_2') : 'team_1'
        }))
      }

      // 验证出牌
      const validation = await this.validatePlay(playerId, cards, undefined, mockGameSession)
      if (!validation.valid) {
        return validation
      }

      // 更新游戏状态（这里需要实际实现数据库更新）
      // 暂时只返回验证结果

      return validation

    } catch (error) {
      console.error('出牌错误:', error)
      return {
        valid: false,
        message: error instanceof Error ? error.message : '出牌失败',
        errorCode: 'UNKNOWN_ERROR'
      }
    }
  }

  /**
   * 计算积分
   */
  async calculateScores(roundResult: any): Promise<any> {
    try {
      const baseScore = this.gameRules.scoringService.calculateBaseScore(roundResult)
      const totalScore = this.gameRules.scoringService.applyBombBonus(roundResult.bombCount || 0, baseScore)

      return {
        baseScore,
        totalScore,
        roundResult
      }
    } catch (error) {
      console.error('计算积分错误:', error)
      return null
    }
  }

  /**
   * 获取游戏规则状态报告
   */
  getGameRulesStatus(): any {
    return this.gameRules.getStatusReport()
  }

  /**
   * 获取当前房间ID
   */
  getCurrentRoomId(): string | null {
    return this.currentRoomId
  }

  /**
   * 获取游戏规则服务
   */
  getGameRules(): typeof GameRules {
    return this.gameRules
  }
}

/**
 * 游戏房间服务单例（集成规则）
 */
export class GameRoomServiceWithRulesSingleton {
  private static instance: GameRoomServiceWithRules

  static getInstance(): GameRoomServiceWithRules {
    if (!GameRoomServiceWithRulesSingleton.instance) {
      GameRoomServiceWithRulesSingleton.instance = new GameRoomServiceWithRules()
    }
    return GameRoomServiceWithRulesSingleton.instance
  }
}