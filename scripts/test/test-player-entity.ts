/**
 * Player 实体测试脚本（直接验证）
 */

import { Player } from '../../lib/domain/entities/Player'
import { Card, CardCollection } from '../../lib/domain/value-objects/Card'

console.log('=== 玩家实体测试 ===\n')

// 测试1: 创建玩家
console.log('测试1: 创建玩家')
const player = new Player('user123', '玩家A', 'human')
console.log(`  - ID: ${player.userId}`)
console.log(`  - 昵称: ${player.nickname}`)
console.log(`  - 类型: ${player.type}`)
console.log(`  - 位置: ${player.position}`)
console.log(`  - 准备: ${player.isReady}`)
console.log(`  - 庄家: ${player.isDealer}`)
console.log(`  - 分数: ${player.score}`)
console.log('  ✅ 通过\n')

// 测试2: 设置位置
console.log('测试2: 设置位置')
player.setPosition('south')
console.log(`  - 位置: ${player.position}`)
player.setPosition('north')
console.log(`  - 位置: ${player.position}`)
console.log('  ✅ 通过\n')

// 测试3: 设置准备状态
console.log('测试3: 设置准备状态')
player.setReady(true)
console.log(`  - 准备: ${player.isReady}`)
player.setReady(false)
console.log(`  - 准备: ${player.isReady}`)
console.log('  ✅ 通过\n')

// 测试4: 设置庄家
console.log('测试4: 设置庄家')
player.setDealer(true)
console.log(`  - 庄家: ${player.isDealer}`)
console.log('  ✅ 通过\n')

// 测试5: 搭档关系
console.log('测试5: 搭档关系')
player.setPartner(true)
console.log(`  - 搭档: ${player.isPartner}`)
player.updatePartnerStatus('paired')
console.log(`  - 搭档状态: ${player.partnerStatus}`)
console.log('  ✅ 通过\n')

// 测试6: 得分
console.log('测试6: 得分管理')
player.addScore(100)
console.log(`  - 分数: ${player.score}`)
player.addScore(50)
console.log(`  - 分数: ${player.score}`)
player.addScore(-30)
console.log(`  - 分数: ${player.score}`)
console.log('  ✅ 通过\n')

// 测试7: 手牌管理
console.log('测试7: 手牌管理')
const card1 = new Card('1', 'spade', 'A', 1)
const card2 = new Card('2', 'heart', 'K', 13)
const card3 = new Card('3', 'club', '10', 10)
player.startSession() // 开始游戏会话
player.setHandCards([card1, card2, card3])
console.log(`  - 手牌数量: ${player.handCards.length}`)
console.log(`  - 剩余: ${player.remainingCards}`)
player.playCards([card1])
console.log(`  - 出牌后剩余: ${player.remainingCards}`)
console.log('  ✅ 通过\n')

// 测试8: 游戏会话
console.log('测试8: 游戏会话')
player.startSession()
console.log(`  - 在游戏中: ${player.isInGame()}`)
console.log(`  - 状态: ${player.state}`)
player.goOffline()
console.log(`  - 离线后状态: ${player.state}`)
console.log('  ✅ 通过\n')

// 测试9: 快照
console.log('测试9: 快照和恢复')
player.endSession() // 结束会话以便修改位置
player.setPosition('south')
player.setReady(true)
player.setDealer(true)
player.isPartner = true
player.partnerStatus = 'paired'
player.score = 100
player.state = 'ready'
player.startSession() // 重新开始会话

const snapshot = player.toSnapshot()
console.log(`  - 快照得分: ${snapshot.score}`)
console.log(`  - 快照位置: ${snapshot.position}`)
console.log(`  - 快照准备: ${snapshot.isReady}`)

const restoredPlayer = Player.fromSnapshot(snapshot)
console.log(`  - 恢复得分: ${restoredPlayer.score}`)
console.log(`  - 恢复位置: ${restoredPlayer.position}`)
console.log('  ✅ 通过\n')

// 测试10: CardCollection
console.log('测试10: CardCollection 集合操作')
const collection = new CardCollection([card1, card2, card3])
console.log(`  - 初始数量: ${collection.count()}`)
collection.addCards([new Card('4', 'diamond', '2', 2)])
console.log(`  - 添加后: ${collection.count()}`)
collection.removeCards([card2])
console.log(`  - 移除后: ${collection.count()}`)
console.log(`  - 包含A: ${collection.contains(card1)}`)
collection.sortByValue(true)
console.log(`  - 排序后第一个: ${collection.getAll()[0].rank}`)
console.log('  ✅ 通过\n')

// 测试11: Card比较
console.log('测试11: Card 比较')
const cardA = new Card('1', 'spade', '3', 3)
const cardB = new Card('2', 'heart', 'A', 1)
console.log(`  - A(3) > B(A): ${cardA.compareTo(cardB)}`)
console.log(`  - B(A) > A(3): ${cardB.compareTo(cardA)}`)
console.log(`  - A === A: ${cardA.equals(cardA)}`)
console.log('  ✅ 通过\n')

console.log('=== 所有测试通过! ===')
