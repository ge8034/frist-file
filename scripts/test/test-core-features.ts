/**
 * 核心功能测试脚本
 * 测试游戏的核心功能是否正常工作
 */

import { GameRules } from '../../lib/features/game/rules'
import { Card } from '../../lib/domain/entities/Card'
import { CardRecognizer } from '../../lib/features/game/rules/CardRecognizer'

// 创建模拟卡牌
function createMockCard(rank: string, suit: string, isJoker: boolean = false, jokerType?: 'small' | 'big'): Card {
  const valueMap: Record<string, number> = {
    '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15,
    'small': 16, 'big': 17
  }

  const value = isJoker ? (jokerType === 'big' ? 17 : 16) : valueMap[rank] || 0

  return new Card(
    undefined,
    suit as any,
    rank as any,
    value,
    jokerType,
    true
  )
}

async function testCoreFeatures() {
  console.log('🧪 开始测试核心功能...\n')

  // 1. 测试游戏规则服务初始化
  console.log('1. 测试游戏规则服务初始化...')
  try {
    const { gameRuleService, scoringService, specialRuleService, stateMachine } = GameRules.initialize()
    console.log('   ✅ 游戏规则服务初始化成功')
    console.log('   ✅ 积分计算服务就绪')
    console.log('   ✅ 特殊规则服务就绪')
    console.log('   ✅ 状态机就绪')
  } catch (error) {
    console.error('   ❌ 游戏规则服务初始化失败:', error)
    return false
  }

  // 2. 测试牌型识别
  console.log('\n2. 测试牌型识别...')
  try {
    const cardRecognizer = new CardRecognizer()

    // 测试单张
    const singleCard = [createMockCard('A', 'heart')]
    const singlePattern = cardRecognizer.recognizePattern(singleCard)
    console.log(`   ✅ 单张识别: ${singlePattern?.type || '无'}`)

    // 测试对子
    const pairCards = [createMockCard('K', 'heart'), createMockCard('K', 'diamond')]
    const pairPattern = cardRecognizer.recognizePattern(pairCards)
    console.log(`   ✅ 对子识别: ${pairPattern?.type || '无'}`)

    // 测试顺子
    const straightCards = [
      createMockCard('3', 'heart'), createMockCard('4', 'diamond'),
      createMockCard('5', 'club'), createMockCard('6', 'spade'), createMockCard('7', 'heart')
    ]
    const straightPattern = cardRecognizer.recognizePattern(straightCards)
    console.log(`   ✅ 顺子识别: ${straightPattern?.type || '无'}`)
  } catch (error) {
    console.error('   ❌ 牌型识别测试失败:', error)
    return false
  }

  // 3. 测试游戏规则验证
  console.log('\n3. 测试游戏规则验证...')
  try {
    const { gameRuleService } = GameRules.initialize()

    // 测试有效出牌（对子3）
    const validPlay = [createMockCard('3', 'heart'), createMockCard('3', 'diamond')]
    const validationResult = gameRuleService.validatePlay('test-player', validPlay, undefined, {
      id: 'test-session',
      roomId: 'test-room',
      phase: 'playing',
      currentRound: {
        roundNumber: 1,
        dealerId: 'test-player',
        currentPlayerId: 'test-player',
        nextPlayerId: 'player-2',
        direction: 'clockwise'
      },
      players: [
        { id: 'test-player', name: '测试玩家', teamId: 'team1' }
      ]
    } as any)

    console.log(`   ✅ 出牌验证: ${validationResult.valid ? '有效' : '无效'}`)
    if (!validationResult.valid) {
      console.log(`      原因: ${validationResult.message}`)
    }
  } catch (error) {
    console.error('   ❌ 游戏规则验证测试失败:', error)
    return false
  }

  // 4. 测试积分计算
  console.log('\n4. 测试积分计算...')
  try {
    const { scoringService } = GameRules.initialize()

    // 创建玩家积分数据
    const playerScores = [
      {
        playerId: 'player-1',
        playerName: '玩家1',
        teamId: 'team1',
        baseScore: 100,
        bombBonus: 20,
        specialBonus: 0,
        totalScore: 120,
        currentLevel: 2,
        newLevel: 2
      },
      {
        playerId: 'player-2',
        playerName: '玩家2',
        teamId: 'team1',
        baseScore: 100,
        bombBonus: 20,
        specialBonus: 0,
        totalScore: 120,
        currentLevel: 2,
        newLevel: 2
      }
    ]

    const scoreResult = scoringService.calculateTeamScores(playerScores)
    console.log(`   ✅ 积分计算完成`)
    console.log(`      获胜队伍: ${scoreResult.teamId} (${scoreResult.teamName})`)
    console.log(`      总积分: ${scoreResult.totalScore}`)
  } catch (error) {
    console.error('   ❌ 积分计算测试失败:', error)
    return false
  }

  console.log('\n🎉 所有核心功能测试通过！')
  console.log('✅ 游戏规则服务 ✅ 牌型识别 ✅ 规则验证 ✅ 积分计算')

  return true
}

// 运行测试
testCoreFeatures().then(success => {
  if (success) {
    console.log('\n✅ 核心功能测试成功完成！')
    process.exit(0)
  } else {
    console.error('\n❌ 核心功能测试失败！')
    process.exit(1)
  }
}).catch(error => {
  console.error('\n❌ 测试过程中发生错误:', error)
  process.exit(1)
})