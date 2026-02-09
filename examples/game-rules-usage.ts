/**
 * 游戏规则服务使用示例
 *
 * 展示如何在项目中使用游戏规则服务
 */

import { GameRules } from '../lib/features/game/rules'
import { GameRoomServiceWithRulesSingleton } from '../lib/features/game/services/GameRoomServiceWithRules'
import { useGameStoreWithRules } from '../lib/store/gameStoreWithRules'
import type { Card } from '../lib/domain/entities/Card'

// 示例1：直接使用 GameRules 工具包
function example1_directUsage() {
  console.log('=== 示例1：直接使用 GameRules 工具包 ===')

  // 初始化游戏规则服务
  const { gameRuleService, scoringService, specialRuleService, stateMachine, ruleValidator } = GameRules.initialize()

  // 获取状态报告
  const statusReport = GameRules.getStatusReport()
  console.log('游戏规则服务状态报告:', statusReport)

  // 使用规则验证器
  const mockCards = [{ rank: 'A', suit: 'heart' }] as Card[]
  const validation = ruleValidator.validatePlay('player1', mockCards)
  console.log('出牌验证结果:', validation)

  // 使用积分计算服务
  const roundResult = {
    roundNumber: 1,
    winningTeamId: 'team1',
    losingTeamId: 'team2',
    winningScore: 100,
    losingScore: 50,
    bombCount: 2,
    isSpring: false,
    isCounterSpring: false,
    playRecords: []
  }
  const baseScore = scoringService.calculateBaseScore(roundResult)
  const totalScore = scoringService.applyBombBonus(roundResult.bombCount, baseScore)
  console.log(`积分计算: 基础=${baseScore}, 总计=${totalScore}`)

  // 使用特殊规则服务
  const specialRules = specialRuleService.getAvailableSpecialRules({} as any)
  console.log('可用特殊规则:', specialRules)
}

// 示例2：使用 GameRoomServiceWithRules
async function example2_gameRoomService() {
  console.log('\n=== 示例2：使用 GameRoomServiceWithRules ===')

  const gameRoomService = GameRoomServiceWithRulesSingleton.getInstance()

  // 初始化游戏规则
  gameRoomService.initializeGameRules()

  // 获取游戏规则状态
  const rulesStatus = gameRoomService.getGameRulesStatus()
  console.log('游戏规则状态:', rulesStatus)

  // 模拟出牌验证
  const mockCards = [{ rank: 'K', suit: 'spade' }] as Card[]
  const validation = await gameRoomService.validatePlay('player1', mockCards)
  console.log('出牌验证结果:', validation)

  // 模拟积分计算
  const roundResult = {
    roundNumber: 1,
    winningTeamId: 'team1',
    losingTeamId: 'team2',
    bombCount: 1,
    isSpring: false,
    isCounterSpring: false,
    playRecords: []
  }
  const scores = await gameRoomService.calculateScores(roundResult)
  console.log('积分计算结果:', scores)
}

// 示例3：使用 Zustand Store
function example3_zustandStore() {
  console.log('\n=== 示例3：使用 Zustand Store ===')

  // 注意：在实际 React 组件中，应该使用 useGameStoreWithRules hook
  // 这里只是展示 API 使用方式

  const gameStore = {
    // 初始化游戏规则
    initializeGameRules: () => {
      console.log('初始化游戏规则...')
    },

    // 验证出牌
    validatePlay: (playerId: string, cards: Card[]) => {
      const mockValidation = {
        valid: true,
        message: '出牌验证通过',
        details: {
          patternType: 'single',
          pattern: { rank: 'A', type: 'single' }
        }
      }
      console.log(`玩家 ${playerId} 出牌验证:`, mockValidation)
      return mockValidation
    },

    // 获取游戏规则状态
    getGameRulesStatus: () => {
      return GameRules.getStatusReport()
    }
  }

  gameStore.initializeGameRules()
  const status = gameStore.getGameRulesStatus()
  console.log('Store 中的游戏规则状态:', status)

  const cards = [{ rank: 'Q', suit: 'diamond' }] as Card[]
  gameStore.validatePlay('player2', cards)
}

// 示例4：完整游戏流程
async function example4_completeGameFlow() {
  console.log('\n=== 示例4：完整游戏流程示例 ===')

  const gameRules = GameRules
  const gameRoomService = GameRoomServiceWithRulesSingleton.getInstance()

  // 1. 初始化
  gameRules.initialize()
  gameRoomService.initializeGameRules()

  // 2. 创建房间（模拟）
  console.log('1. 创建游戏房间...')

  // 3. 玩家准备
  console.log('2. 玩家准备就绪...')

  // 4. 开始游戏
  console.log('3. 开始游戏...')
  const startResult = await gameRoomService.startGame()
  console.log('游戏开始结果:', startResult)

  if (!startResult.valid) {
    console.log('游戏开始失败，结束示例')
    return
  }

  // 5. 玩家出牌流程
  console.log('4. 玩家出牌流程...')

  // 玩家1出牌
  const player1Cards = [{ rank: 'A', suit: 'heart' }] as Card[]
  const play1Result = await gameRoomService.playCards('player1', player1Cards)
  console.log('玩家1出牌结果:', play1Result)

  if (play1Result.valid) {
    // 玩家2出牌
    const player2Cards = [{ rank: '2', suit: 'spade' }] as Card[]
    const play2Result = await gameRoomService.playCards('player2', player2Cards)
    console.log('玩家2出牌结果:', play2Result)
  }

  // 6. 回合结束，计算积分
  console.log('5. 计算积分...')
  const roundResult = {
    roundNumber: 1,
    winningTeamId: 'team1',
    losingTeamId: 'team2',
    bombCount: 0,
    isSpring: false,
    isCounterSpring: false,
    playRecords: []
  }
  const scoreResult = await gameRoomService.calculateScores(roundResult)
  console.log('积分计算结果:', scoreResult)

  // 7. 游戏规则状态报告
  console.log('6. 游戏规则状态报告:')
  const finalStatus = gameRules.getStatusReport()
  console.log(JSON.stringify(finalStatus, null, 2))
}

// 示例5：错误处理
function example5_errorHandling() {
  console.log('\n=== 示例5：错误处理示例 ===')

  const ruleValidator = GameRules.ruleValidator

  // 1. 无效牌型
  console.log('1. 测试无效牌型:')
  const invalidCards = [
    { rank: 'A', suit: 'heart' },
    { rank: 'K', suit: 'spade' },
    { rank: 'Q', suit: 'diamond' }
  ] as Card[]
  const invalidResult = ruleValidator.validatePlay('player1', invalidCards)
  console.log('无效牌型验证结果:', invalidResult)

  // 2. 空出牌
  console.log('\n2. 测试空出牌:')
  const emptyResult = ruleValidator.validatePlay('player1', [])
  console.log('空出牌验证结果:', emptyResult)

  // 3. 游戏未开始状态
  console.log('\n3. 测试游戏未开始状态:')
  const mockRoom = {
    status: 'waiting',
    players: [
      { id: 'player1', isReady: false },
      { id: 'player2', isReady: false }
    ],
    config: { gameMode: 'standard' }
  }
  const gameStartResult = ruleValidator.validateGameStart(mockRoom as any)
  console.log('游戏开始验证结果:', gameStartResult)
}

// 运行所有示例
async function runAllExamples() {
  console.log('游戏规则服务使用示例\n')

  try {
    example1_directUsage()
    await example2_gameRoomService()
    example3_zustandStore()
    await example4_completeGameFlow()
    example5_errorHandling()

    console.log('\n所有示例运行完成！')
  } catch (error) {
    console.error('运行示例时发生错误:', error)
  }
}

// 导出示例函数
export {
  example1_directUsage,
  example2_gameRoomService,
  example3_zustandStore,
  example4_completeGameFlow,
  example5_errorHandling,
  runAllExamples
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples().catch(console.error)
}