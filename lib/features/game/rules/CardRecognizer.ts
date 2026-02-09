/**
 * 牌型识别器
 * 从手牌中识别最合适的牌型
 */

import { CardPatternVO, CardPatternType } from '@/lib/domain/value-objects/CardPatternVO'
import type { Card } from '@/lib/domain/entities/Card'
import { CardPatternRules, comparePatterns, canBeatPattern } from './CardPattern'

/**
 * 牌型识别结果
 */
export interface CardPatternRecognizeResult {
  pattern: CardPatternVO | null    // 识别出的牌型
  bestCards: Card[]                // 最佳牌张
  allPatterns: CardPatternVO[]     // 所有可能的牌型
}

/**
 * 牌型识别器
 */
export class CardRecognizer {
  /**
   * 从手牌中识别最合适的牌型
   * @param handCards 手牌
   * @param lastPlayedPattern 上一手打出的牌型（可选）
   * @param lastPlayedRank 上一手牌的主牌面点数（可选）
   * @returns 识别结果
   */
  static recognize(
    handCards: Card[],
    lastPlayedPattern?: CardPatternVO | null,
    lastPlayedRank?: string | null
  ): CardPatternRecognizeResult {
    // 获取所有可能的牌型
    const allPatterns = this.getAllPossiblePatterns(handCards)

    if (allPatterns.length === 0) {
      return {
        pattern: null,
        bestCards: [],
        allPatterns,
      }
    }

    // 如果没有上一手牌，选择牌数最多的牌型
    if (!lastPlayedPattern) {
      const bestPattern = this.selectBestPattern(allPatterns)
      return {
        pattern: bestPattern,
        bestCards: [...bestPattern.cards],
        allPatterns,
      }
    }

    // 如果有上一手牌，选择能打过的最大牌型
    const beatablePatterns = allPatterns.filter(p => this.canBeat(p, lastPlayedPattern))

    if (beatablePatterns.length === 0) {
      return {
        pattern: null,
        bestCards: [],
        allPatterns,
      }
    }

    const bestPattern = this.selectBestPattern(beatablePatterns)
    return {
      pattern: bestPattern,
      bestCards: [...bestPattern.cards],
      allPatterns,
    }
  }

  /**
   * 获取所有可能的牌型
   */
  static getAllPossiblePatterns(cards: Card[]): CardPatternVO[] {
    return CardPatternVO.getAllPossiblePatterns(cards)
  }

  /**
   * 判断牌型是否可以打过上一次牌型
   */
  static canBeat(pattern: CardPatternVO, lastPlayed: CardPatternVO): boolean {
    return canBeatPattern(pattern, lastPlayed)
  }

  /**
   * 识别牌型（实例方法，用于兼容现有代码）
   */
  recognizePattern(cards: Card[]): CardPatternVO {
    const result = CardRecognizer.recognize(cards)
    return result.pattern || CardPatternVO.create(cards)
  }

  /**
   * 选择最佳牌型
   * 规则：优先选择牌数多的，如果牌数相同则选择点数大的
   */
  private static selectBestPattern(patterns: CardPatternVO[]): CardPatternVO {
    return patterns.reduce((best, current) => {
      // 优先选择牌数多的（使用cardCount而不是count）
      if (current.cardCount > best.cardCount) {
        return current
      }

      // 牌数相同则选择点数大的
      if (current.cardCount === best.cardCount) {
        return current.value > best.value ? current : best
      }

      return best
    }, patterns[0]!)
  }
}
