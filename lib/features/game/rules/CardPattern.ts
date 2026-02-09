/**
 * 牌型规则定义
 * 定义掼蛋游戏中各种牌型的验证规则和大小比较规则
 */

import { CardPatternVO, CardPatternType } from '@/lib/domain/value-objects/CardPatternVO'
import type { Card } from '@/lib/domain/entities/Card'

// ==================== 牌型验证规则 ====================

/**
 * 牌型规则接口
 */
export interface CardPatternRule {
  /**
   * 检查牌型是否有效
   */
  validate(cards: Card[]): boolean
}

/**
 * 验证规则集合
 */
export const CardPatternRules: Record<CardPatternType, CardPatternRule> = {
  // 单张
  [CardPatternType.SINGLE]: {
    validate(cards) {
      return cards.length === 1
    }
  },

  // 对子
  [CardPatternType.PAIR]: {
    validate(cards) {
      if (cards.length !== 2) return false
      return cards[0].rank === cards[1].rank
    }
  },

  // 三张
  [CardPatternType.TRIPLE]: {
    validate(cards) {
      if (cards.length !== 3) return false
      return cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank
    }
  },

  // 三带二
  [CardPatternType.TRIPLE_TWO]: {
    validate(cards) {
      if (cards.length !== 5) return false

      const counts: Record<string, number> = {}
      for (const card of cards) {
        counts[card.rank] = (counts[card.rank] || 0) + 1
      }

      // 必须有3张相同，2张相同
      const hasTriple = Object.values(counts).includes(3)
      const hasPair = Object.values(counts).includes(2)

      if (!hasTriple || !hasPair) return false

      // 检查对子是否与三张点数相同
      const tripleRank = Object.keys(counts).find(rank => counts[rank] === 3)
      const pairRank = Object.keys(counts).find(rank => counts[rank] === 2)

      return tripleRank !== pairRank
    }
  },

  // 顺子（5张，含A、2）
  [CardPatternType.STRAIGHT]: {
    validate(cards) {
      if (cards.length !== 5) return false

      // 检查是否包含大小王
      for (const card of cards) {
        if (card.isJoker) return false
      }

      const sortedCards = [...cards].sort((a, b) => a.value - b.value)

      const values = sortedCards.map(c => c.value)

      // 掼蛋规则：顺子是任意5张连续的牌
      // A(14)和2(2)可以有不同排列方式
      // 允许的顺子模式：
      // 1. 2,3,4,5,6
      // 2. A(1),2,3,4,5
      // 3. 3,4,5,6,7 ... K,A,2

      // 检查是否连续
      let isContinuous = false
      for (let i = 1; i < values.length; i++) {
        if (values[i] === values[i - 1] + 1) {
          isContinuous = true
          break
        }
      }

      // 特殊情况：A,2,3,4,5 (1,2,3,4,5)
      const hasA = sortedCards.some(c => c.rank === 'A')
      const has2 = sortedCards.some(c => c.rank === '2')
      const isA2Sequence = hasA && has2 && values.includes(1) && values.includes(2)

      return isContinuous || isA2Sequence
    }
  },

  // 连对（只能是3连对，共6张）
  [CardPatternType.PAIR_STRAIGHT]: {
    validate(cards) {
      if (cards.length !== 6) return false

      // 检查是否包含大小王
      for (const card of cards) {
        if (card.isJoker) return false
      }

      const pairs = CardPatternVO['groupByRank'](cards)
      const ranks = Object.keys(pairs).sort((a, b) => parseInt(a) - parseInt(b))

      // 必须3连对
      if (ranks.length !== 3) return false

      // 检查是否连续
      for (let i = 1; i < ranks.length; i++) {
        if (parseInt(ranks[i]) !== parseInt(ranks[i - 1]) + 1) {
          return false
        }
      }

      return true
    }
  },

  // 飞机（不带，只能2个三张，共6张）
  [CardPatternType.PLANE]: {
    validate(cards) {
      // 只能是6张（2个三张）
      if (cards.length !== 6) return false

      const triples = CardPatternVO['groupByCount'](cards, 3)
      if (triples.length !== 2) return false

      const sortedRanks = triples.map(t => t.rank).sort((a, b) => parseInt(a) - parseInt(b))

      // 检查是否连续（A=1, A,2,3,4,5,6,7,8,9,10,J,Q,K）
      for (let i = 1; i < sortedRanks.length; i++) {
        if (parseInt(sortedRanks[i]) !== parseInt(sortedRanks[i - 1]) + 1) {
          return false
        }
      }

      return true
    }
  },

  // 炸弹
  [CardPatternType.BOMB]: {
    validate(cards) {
      if (cards.length < 4 || cards.length > 8) return false

      const counts = CardPatternVO['groupByRank'](cards)
      return Object.keys(counts).length === 1
    }
  },

  // 王炸
  [CardPatternType.ROCKET]: {
    validate(cards) {
      return cards.length === 2 && cards[0].isJoker && cards[1].isJoker
    }
  },

  // 过牌
  [CardPatternType.PASS]: {
    validate(cards) {
      // 过牌通常表示玩家选择不出牌，所以牌数为0
      return cards.length === 0
    }
  },

  // 无效牌型
  [CardPatternType.INVALID]: {
    validate(cards) {
      return false
    }
  }
}

// ==================== 牌型大小比较规则 ====================

/**
 * 牌型比较结果
 */
export interface CardPatternCompareResult {
  greater: boolean      // 是否比另一个牌型大
  less: boolean         // 是否比另一个牌型小
  equal: boolean        // 是否相等
  canBeat: boolean      // 是否能打过另一个牌型
}

/**
 * 比较两个牌型
 * @returns 比较结果
 */
export function comparePatterns(
  pattern1: CardPatternVO,
  pattern2: CardPatternVO
): CardPatternCompareResult {
  if (!pattern1.isValid || !pattern2.isValid) {
    return { greater: false, less: false, equal: false, canBeat: false }
  }

  // 1. 王炸最大
  if (pattern1.type === CardPatternType.ROCKET) {
    return { greater: true, less: false, equal: false, canBeat: true }
  }
  if (pattern2.type === CardPatternType.ROCKET) {
    return { greater: false, less: true, equal: false, canBeat: false }
  }

  // 2. 8张炸弹
  if (pattern1.type === CardPatternType.BOMB && pattern1.count === 8) {
    if (pattern2.type !== CardPatternType.BOMB) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
    if (pattern2.count === 8) {
      return { greater: pattern1.value > pattern2.value, less: pattern1.value < pattern2.value, equal: pattern1.value === pattern2.value, canBeat: false }
    }
    if (pattern2.count === 7 || pattern2.count === 6 || pattern2.count === 5 || pattern2.count === 4) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
  }
  if (pattern2.type === CardPatternType.BOMB && pattern2.count === 8) {
    return { greater: false, less: true, equal: false, canBeat: false }
  }

  // 3. 7张炸弹
  if (pattern1.type === CardPatternType.BOMB && pattern1.count === 7) {
    if (pattern2.type !== CardPatternType.BOMB) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
    if (pattern2.count === 7) {
      return { greater: pattern1.value > pattern2.value, less: pattern1.value < pattern2.value, equal: pattern1.value === pattern2.value, canBeat: false }
    }
    if (pattern2.count === 6 || pattern2.count === 5 || pattern2.count === 4) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
  }
  if (pattern2.type === CardPatternType.BOMB && pattern2.count === 7) {
    return { greater: false, less: true, equal: false, canBeat: false }
  }

  // 4. 6张炸弹
  if (pattern1.type === CardPatternType.BOMB && pattern1.count === 6) {
    if (pattern2.type !== CardPatternType.BOMB) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
    if (pattern2.count === 6) {
      return { greater: pattern1.value > pattern2.value, less: pattern1.value < pattern2.value, equal: pattern1.value === pattern2.value, canBeat: false }
    }
    if (pattern2.count === 5 || pattern2.count === 4) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
  }
  if (pattern2.type === CardPatternType.BOMB && pattern2.count === 6) {
    return { greater: false, less: true, equal: false, canBeat: false }
  }

  // 5. 5张顺子
  if (pattern1.type === CardPatternType.STRAIGHT && pattern1.count === 5) {
    if (pattern2.type !== CardPatternType.STRAIGHT && pattern2.type !== CardPatternType.BOMB) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
    if (pattern2.type === CardPatternType.STRAIGHT && pattern2.count === 5) {
      return { greater: pattern1.value > pattern2.value, less: pattern1.value < pattern2.value, equal: pattern1.value === pattern2.value, canBeat: pattern1.value > pattern2.value }
    }
    if (pattern2.type === CardPatternType.BOMB) {
      // 5张炸弹 < 5张顺子
      if (pattern2.count === 5) {
        return { greater: false, less: true, equal: false, canBeat: false }
      }
      // 6/7/8张炸弹 > 5张顺子
      if (pattern2.count === 6 || pattern2.count === 7 || pattern2.count === 8) {
        return { greater: false, less: true, equal: false, canBeat: false }
      }
      // 4张炸弹 < 5张顺子
      if (pattern2.count === 4) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
    }
  }
  if (pattern2.type === CardPatternType.STRAIGHT && pattern2.count === 5) {
    return { greater: false, less: true, equal: false, canBeat: false }
  }

  // 6. 5张炸弹
  if (pattern1.type === CardPatternType.BOMB && pattern1.count === 5) {
    if (pattern2.type !== CardPatternType.BOMB && pattern2.type !== CardPatternType.STRAIGHT) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
    if (pattern2.type === CardPatternType.BOMB && pattern2.count === 5) {
      return { greater: pattern1.value > pattern2.value, less: pattern1.value < pattern2.value, equal: pattern1.value === pattern2.value, canBeat: false }
    }
    if (pattern2.type === CardPatternType.STRAIGHT) {
      // 5张顺子 > 5张炸弹
      return { greater: false, less: true, equal: false, canBeat: false }
    }
  }
  if (pattern2.type === CardPatternType.BOMB && pattern2.count === 5) {
    return { greater: false, less: true, equal: false, canBeat: false }
  }

  // 7. 4张炸弹
  if (pattern1.type === CardPatternType.BOMB && pattern1.count === 4) {
    if (pattern2.type !== CardPatternType.BOMB && pattern2.type !== CardPatternType.STRAIGHT) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
    if (pattern2.type === CardPatternType.STRAIGHT) {
      // 5张顺子 > 4张炸弹
      return { greater: false, less: true, equal: false, canBeat: false }
    }
  }
  if (pattern2.type === CardPatternType.BOMB && pattern2.count === 4) {
    return { greater: false, less: true, equal: false, canBeat: false }
  }

  // 8. 其他牌型：按类型和点数比较
  if (pattern1.type !== pattern2.type) {
    return { greater: false, less: false, equal: false, canBeat: false }
  }

  // 比较主牌面点数
  // 使用value属性进行比较，因为value已经是数字化的点数
  const greater = pattern1.value > pattern2.value
  const less = pattern1.value < pattern2.value
  const equal = pattern1.value === pattern2.value

  return {
    greater,
    less,
    equal,
    canBeat: greater,
  }
}

/**
 * 判断第一个牌型是否能打过第二个牌型
 */
export function canBeatPattern(pattern1: CardPatternVO, pattern2: CardPatternVO): boolean {
  return comparePatterns(pattern1, pattern2).canBeat
}
