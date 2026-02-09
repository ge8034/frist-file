import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 构建时验证环境变量（仅在服务器端）
if (typeof window === 'undefined') {
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL 环境变量未配置')
    console.error('请在 Vercel 项目设置中添加环境变量：')
    console.error('名称：NEXT_PUBLIC_SUPABASE_URL')
    console.error('值：https://your-project.supabase.co')
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 环境变量未配置')
  }
  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量未配置')
    console.error('请在 Vercel 项目设置中添加环境变量：')
    console.error('名称：NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('值：your-anon-key')
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量未配置')
  }
  console.log('✅ Supabase 环境变量配置验证通过')
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
  console.log(`   Key: ${supabaseAnonKey.substring(0, 10)}...`)
}

/**
 * Supabase 客户端实例
 * 用于所有数据库操作
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

/**
 * 生成游客用户ID
 */
export function generateGuestUserId(): string {
  return `guest_${uuidv4()}`
}

/**
 * 获取当前用户 ID（游客模式）
 */
export function getCurrentGuestUserId(): string {
  if (typeof window === 'undefined') {
    return generateGuestUserId()
  }

  let userId = localStorage.getItem('guest_user_id')
  if (!userId) {
    userId = generateGuestUserId()
    localStorage.setItem('guest_user_id', userId)
  }
  return userId
}

/**
 * 游客玩家信息（用于房间管理）
 */
export interface GuestPlayer {
  userId: string
  nickname: string
  isReady: boolean
}

/**
 * 观战者信息
 */
export interface Spectator {
  userId: string
  nickname: string
  joinedAt: string
}
