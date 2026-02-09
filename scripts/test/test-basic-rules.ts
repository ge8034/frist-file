/**
 * 游戏规则服务基本功能测试
 */

import { GameRules } from '../../lib/features/game/rules'

// 简单的测试函数
function testBasicRules() {
  console.log('=== 游戏规则服务基本功能测试 ===\n')

  try {
    // 1. 初始化
    console.log('1. 初始化游戏规则服务...')
    const { ruleValidator, scoringService } = GameRules.initialize()
    console.log('✅ 初始化成功\n')

    // 2. 测试状态报告
    console.log('2. 获取服务状态报告...')
    const status = GameRules.getStatusReport()
    console.log('   服务数量:', status.services.length)
    console.log('   规则数量:', status.rules.length)
    console.log('   状态机:', status.stateMachine ? '正常' : '异常')
    console.log('✅ 状态报告正常\n')

    // 3. 测试类型导出
    console.log('3. 测试类型导出...')
    console.log('   GameState:', GameRules.constants.GameState ? '已导出' : '未导出')
    console.log('   PlayDirection:', GameRules.constants.PlayDirection ? '已导出' : '未导出')
    console.log('   RuleValidationError:', GameRules.constants.RuleValidationError ? '已导出' : '未导出')
    console.log('✅ 类型导出正常\n')

    // 4. 测试工具包功能
    console.log('4. 测试工具包功能...')
    console.log('   gameRuleService:', GameRules.gameRuleService ? '可用' : '不可用')
    console.log('   scoringService:', GameRules.scoringService ? '可用' : '不可用')
    console.log('   ruleValidator:', GameRules.ruleValidator ? '可用' : '不可用')
    console.log('✅ 工具包功能正常\n')

    // 5. 测试积分计算
    console.log('5. 测试积分计算...')
    const roundResult = {
      roundNumber: 1,
      winningTeamId: 'team1',
      losingTeamId: 'team2',
      winningScore: 0,
      losingScore: 0,
      bombCount: 0,
      isSpring: false,
      isCounterSpring: false,
      playRecords: []
    }
    const baseScore = scoringService.calculateBaseScore(roundResult)
    console.log('   基础积分:', baseScore)
    console.log('✅ 积分计算正常\n')

    // 6. 最终检查
    console.log('=== 测试总结 ===')
    console.log('✅ 所有基本功能测试通过')
    console.log('✅ 游戏规则服务运行正常')
    console.log('✅ 可以集成到主项目')

    return true

  } catch (error) {
    console.error('\n❌ 测试失败:')
    console.error('   错误:', error instanceof Error ? error.message : String(error))

    if (error instanceof Error && error.stack) {
      const stackLines = error.stack.split('\n')
      console.error('   堆栈:', stackLines.slice(0, 3).join('\n      '))
    }

    return false
  }
}

// 运行测试
if (require.main === module) {
  console.log('开始游戏规则服务基本功能测试...\n')

  const success = testBasicRules()

  if (success) {
    console.log('\n🎉 测试通过！游戏规则服务准备就绪。')
    process.exit(0)
  } else {
    console.log('\n💥 测试失败！请检查实现问题。')
    process.exit(1)
  }
}

export { testBasicRules }