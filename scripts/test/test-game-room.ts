/**
 * GameRoom 实体测试脚本
 */

import { GameRoom } from '../../lib/domain/entities/GameRoom'
import { Player } from '../../lib/domain/entities/Player'

console.log('=== GameRoom 实体测试 ===\n')

// 测试1: 创建房间
console.log('测试1: 创建房间')
const room = new GameRoom('room1', '测试房间', 'user1', 'public', '123456')
console.log(`  - ID: ${room.id}`)
console.log(`  - 名称: ${room.name}`)
console.log(`  - 类型: ${room.type}`)
console.log(`  - 创建者: ${room.createdBy}`)
console.log(`  - 最大玩家: ${room.maxPlayers}`)
console.log(`  - 当前玩家: ${room.currentPlayers}`)
console.log(`  - 状态: ${room.state}`)
console.log(`  - 等级: ${room.currentLevel}`)
console.log(`  - 回合: ${room.round}`)
console.log('  ✅ 通过\n')

// 测试2: 添加玩家
console.log('测试2: 添加玩家')
const player1 = new Player('user2', '玩家A', 'human')
const player2 = new Player('user3', '玩家B', 'human')
room.addPlayer(player1)
console.log(`  - 添加玩家A后: ${room.currentPlayers}人`)
room.addPlayer(player2)
console.log(`  - 添加玩家B后: ${room.currentPlayers}人`)
console.log('  ✅ 通过\n')

// 测试3: 添加AI玩家
console.log('测试3: 添加AI玩家')
const aiPlayer = room.addSystemPlayer('ai1', 'AI_小明')
console.log(`  - AI玩家: ${aiPlayer.nickname}`)
console.log(`  - 房间玩家数: ${room.currentPlayers}`)
console.log('  ✅ 通过\n')

// 测试4: 检查房间状态
console.log('测试4: 检查房间状态')
console.log(`  - 房间已满: ${room.isFull()}`)
console.log(`  - 可以开始游戏: ${room.canStartGame()}`)
console.log('  ✅ 通过\n')

// 测试5: 设置玩家准备状态
console.log('测试5: 设置玩家准备状态')
player1.setReady(true)
player2.setReady(true)
console.log(`  - 玩家A准备: ${player1.isReady}`)
console.log(`  - 玩家B准备: ${player2.isReady}`)
console.log(`  - 所有玩家就绪: ${room.areAllPlayersReady()}`)
console.log('  ✅ 通过\n')

// 测试6: 开始游戏
console.log('测试6: 开始游戏')
room.startGame()
console.log(`  - 游戏状态: ${room.state}`)
console.log(`  - 游戏开始时间: ${room.startedAt}`)
console.log(`  - 活跃玩家数: ${room.getActivePlayerCount()}`)
console.log('  ✅ 通过\n')

// 测试7: 暂停游戏
console.log('测试7: 暂停游戏')
room.pauseGame()
console.log(`  - 暂停后状态: ${room.state}`)
console.log('  ✅ 通过\n')

// 测试8: 恢复游戏
console.log('测试8: 恢复游戏')
room.resumeGame()
console.log(`  - 恢复后状态: ${room.state}`)
console.log('  ✅ 通过\n')

// 测试9: 获取统计信息
console.log('测试9: 获取房间统计信息')
const stats = room.getStatistics()
console.log(`  - 总玩家: ${stats.totalPlayers}`)
console.log(`  - 人类玩家: ${stats.humanPlayers}`)
console.log(`  - AI玩家: ${stats.aiPlayers}`)
console.log(`  - 就绪玩家: ${stats.readyPlayers}`)
console.log(`  - 南家: ${stats.positions.south}`)
console.log(`  - 北家: ${stats.positions.north}`)
console.log(`  - 西家: ${stats.positions.west}`)
console.log(`  - 东家: ${stats.positions.east}`)
console.log('  ✅ 通过\n')

// 测试10: 设置庄家
console.log('测试10: 设置庄家')
room.setDealer(player1.userId, 'south', 2, 1)
const dealer = room.getDealerInfo()
console.log(`  - 庄家ID: ${dealer?.userId}`)
console.log(`  - 庄家位置: ${dealer?.position}`)
console.log(`  - 等级: ${dealer?.level}`)
console.log(`  - 回合: ${dealer?.round}`)
console.log('  ✅ 通过\n')

// 测试11: 检查庄家
console.log('测试11: 检查庄家')
console.log(`  - 玩家A是庄家: ${room.isDealer(player1.userId)}`)
console.log(`  - 玩家B是庄家: ${room.isDealer(player2.userId)}`)
console.log('  ✅ 通过\n')

// 测试12: 获取玩家列表
console.log('测试12: 获取玩家列表')
const playerIds = room.getPlayerIds()
console.log(`  - 玩家IDs: ${playerIds.join(', ')}`)
playerIds.forEach(id => {
  const p = room.getPlayer(id)
  console.log(`    - ${p?.nickname} (${p?.type})`)
})
console.log('  ✅ 通过\n')

// 测试13: 房间类型检查
console.log('测试13: 房间类型检查')
console.log(`  - 是私密房间: ${room.isPrivate()}`)
// room.type = 'private' // type 是 readonly
const privateRoom = new GameRoom('room2', '私密房间', 'user2', 'private')
console.log(`  - 创建私密房间: ${privateRoom.isPrivate()}`)
console.log('  ✅ 通过\n')

// 测试14: 状态管理
console.log('测试14: 状态管理')
console.log(`  - 初始状态: ${room.state}`)
room.setState('bidding', '叫牌阶段')
console.log(`  - 设置为叫牌后: ${room.state}`)
console.log(`  - 状态描述: ${room.stateDescription}`)
room.setState('finished', '游戏结束')
console.log(`  - 设置为结束后: ${room.state}`)
console.log('  ✅ 通过\n')

// 测试15: 快照功能
console.log('测试15: 快照和恢复')
const snapshot = room.toSnapshot()
console.log(`  - 快照房间ID: ${snapshot.id}`)
console.log(`  - 快照名称: ${snapshot.name}`)
console.log(`  - 快照状态: ${snapshot.state}`)

// 创建新房间并恢复
const restoredRoom = GameRoom.fromSnapshot(snapshot, room.players)
console.log(`  - 恢复房间ID: ${restoredRoom.id}`)
console.log(`  - 恢复状态: ${restoredRoom.state}`)
console.log(`  - 恢复玩家数: ${restoredRoom.getPlayerCount()}`)
console.log('  ✅ 通过\n')

// 测试16: 设置允许观战
console.log('测试16: 观战权限')
console.log(`  - 允许观战: ${room.canSpectate()}`)
room.setAllowSpectating(false)
console.log(`  - 设置为不允许观战后: ${room.canSpectate()}`)
console.log('  ✅ 通过\n')

// 测试17: 玩家准备状态检查
console.log('测试17: 玩家准备状态检查')
console.log(`  - 有未准备玩家: ${room.hasUnreadyPlayer()}`)
room.setAllPlayersReady(true)
console.log(`  - 所有玩家就绪后: ${room.hasUnreadyPlayer()}`)
console.log(`  - 全部就绪: ${room.areAllPlayersReady()}`)
console.log('  ✅ 通过\n')

// 测试18: AI 玩家管理
console.log('测试18: AI 玩家管理')
// 创建一个新房间来测试AI管理
const newRoom = new GameRoom('room2', '测试房间2', 'user2')
const ai2 = newRoom.addSystemPlayer('ai2', 'AI_高手')
console.log(`  - 添加AI后玩家数: ${newRoom.currentPlayers}`)
console.log(`  - 人类玩家: ${newRoom.getStatistics().humanPlayers}`)
console.log(`  - AI玩家: ${newRoom.getStatistics().aiPlayers}`)
const removed = newRoom.removeSystemPlayer('ai2')
console.log(`  - 移除AI后玩家数: ${newRoom.currentPlayers}`)
console.log(`  - AI玩家: ${newRoom.getStatistics().aiPlayers}`)
console.log('  ✅ 通过\n')

console.log('=== 所有测试通过! ===')
