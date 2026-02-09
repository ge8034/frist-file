/**
 * 卡牌实体
 *
 * 掼蛋游戏卡牌实体
 * - 有唯一标识
 * - 状态不可变（符合实体特性）
 * - 提供卡牌比较和格式化功能
 */

import { v4 as uuidv4 } from 'uuid'
import type { CardSuit, CardRank, JokerType } from '../../types/game'

/**
 * 卡牌比较结果
 */
export enum CardComparison {
  /** 卡牌更小 */
  LESS = -1,
  /** 卡牌相等 */
  EQUAL = 0,
  /** 卡牌更大 */
  GREATER = 1,
}

/**
 * 卡牌花色优先级（从高到低）
 */
const SUIT_PRIORITY = {
  heart: 4,    // 红桃
  diamond: 3,  // 方块
  club: 2,     // 梅花
  spade: 1,    // 黑桃
  joker: 0,    // 大小王（实际比较时不会用到，仅用于类型安全）
}

/**
 * 点数优先级（从高到低）
 */
const RANK_PRIORITY = {
  A: 14,
  2: 2,        // 2是最大点数之一
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  JOKER: 15,
}

/**
 * 大小王优先级
 */
const JOKER_PRIORITY = {
  small: 16,   // 小王
  big: 17,     // 大王（最大）
}
// 逢人配优先级 = 15

/**
 * 卡牌实体
 *
 * 领域驱动设计原则：
 * - 有唯一标识（UUID）
 * - 不可变数据（通过构造函数验证）
 * - 封装卡牌行为
 */
export class Card {
  /**
   * 卡牌唯一标识
   */
  readonly id: string

  /**
   * 卡牌花色
   */
  readonly suit: CardSuit

  /**
   * 卡牌点数
   */
  readonly rank: CardRank

  /**
   * 点数显示名称
   */
  readonly rankName: string

  /**
   * 花色显示名称（Unicode符号）
   */
  readonly suitName: string

  /**
   * 大小王类型（仅限大小王）
   */
  readonly jokerType?: JokerType

  /**
   * 数值（用于牌型比较）
   */
  readonly value: number

  /**
   * 是否是大小王
   */
  readonly isJoker: boolean

  /**
   * 是否是主牌（红桃K或大小王）
   */
  isTrump?: boolean

  /**
   * 是否是副牌
   */
  isOffTrump?: boolean

  /**
   * 是否被激活（可用于翻牌逻辑）
   */
  isFaceUp: boolean

  /**
   * 创建卡牌实体
   */
  constructor(
    id?: string,
    suit: CardSuit = 'spade',
    rank: CardRank = '2',
    value: number = 0,
    jokerType?: JokerType,
    isFaceUp: boolean = true
  ) {
    this.id = id || uuidv4()
    this.suit = suit
    this.rank = rank
    this.value = value
    this.jokerType = jokerType
    this.isJoker = jokerType !== undefined
    this.isFaceUp = isFaceUp

    // 设置显示名称
    this.rankName = this.getRankName(rank)
    this.suitName = this.getSuitName(suit)

    // 验证数据
    this.validate()
  }

  /**
   * 获取花色显示名称
   */
  private getSuitName(suit: CardSuit): string {
    switch (suit) {
      case 'spade':
        return '♠'
      case 'heart':
        return '♥'
      case 'club':
        return '♣'
      case 'diamond':
        return '♦'
      case 'joker':
        return '🤡'
      default:
        return suit
    }
  }

  /**
   * 获取点数显示名称
   */
  private getRankName(rank: CardRank): string {
    return rank
  }

  /**
   * 获取卡牌数值（用于牌型计算）
   */
  private getCardValue(): number {
    if (this.isJoker) {
      return JOKER_PRIORITY[this.jokerType!]
    }
    return RANK_PRIORITY[this.rank] || 0
  }

  /**
   * 验证卡牌数据有效性
   */
  private validate(): void {
    if (this.isJoker && (!this.jokerType || !['small', 'big'].includes(this.jokerType))) {
      throw new Error(`无效的大小王类型: ${this.jokerType}`)
    }
  }

  /**
   * 获取卡牌比较值（用于排序）
   */
  getComparisonValue(): number {
    if (this.isJoker) {
      return JOKER_PRIORITY[this.jokerType!]
    }
    return RANK_PRIORITY[this.rank] || 0
  }

  /**
   * 比较两张卡牌的优先级
   * @returns CardComparison: -1(更小), 0(相等), 1(更大)
   */
  compare(other: Card): CardComparison {
    // 大小王特殊处理
    if (this.isJoker && other.isJoker) {
      if (this.jokerType === 'big') return CardComparison.GREATER
      if (this.jokerType === 'small') return CardComparison.LESS
      return CardComparison.EQUAL
    }

    if (this.isJoker) return CardComparison.GREATER
    if (other.isJoker) return CardComparison.LESS

    // 普通卡牌比较：点数优先，同点数时花色优先
    const thisValue = this.getCardValue()
    const otherValue = other.getCardValue()

    if (thisValue !== otherValue) {
      return thisValue > otherValue
        ? CardComparison.GREATER
        : CardComparison.LESS
    }

    // 同点数比较花色
    const thisSuitPriority = SUIT_PRIORITY[this.suit] || 0
    const otherSuitPriority = SUIT_PRIORITY[other.suit] || 0

    return thisSuitPriority > otherSuitPriority
      ? CardComparison.GREATER
      : CardComparison.LESS
  }

  /**
   * 检查是否大于另一张卡牌
   */
  greaterThan(other: Card): boolean {
    return this.compare(other) === CardComparison.GREATER
  }

  /**
   * 检查是否小于另一张卡牌
   */
  lessThan(other: Card): boolean {
    return this.compare(other) === CardComparison.LESS
  }

  /**
   * 检查是否等于另一张卡牌
   */
  equals(other: Card): boolean {
    return this.id === other.id || (this.suit === other.suit && this.rank === other.rank)
  }

  /**
   * 检查是否是大小王
   */
  isJokerCard(): boolean {
    return this.isJoker
  }

  /**
   * 检查是否是主牌
   */
  isTrumpCard(): boolean {
    return this.isTrump === true
  }

  /**
   * 检查是否是副牌
   */
  isOffTrumpCard(): boolean {
    return this.isOffTrump === true
  }

  /**
   * 检查是否是红桃K
   */
  isHeartsKing(): boolean {
    return this.suit === 'heart' && this.rank === 'K'
  }

  /**
   * 检查是否是大小王
   */
  isBigJoker(): boolean {
    return this.isJoker && this.jokerType === 'big'
  }

  /**
   * 检查是否是小王
   */
  isSmallJoker(): boolean {
    return this.isJoker && this.jokerType === 'small'
  }

  /**
   * 设置主牌状态
   */
  setTrump(isTrump: boolean): void {
    this.isTrump = isTrump
    this.isOffTrump = !isTrump
  }

  /**
   * 翻转卡牌（从正面到背面，或反之）
   */
  flip(): void {
    this.isFaceUp = !this.isFaceUp
  }

  /**
   * 获取卡牌简洁显示
   */
  toString(): string {
    if (this.isJoker) {
      return this.jokerType === 'big' ? '大王' : '小王'
    }
    return `${this.rankName}${this.suitName}`
  }

  /**
   * 获取完整卡牌描述
   */
  toDescription(): string {
    if (this.isJoker) {
      return this.jokerType === 'big' ? '大王' : '小王'
    }
    return `${this.rankName}${this.suitName}`
  }

  /**
   * 获取显示用卡牌（如果未翻开）
   */
  getDisplayCard(): string {
    return this.isFaceUp ? this.toString() : '🎴'
  }

  /**
   * 转换为简化的 JSON 对象
   */
  toJSON(): object {
    return {
      id: this.id,
      suit: this.suit,
      rank: this.rank,
      value: this.value,
      isJoker: this.isJoker,
      jokerType: this.jokerType,
      isFaceUp: this.isFaceUp,
      isTrump: this.isTrump,
      isOffTrump: this.isOffTrump,
    }
  }

  /**
   * 从 JSON 对象创建卡牌
   */
  static fromJSON(json: any): Card {
    return new Card(
      json.id,
      json.suit,
      json.rank,
      json.value,
      json.jokerType,
      json.isFaceUp
    )
  }

  /**
   * 创建标准54张牌组
   */
  static createStandardDeck(): Card[] {
    const deck: Card[] = []

    // 普通花色牌 (A-K)
    const suits: CardSuit[] = ['spade', 'heart', 'club', 'diamond']
    for (const suit of suits) {
      for (const rank in RANK_PRIORITY) {
        if (rank !== '2') { // 跳过2，后面单独添加
          const value = RANK_PRIORITY[rank as CardRank]
          deck.push(new Card(undefined, suit, rank as CardRank, value))
        }
      }
    }

    // 添加2
    for (const suit of suits) {
      deck.push(new Card(undefined, suit, '2', 2))
    }

    // 添加大小王
    deck.push(new Card(undefined, 'joker', 'JOKER', 0, 'small'))
    deck.push(new Card(undefined, 'joker', 'JOKER', 0, 'big'))

    return deck
  }

  /**
   * 创建简化牌组（掼蛋常用54张）
   */
  static createGuandanDeck(): Card[] {
    const deck: Card[] = []

    // 普通花色牌
    const suits: CardSuit[] = ['spade', 'heart', 'club', 'diamond']
    for (const suit of suits) {
      for (const rank in RANK_PRIORITY) {
        const value = RANK_PRIORITY[rank as CardRank]
        deck.push(new Card(undefined, suit, rank as CardRank, value))
      }
    }

    // 添加大小王
    deck.push(new Card(undefined, 'joker', 'JOKER', 0, 'small'))
    deck.push(new Card(undefined, 'joker', 'JOKER', 0, 'big'))

    return deck
  }

  /**
   * 洗牌
   */
  static shuffle(cards: Card[]): Card[] {
    const shuffled = [...cards]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * 获取牌组中所有点数
   */
  static getUniqueRanks(cards: Card[]): CardRank[] {
    const ranks = new Set<CardRank>()
    cards.forEach(card => ranks.add(card.rank))
    return Array.from(ranks).sort((a, b) =>
      RANK_PRIORITY[b] - RANK_PRIORITY[a]
    )
  }

  /**
   * 获取牌组中所有花色
   */
  static getUniqueSuits(cards: Card[]): CardSuit[] {
    const suits = new Set<CardSuit>()
    cards.forEach(card => suits.add(card.suit))
    return Array.from(suits)
  }

  /**
   * 根据点数过滤卡牌
   */
  static filterByRank(cards: Card[], rank: CardRank): Card[] {
    return cards.filter(card => card.rank === rank)
  }

  /**
   * 根据花色过滤卡牌
   */
  static filterBySuit(cards: Card[], suit: CardSuit): Card[] {
    return cards.filter(card => card.suit === suit)
  }

  /**
   * 按数值排序
   */
  static sortByValue(cards: Card[], ascending = true): Card[] {
    return [...cards].sort((a, b) =>
      ascending ? a.getComparisonValue() - b.getComparisonValue() : b.getComparisonValue() - a.getComparisonValue()
    )
  }

  /**
   * 按花色排序
   */
  static sortBySuit(cards: Card[]): Card[] {
    return [...cards].sort((a, b) => {
      const suitPriority = (suit: CardSuit) => SUIT_PRIORITY[suit] || 0
      return suitPriority(b.suit) - suitPriority(a.suit)
    })
  }
}
