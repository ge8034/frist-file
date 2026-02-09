/**
 * 牌型系统综合测试
 */

import { Card } from '../../lib/domain/entities/Card.ts'
import { CardPatternVO } from '../../lib/domain/value-objects/CardPatternVO.ts'

console.log('=== 牌型系统综合测试 ===\n')

// 创建测试卡牌
const spade2 = new Card('s2', 'spade', '2', 2)
const spade3 = new Card('s3', 'spade', '3', 3)
const spade4 = new Card('s4', 'spade', '4', 4)
const spade5 = new Card('s5', 'spade', '5', 5)
const spade6 = new Card('s6', 'spade', '6', 6)
const spade7 = new Card('s7', 'spade', '7', 7)
const spade8 = new Card('s8', 'spade', '8', 8)
const spade9 = new Card('s9', 'spade', '9', 9)
const spade10 = new Card('s10', 'spade', '10', 10)
const spadeJ = new Card('sj', 'spade', 'J', 11)
const spadeQ = new Card('sq', 'spade', 'Q', 12)
const spadeK = new Card('sk', 'spade', 'K', 13)
const spadeA = new Card('sa', 'spade', 'A', 14)
const heart2 = new Card('h2', 'heart', '2', 2)
const heart3 = new Card('h3', 'heart', '3', 3)

console.log('=== 测试1：顺子 ===')
console.log('----------------------------------------')

// 有效顺子
const straight1 = [spade2, spade3, spade4, spade5, spade6]
const pattern1 = CardPatternVO.create(straight1)
console.log(`2,3,4,5,6: ${pattern1.isValid} (${pattern1.type}, ${pattern1.getDescription()})`)

const straight2 = [heart3, spade4, spade5, spade6, spade7]
const pattern2 = CardPatternVO.create(straight2)
console.log(`3,4,5,6,7: ${pattern2.isValid} (${pattern2.type}, ${pattern2.getDescription()})`)

const straight3 = [spade10, spadeJ, spadeQ, spadeK, spadeA]
const pattern3 = CardPatternVO.create(straight3)
console.log(`10,J,Q,K,A: ${pattern3.isValid} (${pattern3.type}, ${pattern3.getDescription()})`)

// 无效顺子
const straight4 = [spade2, spade3, spade4, spade5, spade5] // 重复
const pattern4 = CardPatternVO.create(straight4)
console.log(`2,3,4,5,5（重复）: ${pattern4.isValid}`)

const straight5 = [spade2, spade3, spade4, spade5, spade7] // 不连续
const pattern5 = CardPatternVO.create(straight5)
console.log(`2,3,4,5,7（不连续）: ${pattern5.isValid}`)

const straight6 = [spade2, spade3, spade4] // 4张
const pattern6 = CardPatternVO.create(straight6)
console.log(`2,3,4（3张）: ${pattern6.isValid}`)

console.log('\n=== 测试2：连对 ===')
console.log('----------------------------------------')

// 有效连对
const pairStraight1 = [spade2, spade2, spade3, spade3, spade4, spade4]
const pattern7 = CardPatternVO.create(pairStraight1)
console.log(`2,2,3,3,4,4: ${pattern7.isValid} (${pattern7.type}, ${pattern7.getDescription()})`)

const pairStraight2 = [spadeA, spadeA, heart2, heart2, heart3, heart3]
const pattern8 = CardPatternVO.create(pairStraight2)
console.log(`A,A,2,2,3,3: ${pattern8.isValid} (${pattern8.type}, ${pattern8.getDescription()})`)

// 无效连对
const pairStraight3 = [spade2, spade2, spade3, spade3, spade3, spade3] // 2组2张，不是3组
const pattern9 = CardPatternVO.create(pairStraight3)
console.log(`2,2,3,3,3,3（2组2张）: ${pattern9.isValid}`)

const pairStraight4 = [spade2, spade2, spade4, spade4] // 2组2张，不是3组
const pattern10 = CardPatternVO.create(pairStraight4)
console.log(`2,2,4,4（2组2张）: ${pattern10.isValid}`)

console.log('\n=== 测试3：炸弹 ===')
console.log('----------------------------------------')

const bomb1 = [spade2, spade2, spade2, spade2]
const pattern11 = CardPatternVO.create(bomb1)
console.log(`2,2,2,2: ${pattern11.isValid} (${pattern11.type}, ${pattern11.getDescription()})`)

const bomb2 = [spade3, spade3, spade3, spade3, spade3, spade3, spade3, spade3] // 8张炸弹
const pattern12 = CardPatternVO.create(bomb2)
console.log(`3x8张: ${pattern12.isValid} (${pattern12.type}, ${pattern12.getDescription()})`)

const bomb3 = [spade2, spade2, spade2] // 3张不是炸弹
const pattern13 = CardPatternVO.create(bomb3)
console.log(`2,2,2（3张）: ${pattern13.isValid}`)

console.log('\n=== 测试4：三带二 ===')
console.log('----------------------------------------')

const tripleTwo1 = [spade2, spade2, spade2, spade3, spade3]
const pattern14 = CardPatternVO.create(tripleTwo1)
console.log(`2,2,2,3,3: ${pattern14.isValid} (${pattern14.type}, ${pattern14.getDescription()})`)

const tripleTwo2 = [spadeK, spadeK, spadeK, spadeA, spadeA]
const pattern15 = CardPatternVO.create(tripleTwo2)
console.log(`K,K,K,A,A: ${pattern15.isValid} (${pattern15.type}, ${pattern15.getDescription()})`)

const tripleTwo3 = [spade3, spade3, spade3, spade4, spade4] // 有效
const pattern16 = CardPatternVO.create(tripleTwo3)
console.log(`3,3,3,4,4: ${pattern16.isValid} (${pattern16.type}, ${pattern16.getDescription()})`)

const tripleTwo4 = [spade3, spade3, spade4, spade4, spade5] // 不是3张+2张
const pattern17 = CardPatternVO.create(tripleTwo4)
console.log(`3,3,4,4,5（不是3张+2张）: ${pattern17.isValid}`)

console.log('\n=== 测试5：单张和对子 ===')
console.log('----------------------------------------')

const single = [spade2]
const pattern18 = CardPatternVO.create(single)
console.log(`2: ${pattern18.isValid} (${pattern18.type}, ${pattern18.getDescription()})`)

const pair = [spade2, spade2]
const pattern19 = CardPatternVO.create(pair)
console.log(`2,2: ${pattern19.isValid} (${pattern19.type}, ${pattern19.getDescription()})`)

const invalidPair = [spade2, spade3]
const pattern20 = CardPatternVO.create(invalidPair)
console.log(`2,3（对子）: ${pattern20.isValid}`)

console.log('\n=== 测试6：王炸 ===')
console.log('----------------------------------------')

const smallJoker = new Card('j1', 'joker', '2', 0, 'small', false)
const bigJoker = new Card('j2', 'joker', '2', 0, 'big', false)

const rocket = [smallJoker, bigJoker]
const pattern21 = CardPatternVO.create(rocket)
console.log(`小王, 大王: ${pattern21.isValid} (${pattern21.type}, ${pattern21.getDescription()})`)

const invalidRocket1 = [smallJoker, smallJoker]
const pattern22 = CardPatternVO.create(invalidRocket1)
console.log(`小王, 小王（无效）: ${pattern22.isValid}`)

const invalidRocket2 = [smallJoker, spade2]
const pattern23 = CardPatternVO.create(invalidRocket2)
console.log(`小王, 2（无效）: ${pattern23.isValid}`)

const invalidRocket3 = [spade2, spade3]
const pattern24 = CardPatternVO.create(invalidRocket3)
console.log(`2, 3（无效）: ${pattern24.isValid}`)

console.log('\n=== 所有测试完成 ===')
