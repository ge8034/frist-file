/**
 * 应用程序核心类型定义
 */

/**
 * 用户消息类型
 */
export interface UserMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  sources?: KnowledgeSource[]
}

/**
 * 知识来源类型
 */
export interface KnowledgeSource {
  id: string
  content: string
  metadata: Record<string, any>
  similarity?: number
}

/**
 * RAG 查询请求类型
 */
export interface RagQueryRequest {
  query: string
  topK?: number
  filters?: Record<string, any>
}

/**
 * RAG 查询响应类型
 */
export interface RagQueryResponse {
  results: KnowledgeSource[]
  answer: string
  metadata: {
    queryTime: number
    sourcesCount: number
    modelUsed: string
  }
}

/**
 * 向量嵌入结果类型
 */
export interface EmbeddingResult {
  vector: number[]
  dimension: number
  text: string
}

/**
 * Agent 行动类型
 */
export interface AgentAction {
  type: string
  description: string
  parameters?: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
}

/**
 * 对话历史记录类型
 */
export interface ConversationHistory {
  sessionId: string
  messages: UserMessage[]
  createdAt: Date
  updatedAt: Date
}

/**
 * 配置选项类型
 */
export interface AppConfig {
  rag: {
    enabled: boolean
    topK: number
    similarityThreshold: number
  }
  embeddings: {
    model: string
    dimension: number
    batchSize: number
  }
  agent: {
    maxSteps: number
    temperature: number
  }
}
