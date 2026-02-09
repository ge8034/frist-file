import type { DatabaseRoomPlayer } from '../../../types/database'

/**
 * AI 玩家数据
 */
export interface AIPlayer {
  userId: string
  nickname: string
  skillLevel: number // AI 技能等级
}

/**
 * AI 玩家服务
 * 负责生成和配置 AI 玩家
 */
export class AIService {
  private static readonly AI_SKILL_LEVELS = [1, 2, 3, 4, 5] // AI 技能等级

  /**
   * 生成随机 AI 玩家
   */
  static createAIPlayer(): AIPlayer {
    const skillLevel = this.AI_SKILL_LEVELS[Math.floor(Math.random() * this.AI_SKILL_LEVELS.length)]
    const nicknames = [
      'AI_小明', 'AI_小红', 'AI_小刚', 'AI_小芳',
      'AI_高手', 'AI_新手', 'AI_大师', 'AI_玩家'
    ]
    const nickname = nicknames[Math.floor(Math.random() * nicknames.length)]

    return {
      userId: `ai_${Date.now()}_${Math.random()}`,
      nickname: `${nickname}_${skillLevel}级`,
      skillLevel
    }
  }

  /**
   * 计算需要的 AI 玩家数量
   */
  static calculateNeededAIPlayers(currentCount: number, maxPlayers: number): number {
    if (currentCount >= maxPlayers) return 0
    return maxPlayers - currentCount
  }
}
