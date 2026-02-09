/**
 * 卡牌值对象
 *
 * 封装卡牌的不可变属性和行为
 */

import type { CardSuit, CardRank, JokerType, PlayerType } from '../../types/game'

/**
 * 卡牌值对象
 *
 * 领域驱动设计原则：
 * - 不可变数据
 * - 值对象行为封装
 * - 通过构造函数验证数据有效性
 */
export class Card {
  /**
   * 卡牌唯一标识
   */
  readonly id: string

  /**
   * 花色
   */
  readonly suit: CardSuit

  /**
   * 点数
   */
  readonly rank: CardRank

  /**
   * 花色显示名称
   */
  readonly suitName: string

  /**
   * 点数显示名称
   */
  readonly rankName: string

  /**
   * 大小类型（仅限大小王）
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
   * 构造函数
   */
  constructor(
    id: string,
    suit: CardSuit,
    rank: CardRank,
    value: number,
    jokerType?: JokerType
  ) {
    this.id = id
    this.suit = suit
    this.rank = rank
    this.value = value
    this.jokerType = jokerType
    this.isJoker = jokerType !== undefined

    // 设置显示名称
    this.suitName = this.getSuitName(suit)
    this.rankName = this.getRankName(rank)
  }

  /**
   * 获取花色名称
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
   * 获取点数名称
   */
  private getRankName(rank: CardRank): string {
    return rank
  }

  /**
   * 检查是否是大小王
   */
  isJokerCard(): boolean {
    return this.isJoker
  }

  /**
   * 比较两张卡牌的数值
   * @returns 1 如果当前卡牌更大，-1 如果更小，0 如果相等
   */
  compareTo(other: Card): number {
    // 大小王规则：小王 < 大王
    if (this.isJokerCard() && other.isJokerCard()) {
      if (this.jokerType === 'big') return 1
      if (this.jokerType === 'small') return -1
      return 0
    }

    if (this.isJokerCard()) return 1
    if (other.isJokerCard()) return -1

    // 普通卡牌比较数值
    return this.value - other.value
  }

  /**
   * 比较两张卡牌是否相等
   */
  equals(other: Card): boolean {
    return (
      this.id === other.id ||
      (this.suit === other.suit && this.rank === other.rank)
    )
  }

  /**
   * 克隆卡牌
   */
  clone(): Card {
    return new Card(this.id, this.suit, this.rank, this.value, this.jokerType)
  }

  /**
   * 转换为简洁显示字符串
   */
  toString(): string {
    if (this.isJokerCard()) {
      return this.jokerType === 'big' ? '大王' : '小王'
    }
    return `${this.rankName}${this.suitName}`
  }

  /**
   * 转换为可读描述
   */
  toDescription(): string {
    if (this.isJokerCard()) {
      return this.jokerType === 'big' ? '大王' : '小王'
    }
    return `${this.rankName}${this.suitName}`
  }

  /**
   * 转换为 JSON 字符串
   */
  toJSON(): object {
    return {
      id: this.id,
      suit: this.suit,
      rank: this.rank,
      value: this.value,
      isJoker: this.isJoker,
      jokerType: this.jokerType,
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
      json.jokerType
    )
  }
}

/**
 * 卡牌集合值对象
 */
export class CardCollection {
  cards: Card[]

  constructor(cards: Card[] = []) {
    // 去重并保持顺序
    const seen = new Set<string>()
    this.cards = cards.filter(card => {
      if (seen.has(card.id)) return false
      seen.add(card.id)
      return true
    })
  }

  /**
   * 添加卡牌
   */
  addCards(cards: Card[]): void {
    const seen = new Set(this.cards.map(c => c.id))
    cards.forEach(card => {
      if (!seen.has(card.id)) {
        this.cards.push(card)
        seen.add(card.id)
      }
    })
  }

  /**
   * 移除卡牌
   */
  removeCards(cards: Card[]): void {
    const idsToRemove = new Set(cards.map(c => c.id))
    this.cards = this.cards.filter(card => !idsToRemove.has(card.id))
  }

  /**
   * 移除指定数值的所有卡牌
   */
  removeCardsByValue(value: number): void {
    this.cards = this.cards.filter(card => card.value !== value)
  }

  /**
   * 移除指定花色的所有卡牌
   */
  removeCardsBySuit(suit: CardSuit): void {
    this.cards = this.cards.filter(card => card.suit !== suit)
  }

  /**
   * 按数值排序
   */
  sortByValue(ascending = true): void {
    this.cards.sort((a, b) => ascending ? a.value - b.value : b.value - a.value)
  }

  /**
   * 获取卡牌数量
   */
  count(): number {
    return this.cards.length
  }

  /**
   * 获取所有卡牌
   */
  getAll(): Card[] {
    return [...this.cards]
  }

  /**
   * 清空集合
   */
  clear(): void {
    this.cards = []
  }

  /**
   * 检查是否为空
   */
  isEmpty(): boolean {
    return this.cards.length === 0
  }

  /**
   * 检查是否包含指定卡牌
   */
  contains(card: Card): boolean {
    return this.cards.some(c => c.equals(card))
  }

  /**
   * 按数值分组
   */
  groupByValue(): Map<number, Card[]> {
    const groups = new Map<number, Card[]>()
    this.cards.forEach(card => {
      if (!groups.has(card.value)) {
        groups.set(card.value, [])
      }
      groups.get(card.value)!.push(card)
    })
    return groups
  }

  /**
   * 按花色分组
   */
  groupBySuit(): Map<CardSuit, Card[]> {
    const groups = new Map<CardSuit, Card[]>()
    this.cards.forEach(card => {
      if (!groups.has(card.suit)) {
        groups.set(card.suit, [])
      }
      groups.get(card.suit)!.push(card)
    })
    return groups
  }

  /**
   * 克隆集合
   */
  clone(): CardCollection {
    return new CardCollection(this.cards)
  }
}
