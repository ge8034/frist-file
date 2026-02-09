/**
 * 认证状态 Store
 * 基于 Retro-Futurism 设计系统
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, getCurrentGuestUserId } from '@/lib/infrastructure/supabase/client'
import type { User, LoginForm, RegisterForm } from '@/lib/types/auth'

interface AuthState {
  // 用户状态
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // 游客模式
  guestUserId: string
  guestNickname: string

  // 动作
  login: (form: LoginForm) => Promise<void>
  register: (form: RegisterForm) => Promise<void>
  logout: () => Promise<void>
  setGuestNickname: (nickname: string) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 游客模式
      guestUserId: getCurrentGuestUserId(),
      guestNickname: `游客_${Math.floor(Math.random() * 10000)}`,

      // 登录 - 自动以游客身份进入，无需真实认证
      login: async (form: LoginForm) => {
        set({ isLoading: true, error: null })

        try {
          // 模拟延迟
          await new Promise(resolve => setTimeout(resolve, 1000))

          // 创建模拟用户（基于游客ID）
          const guestUserId = getCurrentGuestUserId()
          const timestamp = new Date().toISOString()

          set({
            user: {
              id: guestUserId,
              email: form.email || `guest_${Date.now()}@example.com`,
              username: form.email ? form.email.split('@')[0] : `游客_${Math.floor(Math.random() * 10000)}`,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${guestUserId}`,
              role: 'user',
              createdAt: new Date(timestamp),
              updatedAt: new Date(timestamp),
            },
            isAuthenticated: true,
            isLoading: false,
          })

          console.log('自动以游客身份登录成功，忽略Supabase认证')
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '登录失败',
            isLoading: false,
          })
        }
      },

      // 注册 - 自动以游客身份进入，无需真实认证
      register: async (form: RegisterForm) => {
        set({ isLoading: true, error: null })

        try {
          // 模拟延迟
          await new Promise(resolve => setTimeout(resolve, 1000))

          // 直接调用登录函数（已修改为游客模式）
          await get().login(form)

          console.log('自动以游客身份注册成功，忽略Supabase认证')
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '注册失败',
            isLoading: false,
          })
        }
      },

      // 登出 - 清除本地用户状态，无需Supabase调用
      logout: async () => {
        set({ isLoading: true })

        try {
          // 模拟延迟
          await new Promise(resolve => setTimeout(resolve, 500))

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })

          console.log('用户已登出（本地状态清除）')
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '登出失败',
            isLoading: false,
          })
        }
      },

      // 设置游客昵称
      setGuestNickname: (nickname: string) => {
        set({ guestNickname: nickname })
      },

      // 清除错误
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        guestUserId: state.guestUserId,
        guestNickname: state.guestNickname,
      }),
    }
  )
)

/**
 * 获取当前用户ID（优先使用认证用户，否则使用游客ID）
 */
export function getCurrentUserId(): string {
  const { user, guestUserId } = useAuthStore.getState()
  return user?.id || guestUserId
}

/**
 * 获取当前用户昵称（优先使用认证用户，否则使用游客昵称）
 */
export function getCurrentUserNickname(): string {
  const { user, guestNickname } = useAuthStore.getState()
  return user?.username || guestNickname
}

/**
 * 检查用户是否为游客
 */
export function isGuestUser(): boolean {
  const { user } = useAuthStore.getState()
  return !user
}