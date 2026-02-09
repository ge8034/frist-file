/**
 * 牌型值对象
 *
 * 在 DDD 中，值对象具有以下特点：
 * - 无唯一标识符
 * - 不可变
 * - 依赖属性值而非身份
 * - 用于表示掼蛋游戏中的各种牌型
 */

import type { Card } from '../../domain/entities/Card'

// ==================== 牌型类型定义 ====================

/**
 * 牌型枚举
 */
export enum CardPatternType {
  SINGLE = 'single',           // 单张
  PAIR = 'pair',               // 对子
  TRIPLE = 'triple',           // 三张
  TRIPLE_TWO = 'triple_two',   // 三带二
  STRAIGHT = 'straight',       // 顺子（5张，含A、2）
  PAIR_STRAIGHT = 'pair_straight',  // 连对（3连对，共6张）
  PLANE = 'plane',             // 飞机（不带）
  BOMB = 'bomb',               // 炸弹（4张至8张相同）
  ROCKET = 'rocket',           // 王炸
  PASS = 'pass',               // 过牌
  INVALID = 'invalid',         // 无效牌型
}

/**
 * 牌型信息
 */
export interface CardPatternInfo {
  type: CardPatternType
  rank: string           // 主牌面点数（如 'A', 'K', '2'）
  length: number         // 牌数
  value: number          // 比较值（用于牌型大小比较）
  cardCount: number      // 牌张数
  subPattern?: CardPatternInfo  // 子牌型（如飞机带翅膀）
}

/**
 * 牌型验证结果
 */
export interface CardPatternValidateResult {
  valid: boolean
  patternType?: CardPatternType
  message?: string
}

/**
 * 牌型比较结果
 */
export interface CardPatternCompareResult {
  greater: boolean      // 是否比另一个牌型大
  less: boolean         // 是否比另一个牌型小
  equal: boolean        // 是否相等
  canBeat: boolean      // 是否能打过另一个牌型
}

// ==================== 牌型值对象类 ====================

/**
 * 牌型值对象
 *
 * 表示掼蛋游戏中的牌型，不可变对象
 */
export class CardPatternVO {
  /** 牌型类型 */
  readonly type: CardPatternType

  /** 牌张数组（已排序） */
  readonly cards: readonly Card[]

  /** 牌面点数（主牌面） */
  readonly rank: string

  /** 牌数 */
  readonly count: number

  /** 比较值 */
  readonly value: number

  /** 物理牌张数（可能包含副牌） */
  readonly cardCount: number

  /** 是否有效 */
  readonly isValid: boolean

  /**
   * 私有构造函数（通过静态方法创建）
   */
  private constructor(
    type: CardPatternType,
    cards: Card[],
    rank: string,
    count: number,
    value: number,
    cardCount: number,
    isValid: boolean
  ) {
    this.type = type
    this.cards = cards.sort((a, b) => a.value - b.value)
    this.rank = rank
    this.count = count
    this.value = value
    this.cardCount = cardCount
    this.isValid = isValid
  }

  /**
   * 获取牌型描述
   */
  getDescription(): string {
    const typeNames: Record<CardPatternType, string> = {
      [CardPatternType.SINGLE]: '单张',
      [CardPatternType.PAIR]: '对子',
      [CardPatternType.TRIPLE]: '三张',
      [CardPatternType.TRIPLE_TWO]: '三带二',
      [CardPatternType.STRAIGHT]: '顺子',
      [CardPatternType.PAIR_STRAIGHT]: '连对',
      [CardPatternType.PLANE]: '飞机（不带）',
      [CardPatternType.BOMB]: '炸弹',
      [CardPatternType.ROCKET]: '王炸',
      [CardPatternType.PASS]: '过牌',
      [CardPatternType.INVALID]: '无效牌型',
    }

    if (!this.isValid) return typeNames[this.type]

    return typeNames[this.type]
  }

  /**
   * 检查是否为特定牌型
   */
  isType(patternType: CardPatternType): boolean {
    return this.type === patternType
  }

  /**
   * 比较两个牌型
   * @returns 比较结果
   */
  compare(other: CardPatternVO): CardPatternCompareResult {
    if (!this.isValid || !other.isValid) {
      return { greater: false, less: false, equal: false, canBeat: false }
    }

    // 王炸最大
    if (this.type === CardPatternType.ROCKET) {
      return { greater: true, less: false, equal: false, canBeat: true }
    }
    if (other.type === CardPatternType.ROCKET) {
      return { greater: false, less: true, equal: false, canBeat: false }
    }

    const thisIsBomb = this.type === CardPatternType.BOMB
    const otherIsBomb = other.type === CardPatternType.BOMB
    const thisIsStraight = this.type === CardPatternType.STRAIGHT
    const otherIsStraight = other.type === CardPatternType.STRAIGHT

    // 1. 8张炸弹
    if (thisIsBomb && this.count === 8) {
      if (!otherIsBomb) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
      if (other.count === 8) {
        return { greater: this.value > other.value, less: this.value < other.value, equal: this.value === other.value, canBeat: false }
      }
      if (other.count === 7 || other.count === 6 || other.count === 5 || other.count === 4) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
    }
    if (otherIsBomb && other.count === 8) {
      return { greater: false, less: true, equal: false, canBeat: false }
    }

    // 2. 7张炸弹
    if (thisIsBomb && this.count === 7) {
      if (!otherIsBomb) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
      if (other.count === 7) {
        return { greater: this.value > other.value, less: this.value < other.value, equal: this.value === other.value, canBeat: false }
      }
      if (other.count === 6 || other.count === 5 || other.count === 4) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
    }
    if (otherIsBomb && other.count === 7) {
      return { greater: false, less: true, equal: false, canBeat: false }
    }

    // 3. 6张炸弹
    if (thisIsBomb && this.count === 6) {
      if (!otherIsBomb) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
      if (other.count === 6) {
        return { greater: this.value > other.value, less: this.value < other.value, equal: this.value === other.value, canBeat: false }
      }
      if (other.count === 5 || other.count === 4) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
    }
    if (otherIsBomb && other.count === 6) {
      return { greater: false, less: true, equal: false, canBeat: false }
    }

    // 4. 5张顺子
    if (thisIsStraight && this.count === 5) {
      if (!otherIsStraight && !otherIsBomb) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
      if (otherIsStraight && other.count === 5) {
        return { greater: this.value > other.value, less: this.value < other.value, equal: this.value === other.value, canBeat: this.value > other.value }
      }
      if (otherIsBomb) {
        // 5张炸弹 < 5张顺子
        if (other.count === 5) {
          return { greater: false, less: true, equal: false, canBeat: false }
        }
        // 6/7/8张炸弹 > 5张顺子
        if (other.count === 6 || other.count === 7 || other.count === 8) {
          return { greater: false, less: true, equal: false, canBeat: false }
        }
        // 4张炸弹 < 5张顺子
        if (other.count === 4) {
          return { greater: true, less: false, equal: false, canBeat: true }
        }
      }
    }
    if (otherIsStraight && other.count === 5) {
      return { greater: false, less: true, equal: false, canBeat: false }
    }

    // 5. 5张炸弹
    if (thisIsBomb && this.count === 5) {
      if (!otherIsBomb && !otherIsStraight) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
      if (otherIsBomb && other.count === 5) {
        return { greater: this.value > other.value, less: this.value < other.value, equal: this.value === other.value, canBeat: false }
      }
      if (otherIsStraight) {
        // 5张顺子 > 5张炸弹
        return { greater: false, less: true, equal: false, canBeat: false }
      }
    }
    if (otherIsBomb && other.count === 5) {
      return { greater: false, less: true, equal: false, canBeat: false }
    }

    // 6. 4张炸弹
    if (thisIsBomb && this.count === 4) {
      if (!otherIsBomb && !otherIsStraight) {
        return { greater: true, less: false, equal: false, canBeat: true }
      }
      if (otherIsStraight) {
        // 5张顺子 > 4张炸弹
        return { greater: false, less: true, equal: false, canBeat: false }
      }
    }
    if (otherIsBomb && other.count === 4) {
      return { greater: false, less: true, equal: false, canBeat: false }
    }

    // 同类型比较
    if (this.type !== other.type) {
      return { greater: false, less: false, equal: false, canBeat: false }
    }

    // 比较主牌面点数
    const rankCompare = this.rank.localeCompare(other.rank, undefined, { numeric: true, sensitivity: 'base' })
    const greater = rankCompare > 0
    const less = rankCompare < 0
    const equal = rankCompare === 0

    return {
      greater,
      less,
      equal,
      canBeat: greater,  // 相同点数的炸弹不可以互相压制
    }
  }

  /**
   * 判断是否可以打过另一个牌型
   */
  canBeat(other: CardPatternVO): boolean {
    return this.compare(other).canBeat
  }

  /**
   * 克隆牌型（返回副本）
   */
  clone(): CardPatternVO {
    return CardPatternVO.create([...this.cards])
  }

  /**
   * 转换为 JSON
   */
  toJSON(): CardPatternInfo {
    return {
      type: this.type,
      rank: this.rank,
      length: this.count,
      value: this.value,
      cardCount: this.cardCount,
    }
  }

  // ==================== 静态工厂方法 ====================

  /**
   * 从牌张创建牌型
   */
  static create(cards: Card[]): CardPatternVO {
    const pattern = this.detectPattern(cards)
    if (!pattern) {
      return new CardPatternVO(
        CardPatternType.INVALID,
        cards,
        '',
        0,
        0,
        cards.length,
        false
      )
    }
    return pattern
  }

  /**
   * 创建空牌型
   */
  static empty(): CardPatternVO {
    return new CardPatternVO(
      CardPatternType.INVALID,
      [],
      '',
      0,
      0,
      0,
      false
    )
  }

  /**
   * 创建单张
   */
  static single(card: Card): CardPatternVO {
    return new CardPatternVO(
      CardPatternType.SINGLE,
      [card],
      card.rankName || card.rank,
      1,
      card.value,
      1,
      true
    )
  }

  /**
   * 创建对子
   */
  static pair(card1: Card, card2: Card): CardPatternVO {
    if (card1.rank !== card2.rank) {
      return this.empty()
    }
    const maxCard = card1.value > card2.value ? card1 : card2
    return new CardPatternVO(
      CardPatternType.PAIR,
      [card1, card2],
      maxCard.rankName || maxCard.rank,
      1,
      maxCard.value,
      2,
      true
    )
  }

  /**
   * 创建三张
   */
  static triple(card1: Card, card2: Card, card3: Card): CardPatternVO {
    const ranks = [card1.rank, card2.rank, card3.rank].sort()
    if (ranks[0] !== ranks[1] || ranks[1] !== ranks[2]) {
      return this.empty()
    }
    const maxCard = card1.value > card2.value ? card1 : card3
    return new CardPatternVO(
      CardPatternType.TRIPLE,
      [card1, card2, card3],
      maxCard.rankName || maxCard.rank,
      1,
      maxCard.value,
      3,
      true
    )
  }

  /**
   * 创建三带二（一对）
   */
  static tripleTwo(tripleCards: readonly Card[], pairCards: Card[]): CardPatternVO {
    if (tripleCards.length !== 3 || pairCards.length !== 2) {
      return this.empty()
    }
    const maxTriple = tripleCards[0].value > tripleCards[1].value ? tripleCards[0] : tripleCards[1]
    const maxCard = maxTriple.value > pairCards[0].value ? maxTriple : pairCards[0]
    return new CardPatternVO(
      CardPatternType.TRIPLE_TWO,
      [...tripleCards, ...pairCards],
      maxCard.rankName || maxCard.rank,
      1,
      maxCard.value,
      5,
      true
    )
  }

  /**
   * 创建顺子（5张，含A、2）
   * A在顺子中位置灵活，可与2组成 1-2-3-4-5, 2-3-4-5-6, 1-2-3-4-5 < 2-3-4-5-6
   * 注意：A(14)和2(2)的值需要特殊处理，因为14 > 2
   */
  static straight(cards: Card[]): CardPatternVO {
    if (cards.length !== 5) return this.empty()

    // 检查是否包含大小王
    for (const card of cards) {
      if (card.isJoker) return this.empty()
    }

    const sortedCards = [...cards].sort((a, b) => this.getCardValue(a.rank, false) - this.getCardValue(b.rank, false))

    const values = sortedCards.map(c => this.getCardValue(c.rank, false))

    // 掼蛋规则：顺子是任意5张连续的牌
    // A可以表示为1（用于A,2,3,4,5顺子）
    // 2通常是最小或最大之一
    // 允许的顺子模式：
    // 1. 2,3,4,5,6
    // 2. A(1),2,3,4,5

    // 检查是否所有相邻牌都连续（使用getCardValue）
    let isContinuous = true
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1) {
        isContinuous = false
        break
      }
    }

    // 特殊情况：A,2,3,4,5 (1,2,3,4,5)
    const hasA = sortedCards.some(c => c.rank === 'A')
    const has2 = sortedCards.some(c => c.rank === '2')
    const isA2Sequence = hasA && has2 && values.includes(1) && values.includes(2)

    if (!isContinuous && !isA2Sequence) {
      return this.empty()
    }

    // 顺子以最大牌点数为主（使用原始卡牌值）
    const maxCard = sortedCards[sortedCards.length - 1]
    return new CardPatternVO(
      CardPatternType.STRAIGHT,
      sortedCards,
      maxCard.rankName || maxCard.rank,
      1,
      maxCard.value,
      cards.length,
      true
    )
  }

  /**
   * 创建连对（3连对，6张）
   */
  static pairStraight(cards: Card[]): CardPatternVO {
    if (cards.length !== 6) return this.empty()

    // 连对不能包含大小王
    for (const card of cards) {
      if (card.isJoker) return this.empty()
    }

    const pairs = this.groupByRank(cards)
    const pairCount = Object.keys(pairs).length
    if (pairCount < 3) return this.empty()

    const sortedRanks = Object.keys(pairs).sort((a, b) => this.getCardValue(a, true) - this.getCardValue(b, true))

    // 检查是否连续
    for (let i = 1; i < sortedRanks.length; i++) {
      if (this.getCardValue(sortedRanks[i]) !== this.getCardValue(sortedRanks[i - 1]) + 1) {
        return this.empty()
      }
    }

    const maxCard = this.getCardByRank(cards, sortedRanks[sortedRanks.length - 1])
    return new CardPatternVO(
      CardPatternType.PAIR_STRAIGHT,
      cards,
      maxCard.rankName || maxCard.rank,
      sortedRanks.length,
      maxCard.value,
      cards.length,
      true
    )
  }

  /**
   * 获取卡牌的数值（用于排序和比较）
   * @param rank 卡牌点数
   * @param useAas1 是否将A视为1（用于A,2,3,4,5顺子）
   */
  private static getCardValue(rank: string, useAas1: boolean = false): number {
    if (useAas1 && rank === 'A') {
      return 1
    }
    const rankValues: Record<string, number> = {
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      'J': 11,
      'Q': 12,
      'K': 13,
      'A': 14
    }
    return rankValues[rank] || parseInt(rank)
  }

  /**
   * 创建飞机（只能6张，2个三张，不带翅膀）
   */
  static plane(cards: Card[]): CardPatternVO {
    // 只能是6张（2个三张）
    if (cards.length !== 6) return this.empty()

    const groupCount = this.getGroupCount(cards, 3)
    if (groupCount !== 2) return this.empty()

    // 获取所有三张的组
    const ranksWithTriple: string[] = []
    const counts = this.groupByRank(cards)

    for (const [rank, group] of Object.entries(counts)) {
      if (group.length === 3) {
        ranksWithTriple.push(rank)
      }
    }

    // 排序点数
    ranksWithTriple.sort((a, b) => this.getCardValue(a, true) - this.getCardValue(b, true))

    // 检查是否连续
    for (let i = 1; i < ranksWithTriple.length; i++) {
      if (this.getCardValue(ranksWithTriple[i], true) !== this.getCardValue(ranksWithTriple[i - 1], true) + 1) {
        return this.empty()
      }
    }

    const maxCard = this.getCardByRank(cards, ranksWithTriple[ranksWithTriple.length - 1])
    return new CardPatternVO(
      CardPatternType.PLANE,
      cards,
      maxCard.rankName || maxCard.rank,
      ranksWithTriple.length,
      maxCard.value,
      6,
      true
    )
  }

  /**
   * 创建炸弹（4张至8张相同）
   */
  static bomb(cards: Card[]): CardPatternVO {
    if (cards.length < 4 || cards.length > 8) return this.empty()

    const counts = this.groupByRank(cards)
    if (Object.keys(counts).length !== 1) return this.empty()

    const [rank] = Object.keys(counts)
    const maxCard = this.getCardByRank(cards, rank)
    return new CardPatternVO(
      CardPatternType.BOMB,
      cards,
      maxCard.rankName || maxCard.rank,
      1,
      maxCard.value,
      cards.length,
      true
    )
  }

  /**
   * 获取炸弹（四张及以上相同）
   */
  static getBombs(cards: Card[]): CardPatternVO[] {
    const result: CardPatternVO[] = []
    const groups = this.groupByRank(cards)

    for (const [rank, group] of Object.entries(groups)) {
      for (let count = 4; count <= 8; count++) {
        if (group.length >= count) {
          const bombCards = group.slice(0, count)
          const pattern = this.bomb(bombCards)
          if (pattern.isValid) result.push(pattern)
        }
      }
    }

    return result
  }

  /**
   * 创建王炸（大小王）
   */
  static rocket(smallJoker: Card, bigJoker: Card): CardPatternVO {
    if (!smallJoker.isJoker || !bigJoker.isJoker) {
      return this.empty()
    }
    // 确保是小王和大王
    if (!smallJoker.jokerType! || !bigJoker.jokerType!) {
      return this.empty()
    }
    if (smallJoker.jokerType === bigJoker.jokerType) {
      return this.empty()
    }
    return new CardPatternVO(
      CardPatternType.ROCKET,
      [smallJoker, bigJoker],
      'JOKER',
      1,
      100,  // 王炸有固定最大值
      2,
      true
    )
  }


  /**
   * 检测牌型
   */
  private static detectPattern(cards: Card[]): CardPatternVO | null {
    const sortedCards = [...cards].sort((a, b) => a.value - b.value)

    // 检查是否包含大小王
    const jokers = sortedCards.filter(c => c.isJoker)
    if (jokers.length === 2) {
      const [joker1, joker2] = jokers
      return this.rocket(joker1, joker2)
    }

    const counts = this.groupByRank(cards)

    // 检查炸弹（4张到8张）
    if (cards.length >= 4 && cards.length <= 8 && Object.keys(counts).length === 1) {
      return this.bomb(cards)
    }

    // 检查单张
    if (cards.length === 1) {
      return this.single(cards[0])
    }

    // 检查对子
    if (cards.length === 2 && Object.keys(counts).length === 1) {
      return this.pair(cards[0], cards[1])
    }

    // 检查三张
    if (cards.length === 3 && Object.keys(counts).length === 1) {
      return this.triple(cards[0], cards[1], cards[2])
    }

    // 检查三带二
    if (cards.length === 5) {
      for (const [rank, group] of Object.entries(counts)) {
        if (group.length === 3) {
          const remaining = cards.filter(c => c.rank !== rank)
          return this.tripleTwo(group, remaining)
        }
      }
    }

    // 检查顺子
    const straight = this.straight(sortedCards)
    if (straight.isValid) return straight

    // 检查连对
    const pairStraight = this.pairStraight(cards)
    if (pairStraight.isValid) return pairStraight

    // 检查飞机
    const plane = this.plane(cards)
    if (plane.isValid) return plane

    return null
  }

  /**
   * 按点数分组
   */
  private static groupByRank(cards: Card[]): Record<string, Card[]> {
    const groups: Record<string, Card[]> = {}
    for (const card of cards) {
      if (!groups[card.rank]) {
        groups[card.rank] = []
      }
      groups[card.rank].push(card)
    }
    return groups
  }

  /**
   * 按数量分组（返回指定数量的组数）
   */
  private static groupByCount(cards: Card[], count: number): Card[] {
    const groups: Card[] = []
    const counts = this.groupByRank(cards)

    for (const [rank, group] of Object.entries(counts)) {
      if (group.length === count) {
        groups.push(...group)
      }
    }

    return groups
  }

  /**
   * 获取指定数量的组数（用于飞机等牌型）
   */
  private static getGroupCount(cards: Card[], count: number): number {
    const counts = this.groupByRank(cards)

    let groupCount = 0
    for (const group of Object.values(counts)) {
      if (group.length === count) {
        groupCount++
      }
    }

    return groupCount
  }

  /**
   * 获取指定点数的牌
   */
  private static getCardByRank(cards: Card[], rank: string): Card {
    return cards.find(c => c.rank === rank) || cards[0]
  }

  /**
   * 验证牌型
   */
  static validate(cards: Card[]): CardPatternValidateResult {
    const pattern = this.create(cards)
    return {
      valid: pattern.isValid,
      patternType: pattern.type,
      message: pattern.isValid ? '' : '无效的牌型',
    }
  }

  /**
   * 获取所有可能的牌型（用于AI决策）
   */
  static getAllPossiblePatterns(cards: Card[]): CardPatternVO[] {
    const result: CardPatternVO[] = []

    // 1. 单张
    for (const card of cards) {
      const pattern = this.single(card)
      if (pattern.isValid) result.push(pattern)
    }

    // 2. 对子
    const pairs = this.getPairs(cards)
    for (const pair of pairs) {
      result.push(pair)
    }

    // 3. 三张
    const triples = this.getTriples(cards)
    for (const triple of triples) {
      result.push(triple)
    }

    // 4. 三带二
    const tripleTwos = this.getTripleTwos(cards)
    for (const pattern of tripleTwos) {
      result.push(pattern)
    }

    // 6. 顺子
    const straights = this.getStraights(cards)
    for (const straight of straights) {
      result.push(straight)
    }

    // 7. 连对
    const pairStraights = this.getPairStraights(cards)
    for (const pattern of pairStraights) {
      result.push(pattern)
    }

    // 8. 炸弹
    const bombs = this.getBombs(cards)
    for (const bomb of bombs) {
      result.push(bomb)
    }

    // 9. 王炸
    const jokers = cards.filter(c => c.isJoker)
    if (jokers.length === 2) {
      const rocket = this.rocket(jokers[0], jokers[1])
      if (rocket.isValid) result.push(rocket)
    }

    // 10. 飞机
    const planes = this.getPlanes(cards)
    for (const plane of planes) {
      result.push(plane)
    }

    return result
  }

  /**
   * 获取所有对子
   */
  private static getPairs(cards: Card[]): CardPatternVO[] {
    const groups = this.groupByRank(cards)
    const pairs: CardPatternVO[] = []

    for (const [rank, group] of Object.entries(groups)) {
      if (group.length >= 2) {
        for (let i = 0; i < group.length - 1; i++) {
          const pattern = this.pair(group[i], group[i + 1])
          if (pattern.isValid) pairs.push(pattern)
        }
      }
    }

    return pairs
  }

  /**
   * 获取所有三张
   */
  private static getTriples(cards: Card[]): CardPatternVO[] {
    const groups = this.groupByRank(cards)
    const triples: CardPatternVO[] = []

    for (const [rank, group] of Object.entries(groups)) {
      if (group.length >= 3) {
        const pattern = this.triple(group[0], group[1], group[2])
        if (pattern.isValid) triples.push(pattern)
      }
    }

    return triples
  }

  /**
   * 获取所有三带二
   */
  private static getTripleTwos(cards: Card[]): CardPatternVO[] {
    const result: CardPatternVO[] = []
    const groups = this.groupByRank(cards)

    for (const [rank, group] of Object.entries(groups)) {
      if (group.length >= 3) {
        const remaining = cards.filter(c => c.rank !== rank)
        const pairs = this.getPairs(remaining)
        for (const pair of pairs) {
          const pattern = this.tripleTwo(group.slice(0, 3), [...pair.cards])
          if (pattern.isValid) result.push(pattern)
        }
      }
    }

    return result
  }

  /**
   * 获取所有顺子
   */
  private static getStraights(cards: Card[]): CardPatternVO[] {
    const result: CardPatternVO[] = []
    const uniqueCards = Array.from(new Set(cards.map(c => c.rank)))
    const sortedRanks = uniqueCards
      .filter(r => r !== '2')
      .sort((a, b) => parseInt(a) - parseInt(b))

    for (let i = 0; i <= sortedRanks.length - 5; i++) {
      const length = sortedRanks.length - i
      if (length < 5) break

      let isStraight = true
      const straightCards: Card[] = []

      for (let j = i; j < i + length; j++) {
        const rank = sortedRanks[j]
        const cardsOfRank = cards.filter(c => c.rank === rank)
        if (cardsOfRank.length !== 1) {
          isStraight = false
          break
        }
        straightCards.push(cardsOfRank[0])
      }

      if (isStraight) {
        const pattern = this.straight(straightCards)
        if (pattern.isValid) result.push(pattern)
      }
    }

    return result
  }

  /**
   * 获取所有连对
   */
  private static getPairStraights(cards: Card[]): CardPatternVO[] {
    const result: CardPatternVO[] = []
    const uniqueRanks = Array.from(new Set(cards.map(c => c.rank)))
    const sortedRanks = uniqueRanks
      .filter(r => r !== '2')
      .sort((a, b) => this.getCardValue(a, false) - this.getCardValue(b, false))

    for (let i = 0; i <= sortedRanks.length - 3; i++) {
      const length = sortedRanks.length - i
      if (length < 3) break

      let isPairStraight = true
      const pairStraightCards: Card[] = []

      for (let j = i; j < i + length; j++) {
        const rank = sortedRanks[j]
        const cardsOfRank = cards.filter(c => c.rank === rank)
        if (cardsOfRank.length < 2) {
          isPairStraight = false
          break
        }
        pairStraightCards.push(cardsOfRank[0], cardsOfRank[1])
      }

      if (isPairStraight) {
        const pattern = this.pairStraight(pairStraightCards)
        if (pattern.isValid) result.push(pattern)
      }
    }

    return result
  }

  /**
   * 获取所有飞机（只能6张，2个三张）
   */
  private static getPlanes(cards: Card[]): CardPatternVO[] {
    const result: CardPatternVO[] = []

    // 只能检查2个连续的三张
    const triples = this.groupByCount(cards, 3)
    const sortedRanks = triples.map(t => t.rank).sort((a, b) => this.getCardValue(a, true) - this.getCardValue(b, true))

    // 至少需要2个三张
    if (sortedRanks.length < 2) return result

    // 检查前2个三张是否连续
    for (let i = 0; i < sortedRanks.length - 1; i++) {
      const rank1 = sortedRanks[i]
      const rank2 = sortedRanks[i + 1]

      // 检查是否连续
      if (this.getCardValue(rank2, true) !== this.getCardValue(rank1, true) + 1) continue

      // 收集飞机主牌
      const planeCards: Card[] = []
      for (const rank of [rank1, rank2]) {
        const group = this.groupByRank(cards)[rank]
        planeCards.push(...group.slice(0, 3))
      }

      // 检查是否包含2和大小王
      for (const card of planeCards) {
        if (card.rank === '2' || card.isJoker) continue
      }

      // 检查是否带翅膀
      const wingCards = cards.filter(c => {
        return !planeCards.some(pc => pc.rank === c.rank)
      })

      if (wingCards.length === 0) {
        // 飞机不带
        const pattern = this.plane(planeCards)
        if (pattern.isValid) result.push(pattern)
      }
    }

    return result
  }
}
