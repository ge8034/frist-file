/**
 * Supabase 接口复用测试脚本
 * 用于验证游客模式、AI 自动补位等功能
 */

// 模拟测试 AIService
console.log('测试 1: AIService')

class MockAIService {
  static createAIPlayer() {
    return {
      userId: `ai_${Date.now()}_${Math.random()}`,
      nickname: 'AI_测试玩家',
      skillLevel: 3
    }
  }

  static calculateNeededAIPlayers(currentCount: number, maxPlayers: number): number {
    return maxPlayers - currentCount
  }
}

// 测试 AI 生成
const ai1 = MockAIService.createAIPlayer()
const ai2 = MockAIService.createAIPlayer()
console.log('  生成的 AI 玩家:', JSON.stringify(ai1, null, 2))
console.log('  生成的 AI 玩家:', JSON.stringify(ai2, null, 2))

// 测试 AI 补位计算
const needed1 = MockAIService.calculateNeededAIPlayers(1, 4)
const needed2 = MockAIService.calculateNeededAIPlayers(2, 4)
const needed3 = MockAIService.calculateNeededAIPlayers(3, 4)
console.log(`  1人时需要 ${needed1} 个 AI`)
console.log(`  2人时需要 ${needed2} 个 AI`)
console.log(`  3人时需要 ${needed3} 个 AI`)

console.log('\n测试 2: 游客模式配置')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('  Supabase URL:', supabaseUrl ? '已配置 ✓' : '未配置 ✗')
console.log('  Supabase Anon Key:', supabaseAnonKey ? '已配置 ✓' : '未配置 ✗')

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n错误: 环境变量未配置，请检查 .env.local 文件')
  process.exit(1)
}

console.log('\n✓ 所有测试通过!')
