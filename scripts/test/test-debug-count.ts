/**
 * 调试 groupByCount
 */

import { Card } from '../../lib/domain/entities/Card.ts'
import { CardPatternVO } from '../../lib/domain/value-objects/CardPatternVO.ts'

console.log('=== 调试 groupByCount ===\n')

const spade3 = new Card('s1', 'spade', '3', 3)
const spade4 = new Card('s2', 'spade', '4', 4)

// 测试 groupByCount
const triples = CardPatternVO['groupByCount']([spade3, spade3, spade3, spade4, spade4, spade4], 3)
console.log('triples:', triples)
console.log('triples.length:', triples.length)
if (triples.length > 0) {
  console.log('triples[0].rank:', triples[0].rank)
}
console.log()

// 测试 rank 解析
const sortedRanks = triples.map(t => t.rank).sort((a, b) => parseInt(a) - parseInt(b))
console.log('sortedRanks:', sortedRanks)
console.log('sortedRanks[0]:', sortedRanks[0], parseInt(sortedRanks[0]))
console.log('sortedRanks[1]:', sortedRanks[1], parseInt(sortedRanks[1]))
console.log('Is continuous?', parseInt(sortedRanks[1]) === parseInt(sortedRanks[0]) + 1)
