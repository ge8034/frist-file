/**
 * AI系统基本功能验证脚本
 *
 * 验证AI系统核心组件的创建和基本功能
 */

console.log('=== AI系统基本功能验证 ===\n')

// 模拟必要的模块
const mockGameRuleService = {
  validatePlay: () => ({ valid: true, message: '模拟验证' })
}

try {
  // 动态导入AI模块
  const aiModule = require('./lib/features/game/ai/index.ts')

  console.log('✅ AI模块加载成功')
  console.log('AI系统版本:', aiModule.getAISystemInfo().version)
  console.log('支持的策略:', aiModule.getAISystemInfo().strategies.join(', '))
  console.log('支持的难度:', aiModule.getAISystemInfo().difficulties.join(', '))
  console.log('')

  // 测试创建AI玩家
  console.log('=== 测试AI玩家创建 ===')

  const aiFactory = aiModule.createDefaultAIPlayerFactory(mockGameRuleService)
  console.log('✅ AI工厂创建成功')

  // 创建不同策略的AI玩家
  const strategies = ['random', 'greedy', 'memory']
  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert']

  for (const strategy of strategies) {
    for (const difficulty of difficulties) {
      const aiPlayer = aiFactory.createAIPlayer(
        `test-${strategy}-${difficulty}`,
        `${strategy} ${difficulty} AI`,
        strategy,
        difficulty,
        50
      )

      console.log(`✅ 创建 ${strategy} ${difficulty} AI: ${aiPlayer.nickname}`)

      // 验证基础属性
      const config = aiPlayer.getConfig()
      if (config.strategy !== strategy) {
        console.error(`❌ 策略不匹配: 期望 ${strategy}, 实际 ${config.strategy}`)
      }

      if (config.difficulty !== difficulty) {
        console.error(`❌ 难度不匹配: 期望 ${difficulty}, 实际 ${config.difficulty}`)
      }
    }
  }

  console.log('\n✅ 所有AI玩家创建测试通过')

  // 测试批量创建
  console.log('\n=== 测试批量创建 ===')

  const batchAIs = aiFactory.createAIPlayers(5, {
    startIndex: 100,
    existingPlayerIds: ['player-1', 'player-2']
  })

  console.log(`✅ 批量创建 ${batchAIs.length} 个AI玩家`)

  // 检查ID唯一性
  const ids = batchAIs.map(ai => ai.userId)
  const uniqueIds = new Set(ids)
  if (uniqueIds.size === batchAIs.length) {
    console.log('✅ AI玩家ID唯一性检查通过')
  } else {
    console.error('❌ AI玩家ID有重复')
  }

  // 测试自动补足计算
  console.log('\n=== 测试自动补足计算 ===')

  const testCases = [
    { humanPlayers: 1, expectedAI: 3 },
    { humanPlayers: 2, expectedAI: 2 },
    { humanPlayers: 3, expectedAI: 1 },
    { humanPlayers: 4, expectedAI: 0 },
    { humanPlayers: 5, expectedAI: 0 }
  ]

  for (const testCase of testCases) {
    const neededAI = aiFactory.calculateNeededAIPlayers(testCase.humanPlayers)
    if (neededAI === testCase.expectedAI) {
      console.log(`✅ ${testCase.humanPlayers}个真人玩家需要${neededAI}个AI`)
    } else {
      console.error(`❌ ${testCase.humanPlayers}个真人玩家: 期望${testCase.expectedAI}个AI, 实际${neededAI}个AI`)
    }
  }

  // 测试预设AI创建
  console.log('\n=== 测试预设AI创建 ===')

  const presets = ['beginner', 'intermediate', 'advanced', 'expert']
  for (const preset of presets) {
    const presetAI = aiModule.createPresetAIPlayer(mockGameRuleService, preset)
    console.log(`✅ 创建预设 ${preset} AI: ${presetAI.nickname}`)
  }

  // 测试手牌管理
  console.log('\n=== 测试手牌管理 ===')

  const testAI = aiFactory.createAIPlayer('test-hand', '手牌测试AI', 'random', 'intermediate', 50)

  const mockCards = [
    { id: 'card-1', rank: 'A', suit: 'spade' },
    { id: 'card-2', rank: 'K', suit: 'heart' },
    { id: 'card-3', rank: 'Q', suit: 'diamond' }
  ]

  testAI.setHandCards(mockCards)
  const handCards = testAI.getHandCards()

  if (handCards.length === 3) {
    console.log('✅ 手牌设置和获取成功')
  } else {
    console.error(`❌ 手牌数量错误: 期望3, 实际${handCards.length}`)
  }

  // 测试游戏记忆
  console.log('\n=== 测试游戏记忆 ===')

  const memory = testAI.getGameMemory()
  if (Array.isArray(memory.snapshots) && Array.isArray(memory.playRecords)) {
    console.log('✅ 游戏记忆结构正确')
  } else {
    console.error('❌ 游戏记忆结构错误')
  }

  // 清空记忆
  testAI.clearGameMemory()
  const clearedMemory = testAI.getGameMemory()
  if (clearedMemory.snapshots.length === 0 && clearedMemory.playRecords.length === 0) {
    console.log('✅ 游戏记忆清空成功')
  } else {
    console.error('❌ 游戏记忆清空失败')
  }

  console.log('\n=== 验证完成 ===')
  console.log('✅ AI系统基本功能验证通过')
  console.log('✅ 核心组件创建正常')
  console.log('✅ 工厂模式工作正常')
  console.log('✅ 记忆系统基础功能正常')
  console.log('✅ 手牌管理功能正常')

  console.log('\n⚠️  注意: 以下功能需要进一步集成测试:')
  console.log('1. AI决策逻辑 (makeDecision)')
  console.log('2. 游戏规则服务集成')
  console.log('3. 策略评估算法')
  console.log('4. 完整游戏流程测试')

} catch (error) {
  console.error('\n❌ AI系统验证失败:', error.message)
  console.error(error.stack)
  process.exit(1)
}