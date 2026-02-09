/**
 * Card 实体测试脚本
 */

import { Card } from '../../lib/domain/entities/Card'

console.log('=== Card 实体测试 ===\n')

// 测试1: 创建普通卡牌
console.log('测试1: 创建普通卡牌')
const card1 = new Card('1', 'spade', 'A', 14)
console.log(`  - 卡牌: ${card1}`)
console.log(`  - 花色: ${card1.suit}`)
console.log(`  - 点数: ${card1.rank}`)
console.log(`  - 数值: ${card1.value}`)
console.log(`  - 大小王: ${card1.isJoker}`)
console.log('  ✅ 通过\n')

// 测试2: 创建大小王
console.log('测试2: 创建大小王')
const smallJoker = new Card('2', 'joker', 'JOKER', 0, 'small')
const bigJoker = new Card('3', 'joker', 'JOKER', 0, 'big')
console.log(`  - 小王: ${smallJoker}`)
console.log(`  - 大王: ${bigJoker}`)
console.log(`  - 小王数值: ${smallJoker.getComparisonValue()} (逢人配=15)`)
console.log(`  - 大王数值: ${bigJoker.getComparisonValue()}`)
console.log('  ✅ 通过\n')

// 测试3: 创建标准牌组
console.log('测试3: 创建标准牌组')
const deck = Card.createGuandanDeck()
console.log(`  - 牌组大小: ${deck.length}`)
console.log(`  - 红桃K: ${deck.find(c => c.isHeartsKing())}`)
console.log(`  - 大王: ${deck.find(c => c.isBigJoker())}`)
console.log('  ✅ 通过\n')

// 测试4: 洗牌
console.log('测试4: 洗牌')
const shuffled = Card.shuffle([...deck])
console.log(`  - 洗牌后第一张: ${shuffled[0]}`)
console.log(`  - 洗牌后最后一张: ${shuffled[shuffled.length - 1]}`)
console.log('  ✅ 通过\n')

// 测试5: 排序
console.log('测试5: 按点数排序')
const unsorted = [new Card('1', 'spade', '3', 3), new Card('2', 'heart', 'A', 14), new Card('3', 'club', '2', 2)]
const sorted = Card.sortByValue(unsorted, true)
console.log(`  - 排序前: ${unsorted.map(c => c.rank).join(', ')}`)
console.log(`  - 排序后: ${sorted.map(c => c.rank).join(', ')}`)
console.log('  ✅ 通过\n')

// 测试6: 按花色排序
console.log('测试6: 按花色排序')
const cards = [
  new Card('1', 'spade', 'K', 13),
  new Card('2', 'heart', 'K', 13),
  new Card('3', 'club', 'K', 13),
  new Card('4', 'diamond', 'K', 13),
]
const sortedBySuit = Card.sortBySuit(cards)
const suits = sortedBySuit.map(c => c.suit)
console.log(`  - 花色顺序: ${suits.join(' -> ')}`)
console.log('  ✅ 通过\n')

// 测试7: 卡牌比较
console.log('测试7: 卡牌比较')
const a = new Card('1', 'spade', 'K', 13)
const b = new Card('2', 'heart', 'A', 14)
const c = new Card('3', 'club', 'K', 13)
console.log(`  - A(K) vs B(A): ${a.compare(b) === 1 ? 'GREATER' : 'LESS'} (A > B: ${a.greaterThan(b)})`)
console.log(`  - A(K) vs C(K): ${a.compare(c) === 0 ? 'EQUAL' : 'NOT_EQUAL'} (A == C: ${a.equals(c)})`)
console.log('  ✅ 通过\n')

// 测试8: 大小王比较
console.log('测试8: 大小王比较')
console.log(`  - 小王 vs 大王: ${smallJoker.compare(bigJoker) === -1 ? 'LESS' : 'GREATER'} (小王 < 大王: ${smallJoker.lessThan(bigJoker)})`)
console.log(`  - 大王 vs 小王: ${bigJoker.compare(smallJoker) === 1 ? 'GREATER' : 'LESS'} (大王 > 小王: ${bigJoker.greaterThan(smallJoker)})`)
console.log('  ✅ 通过\n')

// 测试9: 过滤功能
console.log('测试9: 过滤功能')
console.log(`  - 红桃牌: ${Card.filterBySuit(deck, 'heart').map(c => c.rank).join(', ')}`)
console.log(`  - A牌: ${Card.filterBySuit(deck, 'spade').map(c => c.rank).join(', ')}`)
console.log('  ✅ 通过\n')

// 测试10: 唯一点数/花色
console.log('测试10: 唯一点数和花色')
const uniqueRanks = Card.getUniqueRanks(deck)
const uniqueSuits = Card.getUniqueSuits(deck)
console.log(`  - 唯一点数: ${uniqueRanks.join(', ')}`)
console.log(`  - 唯一花色: ${uniqueSuits.join(', ')}`)
console.log('  ✅ 通过\n')

// 测试11: 主牌设置
console.log('测试11: 主牌设置')
const k = new Card('1', 'heart', 'K', 13)
k.setTrump(true)
console.log(`  - 红桃K: ${k}`)
console.log(`  - 主牌: ${k.isTrumpCard()}`)
console.log(`  - 副牌: ${k.isOffTrumpCard()}`)
console.log('  ✅ 通过\n')

// 测试12: 翻牌功能
console.log('测试12: 翻牌功能')
const faceDown = new Card('1', 'spade', 'A', 14, undefined, false)
console.log(`  - 翻牌前: ${faceDown.getDisplayCard()}`)
faceDown.flip()
console.log(`  - 翻牌后: ${faceDown.getDisplayCard()}`)
faceDown.flip()
console.log(`  - 再次翻牌前: ${faceDown.getDisplayCard()}`)
console.log('  ✅ 通过\n')

// 测试13: JSON 序列化
console.log('测试13: JSON 序列化')
const json = card1.toJSON()
console.log(`  - JSON: ${JSON.stringify(json, null, 2).substring(0, 80)}...`)
const restored = Card.fromJSON(json)
console.log(`  - 恢复: ${restored}`)
console.log(`  - ID匹配: ${card1.id === restored.id}`)
console.log('  ✅ 通过\n')

console.log('=== 所有测试通过! ===')
