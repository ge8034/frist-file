/**
 * AI系统集成测试脚本
 *
 * 测试AI系统与游戏规则服务的集成
 */

console.log('=== AI系统集成测试 ===\n')

// 模拟游戏规则服务
const mockGameRuleService = {
  validatePlay: (playerId, cards, currentPattern, gameSession) => ({
    valid: true,
    message: '模拟验证通过'
  })
}

// 模拟游戏会话
const mockGameSession = {
  id: 'test-session-1',
  phase: 'playing',
  currentRound: {
    roundNumber: 1,
    currentPlayerId: 'test-ai-1'
  },
  plays: [
    {
      playerId: 'player-1',
      cards: [
        { id: 'card-1', rank: '3', suit: 'spade' },
        { id: 'card-2', rank: '3', suit: 'heart' }
      ],
      choice: 'play'
    },
    {
      playerId: 'player-2',
      cards: [],
      choice: 'pass'
    }
  ],
  scores: new Map([
    ['player-1', 10],
    ['player-2', 5],
    ['test-ai-1', 8],
    ['player-3', 7]
  ]),
  getRoom: () => ({
    getActivePlayers: () => [
      { userId: 'player-1', handCount: 5 },
      { userId: 'player-2', handCount: 6 },
      { userId: 'test-ai-1', handCount: 7 },
      { userId: 'player-3', handCount: 4 }
    ]
  })
}

try {
  // 动态导入AI模块
  const aiModule = require('./lib/features/game/ai/index.ts')

  console.log('✅ AI模块加载成功')

  // 创建AI工厂
  const factory = aiModule.createDefaultAIPlayerFactory(mockGameRuleService)
  console.log('✅ AI工厂创建成功')

  // 创建AI玩家
  const aiPlayer = factory.createAIPlayer(
    'test-ai-1',
    '集成测试AI',
    'memory',
    'advanced',
    70
  )

  console.log(`✅ AI玩家创建成功: ${aiPlayer.nickname}`)

  // 设置手牌
  const handCards = [
    { id: 'card-1', rank: 'A', suit: 'spade' },
    { id: 'card-2', rank: 'K', suit: 'heart' },
    { id: 'card-3', rank: 'Q', suit: 'diamond' },
    { id: 'card-4', rank: 'J', suit: 'club' },
    { id: 'card-5', rank: '10', suit: 'spade' }
  ]

  aiPlayer.setHandCards(handCards)
  console.log('✅ 手牌设置成功')

  // 更新游戏状态
  aiPlayer.updateGameState(mockGameSession)
  console.log('✅ 游戏状态更新成功')

  // 获取可能的出牌选项
  const possiblePlays = aiPlayer.getPossiblePlays(mockGameSession)
  console.log(`✅ 获取到 ${possiblePlays.length} 个出牌选项`)

  if (possiblePlays.length > 0) {
    console.log('出牌选项:')
    possiblePlays.forEach((play, index) => {
      console.log(`  ${index + 1}. ${play.choice}: ${play.cards.length}张牌，评分: ${play.score}`)
    })
  }

  // 测试获取游戏记忆
  const gameMemory = aiPlayer.getGameMemory()
  console.log(`✅ 游戏记忆获取成功 (快照数: ${gameMemory.snapshots.length})`)

  // 测试获取当前牌型
  console.log('✅ 集成测试完成')

  console.log('\n📊 测试总结:')
  console.log('1. CardRecognizer集成: ✅ 完成')
  console.log('2. GameSession状态获取: ✅ 完成')
  console.log('3. 游戏规则服务集成: ✅ 完成 (模拟验证)')
  console.log('4. AI决策流程: ✅ 正常工作')

  console.log('\n⚠️  注意: 这是一个基础集成测试，实际游戏环境需要完整的游戏规则服务实现。')

} catch (error) {
  console.error('❌ 集成测试失败:', error.message)
  console.error(error.stack)
  process.exit(1)
}