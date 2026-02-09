/**
 * 页面组件集合
 * 包含应用的主要页面
 */

import type { ReactNode } from 'react'

/**
 * 主页面
 */
export function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">GuanDan2 AI 应用</h1>
          <p className="mt-2 text-gray-600">基于 RAG 的智能问答系统</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="RAG 检索"
            description="基于向量检索的增强生成功能"
            icon="🔍"
          />
          <FeatureCard
            title="智能对话"
            description="支持多轮对话的 AI 助手"
            icon="💬"
          />
          <FeatureCard
            title="知识库管理"
            description="灵活的知识库管理功能"
            icon="📚"
          />
        </div>
      </div>
    </main>
  )
}

/**
 * 功能卡片组件
 */
interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

function FeatureCard({ title, description, icon }: FeatureCardProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

/**
 * Chat 页面
 */
export function ChatPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">智能对话</h1>
          <p className="mt-2 text-gray-600">与 AI 助手进行交互</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <p className="text-gray-500">对话功能开发中...</p>
          </div>
        </div>
      </div>
    </main>
  )
}

/**
 * Settings 页面
 */
export function SettingsPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">设置</h1>
          <p className="mt-2 text-gray-600">配置应用参数</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <p className="text-gray-500">设置功能开发中...</p>
          </div>
        </div>
      </div>
    </main>
  )
}
