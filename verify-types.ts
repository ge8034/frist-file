/**
 * 类型验证脚本
 * 用于验证实现的类型是否正确
 */

// 导入客户端
import {
  supabase,
  generateGuestUserId,
  getCurrentGuestUserId,
  GuestPlayer,
  Spectator
} from './lib/infrastructure/supabase/client'

// 导入类型
import type {
  DatabaseGameRoom,
  DatabaseRoomPlayer,
  DatabaseGameRecord,
  GameRoomWithPlayers
} from './lib/types/database'

// 测试数据类型
interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

// 测试 1: 验证导出的函数签名
function testFunctionExports() {
  try {
    // 检查 supabase 实例
    const _ = supabase

    // 检查函数
    const _gen = generateGuestUserId
    const _get = getCurrentGuestUserId

    // 检查接口
    const _guest: GuestPlayer = {
      userId: 'test',
      nickname: 'test',
      isReady: false
    }

    const _spec: Spectator = {
      userId: 'test',
      nickname: 'test',
      joinedAt: '2024-01-01'
    }

    results.push({
      name: '导入函数和接口',
      passed: true
    })
  } catch (error: any) {
    results.push({
      name: '导入函数和接口',
      passed: false,
      error: error.message
    })
  }
}

// 测试 2: 验证数据库类型
function testDatabaseTypes() {
  try {
    const room: DatabaseGameRoom = {
      id: 'room1',
      name: '测试房间',
      password: null,
      max_players: 4,
      current_players: 2,
      status: 'waiting',
      current_level: 2,
      round: 1,
      dealer_id: null,
      created_by: 'user1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }

    const player: DatabaseRoomPlayer = {
      id: 'player1',
      room_id: 'room1',
      user_id: 'user1',
      position: 'south',
      is_ready: false,
      is_dealer: false,
      score: 0,
      cards: [],
      joined_at: '2024-01-01',
      left_at: null
    }

    const record: DatabaseGameRecord = {
      id: 'record1',
      room_id: 'room1',
      player_count: 4,
      winner_ids: [],
      scores: {},
      player_data: null,
      game_data: null,
      started_at: '2024-01-01',
      ended_at: null,
      duration: null
    }

    const roomWithPlayers: GameRoomWithPlayers = {
      ...room,
      players: [player],
      spectator_count: 0
    }

    results.push({
      name: '数据库类型定义',
      passed: true
    })
  } catch (error: any) {
    results.push({
      name: '数据库类型定义',
      passed: false,
      error: error.message
    })
  }
}

// 测试 3: 验证 Repository 类
function testRepositoryImports() {
  try {
    const { RoomRepository, SessionRepository } = require('./lib/infrastructure/supabase/repositories')

    results.push({
      name: '导入 Repository 类',
      passed: true
    })
  } catch (error: any) {
    results.push({
      name: '导入 Repository 类',
      passed: false,
      error: error.message
    })
  }
}

// 测试 4: 验证 GameRoomService 类
function testServiceImports() {
  try {
    const { GameRoomService } = require('./lib/features/game/services/GameRoomService')

    results.push({
      name: '导入 GameRoomService 类',
      passed: true
    })
  } catch (error: any) {
    results.push({
      name: '导入 GameRoomService 类',
      passed: false,
      error: error.message
    })
  }
}

// 运行测试
testFunctionExports()
testDatabaseTypes()
testRepositoryImports()
testServiceImports()

// 输出结果
console.log('\n=== 类型验证测试结果 ===\n')
let passed = 0
let failed = 0

results.forEach(result => {
  const status = result.passed ? '✓ PASS' : '✗ FAIL'
  console.log(`${status} - ${result.name}`)
  if (result.error) {
    console.log(`  Error: ${result.error}`)
  }
  if (result.passed) passed++
  else failed++
})

console.log(`\n总计: ${passed} 通过, ${failed} 失败`)

// 退出码
process.exit(failed > 0 ? 1 : 0)
