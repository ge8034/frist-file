/**
 * 积分计算服务
 *
 * 实现掼蛋游戏的积分计算、胜负判定和等级升级逻辑
 */

import type { GameSession } from '../../../domain/entities/GameSession'
import {
  IScoringService,
  RoundResult,
  PlayerScore,
  TeamScoreResult,
  ValidationResult,
  RuleValidationError
} from './types'

/**
 * 积分计算服务实现
 */
export class ScoringService implements IScoringService {
  // 掼蛋积分规则常量
  private readonly SCORE_RULES = {
    // 基础积分
    BASE_WIN_SCORE: 2,      // 获胜基础积分
    BASE_LOSE_SCORE: -2,    // 失败基础积分

    // 炸弹奖励倍数
    BOMB_BONUS_MULTIPLIERS: {
      4: 1,   // 4张炸弹：1倍奖励
      5: 2,   // 5张炸弹：2倍奖励
      6: 3,   // 6张炸弹：3倍奖励
      7: 4,   // 7张炸弹：4倍奖励
      8: 5    // 8张炸弹：5倍奖励
    },

    // 春天奖励
    SPRING_BONUS: 2,        // 春天奖励积分
    COUNTER_SPRING_BONUS: 4, // 反春奖励积分

    // 等级升级规则
    LEVEL_UP_THRESHOLD: 10,  // 升级所需积分
    LEVEL_DOWN_THRESHOLD: -10 // 降级所需积分
  }

  /**
   * 计算基础积分
   */
  calculateBaseScore(roundResult: RoundResult): number {
    try {
      let baseScore = this.SCORE_RULES.BASE_WIN_SCORE

      // 应用春天/反春奖励
      if (roundResult.isSpring) {
        baseScore += this.SCORE_RULES.SPRING_BONUS
      } else if (roundResult.isCounterSpring) {
        baseScore += this.SCORE_RULES.COUNTER_SPRING_BONUS
      }

      return baseScore
    } catch (error) {
      console.error('计算基础积分错误:', error)
      return this.SCORE_RULES.BASE_WIN_SCORE
    }
  }

  /**
   * 应用炸弹奖励
   */
  applyBombBonus(bombCount: number, baseScore: number): number {
    try {
      if (bombCount <= 0) {
        return baseScore
      }

      // 获取炸弹奖励倍数
      const multiplier = this.SCORE_RULES.BOMB_BONUS_MULTIPLIERS[bombCount as keyof typeof this.SCORE_RULES.BOMB_BONUS_MULTIPLIERS] || 1

      // 计算奖励积分
      const bonus = baseScore * multiplier

      return baseScore + bonus
    } catch (error) {
      console.error('应用炸弹奖励错误:', error)
      return baseScore
    }
  }

  /**
   * 计算队伍积分
   */
  calculateTeamScores(scores: PlayerScore[]): TeamScoreResult {
    try {
      // 按队伍分组
      const teams = this.groupScoresByTeam(scores)

      // 计算每个队伍的总积分
      const teamResults: TeamScoreResult[] = []
      for (const [teamId, teamScores] of Object.entries(teams)) {
        const totalScore = teamScores.reduce((sum, score) => sum + score.totalScore, 0)
        const levelChange = this.calculateTeamLevelChange(teamScores)

        teamResults.push({
          teamId,
          teamName: this.getTeamName(teamId),
          totalScore,
          levelChange,
          memberScores: teamScores
        })
      }

      // 返回积分最高的队伍（获胜队伍）
      const winningTeam = teamResults.reduce((prev, current) =>
        prev.totalScore > current.totalScore ? prev : current
      )

      return winningTeam
    } catch (error) {
      console.error('计算队伍积分错误:', error)
      return {
        teamId: 'unknown',
        teamName: '未知队伍',
        totalScore: 0,
        levelChange: 0,
        memberScores: []
      }
    }
  }

  /**
   * 计算等级升级
   */
  calculateLevelUp(scoreDifference: number, currentLevel: number): number {
    try {
      let newLevel = currentLevel

      // 计算等级变化
      const levelChange = Math.floor(scoreDifference / this.SCORE_RULES.LEVEL_UP_THRESHOLD)

      if (levelChange > 0) {
        // 升级
        newLevel = Math.min(currentLevel + levelChange, 13) // 掼蛋最高13级（2-A）
      } else if (levelChange < 0) {
        // 降级
        newLevel = Math.max(currentLevel + levelChange, 2) // 掼蛋最低2级
      }

      return newLevel
    } catch (error) {
      console.error('计算等级升级错误:', error)
      return currentLevel
    }
  }

  /**
   * 判断是否春天
   */
  isSpring(roundResult: RoundResult): boolean {
    try {
      // 春天：一方未出牌就获胜
      const losingTeamPlays = roundResult.playRecords.filter(record => {
        // 这里需要根据玩家队伍ID判断
        // 暂时使用简化逻辑
        return false
      })

      return losingTeamPlays.length === 0
    } catch (error) {
      console.error('判断春天错误:', error)
      return false
    }
  }

  /**
   * 判断是否反春
   */
  isCounterSpring(roundResult: RoundResult): boolean {
    try {
      // 反春：一方出完牌后，对方未出牌
      // 需要更复杂的游戏状态判断
      // 暂时返回false
      return false
    } catch (error) {
      console.error('判断反春错误:', error)
      return false
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 按队伍分组积分
   */
  private groupScoresByTeam(scores: PlayerScore[]): Record<string, PlayerScore[]> {
    const teams: Record<string, PlayerScore[]> = {}

    for (const score of scores) {
      if (!teams[score.teamId]) {
        teams[score.teamId] = []
      }
      teams[score.teamId].push(score)
    }

    return teams
  }

  /**
   * 计算队伍等级变化
   */
  private calculateTeamLevelChange(teamScores: PlayerScore[]): number {
    if (teamScores.length === 0) {
      return 0
    }

    // 计算队伍平均积分
    const averageScore = teamScores.reduce((sum, score) => sum + score.totalScore, 0) / teamScores.length

    // 根据平均积分计算等级变化
    return Math.floor(averageScore / this.SCORE_RULES.LEVEL_UP_THRESHOLD)
  }

  /**
   * 获取队伍名称
   */
  private getTeamName(teamId: string): string {
    const teamNames: Record<string, string> = {
      'team_1': '红队',
      'team_2': '蓝队',
      'team_3': '黄队',
      'team_4': '绿队'
    }

    return teamNames[teamId] || `队伍${teamId}`
  }

  /**
   * 计算玩家积分
   */
  calculatePlayerScore(
    playerId: string,
    playerName: string,
    teamId: string,
    baseScore: number,
    bombCount: number,
    currentLevel: number
  ): PlayerScore {
    try {
      // 应用炸弹奖励
      const bombBonus = this.calculateBombBonus(bombCount, baseScore)
      const totalScore = baseScore + bombBonus

      // 计算新等级
      const newLevel = this.calculateLevelUp(totalScore, currentLevel)

      return {
        playerId,
        playerName,
        teamId,
        baseScore,
        bombBonus,
        specialBonus: 0, // 特殊规则奖励暂时为0
        totalScore,
        currentLevel,
        newLevel
      }
    } catch (error) {
      console.error('计算玩家积分错误:', error)
      return {
        playerId,
        playerName,
        teamId,
        baseScore: 0,
        bombBonus: 0,
        specialBonus: 0,
        totalScore: 0,
        currentLevel,
        newLevel: currentLevel
      }
    }
  }

  /**
   * 计算炸弹奖励
   */
  private calculateBombBonus(bombCount: number, baseScore: number): number {
    if (bombCount <= 0) {
      return 0
    }

    const multiplier = this.SCORE_RULES.BOMB_BONUS_MULTIPLIERS[bombCount as keyof typeof this.SCORE_RULES.BOMB_BONUS_MULTIPLIERS] || 1
    return baseScore * multiplier
  }

  /**
   * 验证积分计算结果
   */
  validateScoreCalculation(scores: PlayerScore[]): ValidationResult {
    try {
      const errors: string[] = []

      // 检查每个玩家的积分
      for (const score of scores) {
        // 检查总积分计算是否正确
        const calculatedTotal = score.baseScore + score.bombBonus + score.specialBonus
        if (Math.abs(calculatedTotal - score.totalScore) > 0.01) {
          errors.push(`玩家 ${score.playerName} 总积分计算错误`)
        }

        // 检查等级变化是否合理
        if (score.newLevel < 2 || score.newLevel > 13) {
          errors.push(`玩家 ${score.playerName} 等级超出范围`)
        }
      }

      if (errors.length > 0) {
        return {
          valid: false,
          message: '积分计算验证失败',
          errorCode: RuleValidationError.SPECIAL_RULE_VIOLATION,
          details: {
            violations: errors
          }
        }
      }

      return {
        valid: true,
        message: '积分计算验证通过'
      }
    } catch (error) {
      console.error('验证积分计算错误:', error)
      return {
        valid: false,
        message: '积分计算验证过程中发生错误',
        errorCode: RuleValidationError.UNKNOWN_ERROR
      }
    }
  }

  /**
   * 获取积分规则说明
   */
  getScoringRulesDescription(): string {
    return `
掼蛋积分规则：

1. 基础积分：
   - 获胜队伍：+${this.SCORE_RULES.BASE_WIN_SCORE}分
   - 失败队伍：${this.SCORE_RULES.BASE_LOSE_SCORE}分

2. 炸弹奖励倍数：
   ${Object.entries(this.SCORE_RULES.BOMB_BONUS_MULTIPLIERS)
      .map(([count, multiplier]) => `   - ${count}张炸弹：${multiplier}倍奖励`)
      .join('\n')}

3. 特殊奖励：
   - 春天奖励：+${this.SCORE_RULES.SPRING_BONUS}分
   - 反春奖励：+${this.SCORE_RULES.COUNTER_SPRING_BONUS}分

4. 等级升级：
   - 每获得${this.SCORE_RULES.LEVEL_UP_THRESHOLD}分升1级
   - 每失去${Math.abs(this.SCORE_RULES.LEVEL_DOWN_THRESHOLD)}分降1级
   - 等级范围：2级到A级（13级）
    `
  }
}

/**
 * 积分计算服务单例
 */
export class ScoringServiceSingleton {
  private static instance: ScoringService

  static getInstance(): ScoringService {
    if (!ScoringServiceSingleton.instance) {
      ScoringServiceSingleton.instance = new ScoringService()
    }
    return ScoringServiceSingleton.instance
  }
}