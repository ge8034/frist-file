/**
 * 调试飞机牌型
 */

import { Card } from '../../lib/domain/entities/Card.ts'
import { CardPatternVO } from '../../lib/domain/value-objects/CardPatternVO.ts'

console.log('=== 飞机牌型调试 ===\n')

// 创建测试卡牌
const spade3 = new Card('s1', 'spade', '3', 3)
const spade4 = new Card('s2', 'spade', '4', 4)
const spade5 = new Card('s3', 'spade', '5', 5)
const spadeK = new Card('s11', 'spade', 'K', 13)
const spadeA = new Card('s12', 'spade', 'A', 14)
const heart2 = new Card('h1', 'heart', '2', 2)

// 测试：6张，2个三张
console.log('测试1：6张，2个三张')
const planeCards1 = [spade3, spade3, spade3, spade4, spade4, spade4]
const plane1 = CardPatternVO.create(planeCards1)
console.log(`3,3,3, 4,4,4: ${plane1.isValid} (${plane1.type}, ${plane1.getDescription()})`)
console.log(`cards:`, plane1.cards.map(c => `${c.rank}`))
console.log()

// 测试：3张三张
console.log('测试2：3张三张')
const tripleCards = [spade3, spade3, spade3]
const triple = CardPatternVO.create(tripleCards)
console.log(`3,3,3: ${triple.isValid} (${triple.type}, ${triple.getDescription()})`)
console.log(`cards:`, triple.cards.map(c => `${c.rank}`))
console.log()

// 测试：5张三带二
console.log('测试3：5张三带二')
const tripleTwoCards = [spade3, spade3, spade3, spade4, spade4]
const tripleTwo = CardPatternVO.create(tripleTwoCards)
console.log(`3,3,3, 4,4: ${tripleTwo.isValid} (${tripleTwo.type}, ${tripleTwo.getDescription()})`)
console.log(`cards:`, tripleTwo.cards.map(c => `${c.rank}`))
console.log()
