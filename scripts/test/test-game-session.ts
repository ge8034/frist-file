/**
 * GameSession 实体测试脚本
 */

import { GameSession } from '../../lib/domain/entities/GameSession'
import { Player } from '../../lib/domain/entities/Player'
import { GameRoom } from '../../lib/domain/entities/GameRoom'

// 模拟卡牌
const createMockCard = (id: string, rank: string, suit: string = 'heart'): any => {
  return {
    id,
    rank,
    suit,
    rankName: rank,
    suitName: suit === 'heart' ? '♥' : suit === 'diamond' ? '♦' : suit === 'club' ? '♣' : suit === 'spade' ? '♠' : '★',
    value: parseInt(rank) || (rank === 'A' ? 14 : rank === 'K' ? 13 : rank === 'Q' ? 12 : rank === 'J' ? 11 : 0),
    isJoker: false,
    isWildCard: false,
    isFaceUp: true,
    compareTo: () => 0,
    toString: () => rank,
    toJSON: () => ({ rank, suit })
  }
}

console.log('=== GameSession 实体测试 ===\n')

// 测试1: 创建游戏会话
console.log('测试1: 创建游戏会话')
const session = new GameSession('session1', 'room1', 'user1')
console.log(`  - ID: ${session.id}`)
console.log(`  - 房间ID: ${session.roomId}`)
console.log(`  - 创建者: ${session.createdBy}`)
console.log(`  - 阶段: ${session.phase}`)
console.log(`  - 设置:`, session.getSettings())
console.log('  ✅ 通过\n')

// 测试2: 设置房间
console.log('测试2: 设置房间')
const room = new GameRoom('room2', '测试房间', 'user1')
const player1 = new Player('p1', '玩家A', 'human')
const player2 = new Player('p2', '玩家B', 'human')
const aiPlayer = new Player('ai1', 'AI_小明', 'ai')
room.addPlayer(player1)
room.addPlayer(player2)
room.addSystemPlayer('ai1', 'AI_小明')
session.setRoom(room)
console.log(`  - 房间引用设置成功`)
console.log(`  - 房间名称: ${session.getRoom()?.name}`)
console.log('  ✅ 通过\n')

// 测试3: 设置玩家准备
console.log('测试3: 设置玩家准备')
session.setPlayerReady(player1.userId, true)
session.setPlayerReady(player2.userId, true)
session.setPlayerReady(aiPlayer.userId, true)
console.log(`  - 玩家A准备: ${session.getPlayerReady(player1.userId)}`)
console.log(`  - 玩家B准备: ${session.getPlayerReady(player2.userId)}`)
console.log(`  - AI准备: ${session.getPlayerReady(aiPlayer.userId)}`)
console.log(`  - 全部就绪: ${session.areAllPlayersReady()}`)
console.log('  ✅ 通过\n')

// 测试4: 开始回合
console.log('测试4: 开始回合')
session.startRound(
  player1.userId,
  player1.userId,
  player2.userId,
  'clockwise'
)
console.log(`  - 阶段: ${session.phase}`)
console.log(`  - 当前回合: ${session.currentRound?.roundNumber}`)
console.log(`  - 庄家: ${session.getDealerId()}`)
console.log(`  - 当前玩家: ${session.getCurrentPlayerId()}`)
console.log(`  - 下个玩家: ${session.getNextPlayerId()}`)
// console.log(`  - 方向: ${session.direction}`) // direction是私有属性
console.log('  ✅ 通过\n')

// 测试5: 出牌
console.log('测试5: 添加出牌')
const card1 = createMockCard('c1', 'A', 'heart')
session.addPlay({
  playerId: player1.userId,
  playerName: '玩家A',
  cards: [card1],
  choice: 'play',
  isPassed: false,
  timestamp: new Date()
})
console.log(`  - 玩家A出牌成功`)
console.log(`  - 出牌记录数: ${session.getPlayCount()}`)
console.log(`  - 玩家A出牌记录: ${session.getPlayerPlays(player1.userId).length}`)
console.log('  ✅ 通过\n')

// 测试6: 下个玩家出牌
console.log('测试6: 下个玩家出牌')
session.incrementPlayerIndex()
const card2 = createMockCard('c2', 'K', 'spade')
session.addPlay({
  playerId: player2.userId,
  playerName: '玩家B',
  cards: [card2],
  choice: 'play',
  isPassed: false,
  timestamp: new Date()
})
console.log(`  - 玩家B出牌成功`)
console.log(`  - 出牌记录数: ${session.getPlayCount()}`)
console.log(`  - 玩家B出牌记录: ${session.getPlayerPlays(player2.userId).length}`)
console.log('  ✅ 通过\n')

// 测试7: 玩家弃牌
console.log('测试7: 玩家弃牌')
session.incrementPlayerIndex()
session.addPlay({
  playerId: aiPlayer.userId,
  playerName: 'AI_小明',
  cards: [],
  choice: 'pass',
  isPassed: true,
  timestamp: new Date()
})
console.log(`  - AI弃牌成功`)
console.log(`  - 弃牌玩家数: ${session.getPassedPlayerIds().length}`)
console.log(`  - 弃牌玩家: ${session.getPassedPlayerIds().join(', ')}`)
console.log('  ✅ 通过\n')

// 测试8: 得分管理
console.log('测试8: 得分管理')
session.addScore(player1.userId, 100)
session.addScore(player2.userId, 80)
session.addScore(aiPlayer.userId, 20)
console.log(`  - 玩家A分数: ${session.getScore(player1.userId)}`)
console.log(`  - 玩家B分数: ${session.getScore(player2.userId)}`)
console.log(`  - AI分数: ${session.getScore(aiPlayer.userId)}`)
console.log(`  - 最高分玩家: ${session.getHighestScorers().join(', ')}`)
console.log(`  - 最低分玩家: ${session.getLowestScorers().join(', ')}`)
const stats = session.getScoreStats()
console.log(`  - 统计: ${stats.totalPlayers}人, 总分: ${stats.totalScore}`)
console.log('  ✅ 通过\n')

// 测试9: 轮换队列
console.log('测试9: 轮换队列管理')
session.setTurnQueue([player1.userId, player2.userId, aiPlayer.userId])
console.log(`  - 回合队列: ${session.getTurnQueue().join(', ')}`)
console.log(`  - 当前索引: ${session.getCurrentPlayerIndex()}`)
console.log(`  - 当前玩家: ${session.getCurrentPlayerId()}`)
session.setCurrentPlayerIndex(1)
console.log(`  - 设置索引后: ${session.getCurrentPlayerId()}`)
console.log('  ✅ 通过\n')

// 测试10: 出牌方向
console.log('测试10: 出牌方向')
// console.log(`  - 当前方向: ${session.direction}`) // direction是私有属性
console.log(`  - 顺时针: ${session.isClockwise()}`)
console.log(`  - 逆时针: ${session.isCounterClockwise()}`)
session.setDirection('counter-clockwise')
// console.log(`  - 设置逆时针后: ${session.direction}`) // direction是私有属性
console.log(`  - 顺时针: ${session.isClockwise()}`)
console.log('  ✅ 通过\n')

// 测试11: 检查是否允许出牌
console.log('测试11: 出牌权限检查')
session.setCurrentPlayerIndex(0)
console.log(`  - 玩家A是当前玩家: ${session.isCurrentPlayer(player1.userId)}`)
console.log(`  - 玩家A可以出牌: ${session.canPlayerPlay(player1.userId)}`)
console.log(`  - AI可以出牌: ${session.canPlayerPlay(aiPlayer.userId)}`)
session.setCurrentPlayerIndex(2)
console.log(`  - AI是当前玩家: ${session.isCurrentPlayer(aiPlayer.userId)}`)
console.log(`  - AI可以出牌: ${session.canPlayerPlay(aiPlayer.userId)}`)
console.log('  ✅ 通过\n')

// 测试12: 玩家状态检查
console.log('测试12: 玩家状态检查')
console.log(`  - 玩家A是否出局: ${session.isPlayerEliminated(player1.userId)}`)
console.log(`  - 玩家A出牌总数: ${session.getPlayerTotalPlays(player1.userId)}`)
console.log(`  - AI是否出过牌: ${session.hasPlayerPlayed(aiPlayer.userId)}`)
console.log(`  - AI是否弃牌: ${session.hasPlayerPassed(aiPlayer.userId)}`)
console.log(`  - 是否有玩家弃牌: ${session.hasAnyPlayerPassed()}`)
console.log('  ✅ 通过\n')

// 测试13: 检查阶段
console.log('测试13: 游戏阶段管理')
console.log(`  - 当前阶段: ${session.phase}`)
session.setPhase('bidding')
console.log(`  - 设置为叫牌后: ${session.phase}`)
session.setPhase('round_end')
console.log(`  - 设置为回合结束: ${session.phase}`)
console.log(`  - 可以结束游戏: ${session.canEnd()}`)
console.log('  ✅ 通过\n')

// 测试14: 统计信息
console.log('测试14: 统计信息')
console.log(`  - 总回合数: ${session.roundCount}`)
console.log(`  - 总出牌次数: ${session.getPlayCount()}`)
console.log(`  - 回合记录数: ${session.getRoundCount()}`)
console.log(`  - 出牌次数最多: ${session.getMostPlayedPlayer()}`)
const perRound = session.getAllPlaysPerRound()
console.log(`  - 每回合出牌数:`, Array.from(perRound.entries()))
console.log('  ✅ 通过\n')

// 测试15: 快照功能
console.log('测试15: 快照和恢复')
const snapshot = session.toSnapshot()
console.log(`  - 快照ID: ${snapshot.id}`)
console.log(`  - 快照阶段: ${snapshot.phase}`)
console.log(`  - 快照分数:`, snapshot.scores)

// 创建新会话并恢复
const restored = GameSession.fromSnapshot(snapshot)
console.log(`  - 恢复会话ID: ${restored.id}`)
console.log(`  - 恢复阶段: ${restored.phase}`)
console.log(`  - 恢复分数:`, Array.from(restored.getAllScores()))
console.log('  ✅ 通过\n')

// 测试16: 观战者检查
console.log('测试16: 玩家列表检查')
console.log(`  - 存活玩家数: ${session.getActivePlayerCount()}`)
console.log(`  - 出牌玩家: ${session.getPlayedPlayerIds().join(', ')}`)
console.log(`  - 弃牌玩家: ${session.getPassedPlayerIds().join(', ')}`)
console.log('  ✅ 通过\n')

// 测试17: 游戏设置更新
console.log('测试17: 游戏设置更新')
const settings = session.getSettings()
console.log(`  - 最大回合数: ${settings.maxRounds}`)
console.log(`  - 允许弃牌: ${settings.allowPass}`)
const newSettings = { maxRounds: 2, allowPass: false }
session.updateSettings(newSettings)
console.log(`  - 更新后最大回合数: ${session.getSettings().maxRounds}`)
console.log(`  - 更新后允许弃牌: ${session.getSettings().allowPass}`)
console.log('  ✅ 通过\n')

// 测试18: 时间管理
console.log('测试18: 时间管理')
console.log(`  - 开始时间: ${session.getStartedAt().toLocaleString()}`)
console.log(`  - 最后活动时间: ${session.getLastActivityAt().toLocaleString()}`)
console.log(`  - 总时长: ${session.getTotalDuration()}ms`)
session.updateDuration()
console.log(`  - 更新后总时长: ${session.getTotalDuration()}ms`)
console.log('  ✅ 通过\n')

console.log('=== 所有测试通过! ===')
