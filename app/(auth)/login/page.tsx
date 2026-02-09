/**
 * 登录页面
 * 基于 Retro-Futurism 设计系统
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import type { LoginForm } from '@/lib/types/auth'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    await login(form)
    // 登录成功后跳转到首页
    if (!error) {
      router.push('/')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {/* 页面标题 */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">用户登录</h2>
        <p className="text-gray-400 text-sm">登录您的账户开始游戏</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* 登录表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 邮箱输入 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            邮箱地址
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="请输入邮箱地址"
            />
          </div>
        </div>

        {/* 密码输入 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            密码
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="请输入密码"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 记住我选项 */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-purple-500 focus:ring-offset-gray-900"
            />
            <span className="ml-2 text-sm text-gray-400">记住我</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            忘记密码？
          </Link>
        </div>

        {/* 登录按钮 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>登录中...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>登录账户</span>
            </>
          )}
        </button>
      </form>

      {/* 分隔线 */}
      <div className="my-8 flex items-center">
        <div className="flex-1 h-px bg-gray-700"></div>
        <span className="px-4 text-sm text-gray-500">或</span>
        <div className="flex-1 h-px bg-gray-700"></div>
      </div>

      {/* 游客模式按钮 */}
      <div className="mb-6">
        <Link
          href="/"
          className="w-full py-3 px-4 bg-gray-800/50 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-700/50 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <span>以游客身份继续游戏</span>
        </Link>
        <p className="mt-2 text-xs text-gray-500 text-center">
          无需注册，立即开始游戏
        </p>
      </div>

      {/* 注册链接 */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          还没有账户？{' '}
          <Link
            href="/register"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            立即注册
          </Link>
        </p>
      </div>
    </>
  )
}