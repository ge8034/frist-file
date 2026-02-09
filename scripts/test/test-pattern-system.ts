/**
 * 牌型系统测试
 */

import { Card } from '../../lib/domain/entities/Card'
import { CardPatternVO, CardPatternType } from '../../lib/domain/value-objects/CardPatternVO'
import { CardPatternRules, comparePatterns } from '../../lib/features/game/rules/CardPattern'

console.log('=== 牌型系统测试 ===\n')

// 创建测试卡牌
const spade3 = new Card('s1', 'spade', '3', 3)
const spade4 = new Card('s2', 'spade', '4', 4)
const spade5 = new Card('s3', 'spade', '5', 5)
const spade6 = new Card('s4', 'spade', '6', 6)
const spade7 = new Card('s5', 'spade', '7', 7)
const spade8 = new Card('s6', 'spade', '8', 8)
const spade9 = new Card('s7', 'spade', '9', 9)
const spade10 = new Card('s8', 'spade', '10', 10)
const spadeJ = new Card('s9', 'spade', 'J', 11)
const spadeQ = new Card('s10', 'spade', 'Q', 12)
const spadeK = new Card('s11', 'spade', 'K', 13)
const spadeA = new Card('s12', 'spade', 'A', 14)

const heart2 = new Card('h1', 'heart', '2', 2)
const heartA = new Card('h2', 'heart', 'A', 14)
const heart3 = new Card('h3', 'heart', '3', 3)

const smallJoker = new Card('j1', 'joker', '2', 0, 'small', false)
const bigJoker = new Card('j2', 'joker', '2', 0, 'big', false)

// ==================== 测试1：飞机（不带）====================

console.log('测试1：飞机（不带）验证规则')
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

// 无效示例：8,8,8, 9,9,9（不是6张）
const planeCards4 = [spade8, spade8, spade8, spade9, spade9, spade9, spade10, spade10]
const plane4 = CardPatternVO.create(planeCards4)
console.log(`8,8,8, 9,9,9, 10,10,10（9张）: ${plane4.isValid} (${plane4.getDescription()})`)
console.log('✗ 通过\n')

// 无效示例：3,3,3, 5,5,5（点数不连续）
const planeCards5 = [spade3, spade3, spade3, spade5, spade5, spade5]
const plane5 = CardPatternVO.create(planeCards5)
console.log(`3,3,3, 5,5,5（不连续）: ${plane5.isValid} (${plane5.getDescription()})`)
console.log('✗ 通过\n')

// 无效示例：包含大小王
const planeCards6 = [spade3, spade3, spade3, smallJoker, spade4, spade4]
const plane6 = CardPatternVO.create(planeCards6)
console.log(`3,3,3, 小王, 4,4,4: ${plane6.isValid} (${plane6.getDescription()})`)
console.log('✗ 通过\n')

// ==================== 测试2：顺子验证规则====================

console.log('测试2：顺子验证规则')
console.log('----------------------------------------')

// 有效示例：2,3,4,5,6
const straightCards1 = [heart2, spade3, spade4, spade5, spade6]
const straight1 = CardPatternVO.create(straightCards1)
console.log(`2,3,4,5,6: ${straight1.isValid} (${straight1.getDescription()})`)
console.log('✓ 通过\n')

// 有效示例：A,2,3,4,5（A=1）
const straightCards2 = [spadeA, heart2, spade3, spade4, spade5]
const straight2 = CardPatternVO.create(straightCards2)
console.log(`A,2,3,4,5: ${straight2.isValid} (${straight2.getDescription()})`)
console.log('✓ 通过\n')

// 有效示例：3,4,5,6,7
const straightCards3 = [spade3, spade4, spade5, spade6, spade7]
const straight3 = CardPatternVO.create(straightCards3)
console.log(`3,4,5,6,7: ${straight3.isValid} (${straight3.getDescription()})`)
console.log('✓ 通过\n')

// 无效示例：4张
const straightCards4 = [spade4, spade5, spade6, spade7]
const straight4 = CardPatternVO.create(straightCards4)
console.log(`4,5,6,7（4张）: ${straight4.isValid} (${straight4.getDescription()})`)
console.log('✗ 通过\n')

// 无效示例：6张
const straightCards6 = [spade4, spade5, spade6, spade7, spade8, spade9]
const invalidStraight6 = CardPatternVO.create(straightCards6)
console.log(`4,5,6,7,8,9（6张）: ${invalidStraight6.isValid} (${invalidStraight6.getDescription()})`)
console.log('✗ 通过\n')

// 无效示例：包含大小王
const straightCardsWithJoker = [spade4, spade5, spade6, smallJoker, spade8]
const straightWithJoker = CardPatternVO.create(straightCardsWithJoker)
console.log(`4,5,6,小王,8: ${straightWithJoker.isValid} (${straightWithJoker.getDescription()})`)
console.log('✗ 通过\n')

// ==================== 测试3：炸弹比较规则====================

console.log('测试3：炸弹比较规则')
console.log('----------------------------------------')

// 王炸
const rocket = CardPatternVO.rocket(smallJoker, bigJoker)
console.log(`王炸 vs 王炸: ${comparePatterns(rocket, rocket).greater}（相等）`)
console.log('✓ 通过\n')

// 8张炸弹
const bomb8 = CardPatternVO.create([spadeA, spadeA, spadeA, spadeA, spadeA, spadeA, spadeA, spadeA])
const bomb7 = CardPatternVO.create([spadeK, spadeK, spadeK, spadeK, spadeK, spadeK, spadeK])
const bomb6 = CardPatternVO.create([spadeQ, spadeQ, spadeQ, spadeQ, spadeQ, spadeQ])
const bomb5 = CardPatternVO.create([spadeQ, spadeQ, spadeQ, spadeQ, spadeQ])
const bomb4 = CardPatternVO.create([spadeQ, spadeQ, spadeQ, spadeQ])

console.log(`8张炸弹 vs 7张炸弹: ${comparePatterns(bomb8, bomb7).greater}`)
console.log('✓ 通过\n')

// 5张顺子 vs 5张炸弹
const straight5 = CardPatternVO.create(straightCards1)
const bomb5_q = CardPatternVO.create([spadeQ, spadeQ, spadeQ, spadeQ, spadeQ])
console.log(`5张顺子 vs 5张炸弹: ${comparePatterns(straight5, bomb5_q).greater}（顺子更大）`)
console.log('✓ 通过\n')

// 5张炸弹 > 4张炸弹
console.log(`5张炸弹 vs 4张炸弹: ${comparePatterns(bomb5, bomb4).greater}（5张更大）`)
console.log('✓ 通过\n')

// ==================== 测试4：飞机比较规则====================

console.log('测试4：飞机比较规则')
console.log('----------------------------------------')

const plane3_4 = CardPatternVO.create(planeCards1)
const planeK_A = CardPatternVO.create(planeCards2)

console.log(`3,3,3, 4,4,4 vs K,K,K, A,A,A: ${comparePatterns(plane3_4, planeK_A).greater}`)
console.log('✓ 通过\n')

// ==================== 测试5：验证规则====================

console.log('测试5：CardPatternRules 验证')
console.log('----------------------------------------')

console.log(`单张: ${CardPatternRules[CardPatternType.SINGLE].validate([spade3])}`)
console.log(`对子: ${CardPatternRules[CardPatternType.PAIR].validate([spade3, spade3])}`)
console.log(`三张: ${CardPatternRules[CardPatternType.TRIPLE].validate([spade3, spade3, spade3])}`)
console.log(`三带二: ${CardPatternRules[CardPatternType.TRIPLE_TWO].validate([spade3, spade3, spade3, spade4, spade4])}`)
console.log(`顺子: ${CardPatternRules[CardPatternType.STRAIGHT].validate(straightCards1)}`)
console.log(`连对: ${CardPatternRules[CardPatternType.PAIR_STRAIGHT].validate([spade3, spade3, spade4, spade4, spade5, spade5])}`)
console.log(`飞机: ${CardPatternRules[CardPatternType.PLANE].validate(planeCards1)}`)
console.log(`炸弹(4): ${CardPatternRules[CardPatternType.BOMB].validate([spadeQ, spadeQ, spadeQ, spadeQ])}`)
console.log(`王炸: ${CardPatternRules[CardPatternType.ROCKET].validate([smallJoker, bigJoker])}`)
console.log('✓ 通过\n')

console.log('=== 所有测试完成 ===')
