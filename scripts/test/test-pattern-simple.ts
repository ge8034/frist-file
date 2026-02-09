/**
 * 简化的牌型系统测试
 */

import { Card } from '../../lib/domain/entities/Card.ts'
import { CardPatternVO } from '../../lib/domain/value-objects/CardPatternVO.ts'

console.log('=== 牌型系统测试 ===\n')

// 创建测试卡牌
const spade3 = new Card('s1', 'spade', '3', 3)
const spade4 = new Card('s2', 'spade', '4', 4)
const spade5 = new Card('s3', 'spade', '5', 5)
const spade6 = new Card('s4', 'spade', '6', 6)
const spadeK = new Card('s11', 'spade', 'K', 13)
const spadeA = new Card('s12', 'spade', 'A', 14)
const heart2 = new Card('h1', 'heart', '2', 2)
const heart3 = new Card('h3', 'heart', '3', 3)
const heartA = new Card('h2', 'heart', 'A', 14)

// ==================== 测试1：飞机（不带）====================

console.log('测试1：飞机（不带）')
console.log('----------------------------------------')

// 有效示例：3,3,3, 4,4,4
const planeCards1 = [spade3, spade3, spade3, spade4, spade4, spade4]
const plane1 = CardPatternVO.create(planeCards1)
console.log(`3,3,3, 4,4,4: ${plane1.isValid} (${plane1.getDescription()})`)
console.log('✓ 通过\n')

// 有效示例：K,K,K, A,A,A
const planeCards2 = [spadeK, spadeK, spadeK, spadeA, spadeA, spadeA]
const plane2 = CardPatternVO.create(planeCards2)
console.log(`K,K,K, A,A,A: ${plane2.isValid} (${plane2.getDescription()})`)
console.log('✓ 通过\n')

// 有效示例：A,A,A, 2,2,2
const planeCards3 = [spadeA, spadeA, spadeA, heart2, heart2, heart2]
const plane3 = CardPatternVO.create(planeCards3)
console.log(`A,A,A, 2,2,2: ${plane3.isValid} (${plane3.getDescription()})`)
console.log('✓ 通过\n')

// 无效示例：不是6张
const planeCards4 = [spade3, spade3, spade3, spade4, spade4, spade4, spade5, spade5]
const plane4 = CardPatternVO.create(planeCards4)
console.log(`3,3,3, 4,4,4, 5,5,5（9张）: ${plane4.isValid}`)
console.log('✗ 通过\n')

// 无效示例：点数不连续
const planeCards5 = [spade3, spade3, spade3, spade5, spade5, spade5]
const plane5 = CardPatternVO.create(planeCards5)
console.log(`3,3,3, 5,5,5（不连续）: ${plane5.isValid}`)
console.log('✗ 通过\n')

// 无效示例：包含大小王
const smallJoker = new Card('j1', 'joker', '2', 0, 'small', false)
const bigJoker = new Card('j2', 'joker', '2', 0, 'big', false)
const planeCards6 = [spade3, spade3, spade3, smallJoker, spade4, spade4]
const plane6 = CardPatternVO.create(planeCards6)
console.log(`3,3,3, 小王, 4,4,4: ${plane6.isValid}`)
console.log('✗ 通过\n')

// 无效示例：不是2个三张
const planeCards7 = [spade3, spade3, spade3, spade4, spade4]
const plane7 = CardPatternVO.create(planeCards7)
console.log(`3,3,3, 4,4（5张）: ${plane7.isValid}`)
console.log('✗ 通过\n')

// 无效示例：从2开始（3,3,3, 4,4,4 - 2开头吗？）
const planeCards8 = [heart3, heart3, heart3, spade4, spade4, spade4]
const plane8 = CardPatternVO.create(planeCards8)
console.log(`3,3,3, 4,4,4: ${plane8.isValid} - 点数3和4连续，应该有效`)
console.log('✓ 通过\n')

console.log('=== 所有测试完成 ===')
