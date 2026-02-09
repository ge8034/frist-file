/**
 * Agent 模块入口
 * 提供智能 Agent 功能
 */

import type { UserMessage, ConversationHistory, AgentAction } from '../types'

/**
 * Agent 基类
 */
export abstract class BaseAgent {
  protected name: string
  protected maxSteps: number

  constructor(name: string, maxSteps: number = 10) {
    this.name = name
    this.maxSteps = maxSteps
  }

  /**
   * 执行 Agent 任务
   * @param input 输入数据
   * @returns Agent 响应
   */
  abstract execute(input: any): Promise<any>

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return this.name
  }

  /**
   * 获取最大步数
   */
  getMaxSteps(): number {
    return this.maxSteps
  }
}

/**
 * 聊天 Agent 类
 */
export class ChatAgent extends BaseAgent {
  private conversationHistory: ConversationHistory

  constructor(conversationHistory?: Partial<ConversationHistory>) {
    super('ChatAgent', 10)
    this.conversationHistory = {
      sessionId: conversationHistory?.sessionId || this.generateSessionId(),
      messages: conversationHistory?.messages || [],
      createdAt: conversationHistory?.createdAt || new Date(),
      updatedAt: new Date(),
    }
  }

  /**
   * 发送消息
   * @param message 用户消息
   * @returns Agent 响应
   */
  async sendMessage(message: string): Promise<string> {
    this.addMessage({
      id: this.generateId(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    })

    const response = await this.generateResponse(message)

    this.addMessage({
      id: this.generateId(),
      content: response,
      role: 'assistant',
      timestamp: new Date(),
    })

    return response
  }

  /**
   * 执行 Agent 任务（实现抽象方法）
   * @param input 输入数据（用户消息）
   * @returns Agent 响应
   */
  async execute(input: any): Promise<any> {
    return this.sendMessage(input)
  }

  /**
   * 添加消息到历史记录
   * @param message 消息对象
   */
  private addMessage(message: UserMessage): void {
    this.conversationHistory.messages.push(message)
    this.conversationHistory.updatedAt = new Date()
  }

  /**
   * 生成响应
   * @param message 用户消息
   * @returns 响应内容
   */
  private async generateResponse(message: string): Promise<string> {
    // TODO: 调用实际的 LLM 模块
    // 这里应该是调用 chat API
    throw new Error('需要实现 LLM 调用模块')
  }

  /**
   * 获取对话历史
   */
  getConversationHistory(): ConversationHistory {
    return this.conversationHistory
  }

  /**
   * 清空对话历史
   */
  clearHistory(): void {
    this.conversationHistory.messages = []
    this.conversationHistory.updatedAt = new Date()
  }

  /**
   * 获取会话 ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * RAG Agent 类
 */
export class RagAgent extends BaseAgent {
  private chatAgent: ChatAgent

  constructor() {
    super('RagAgent', 5)
    this.chatAgent = new ChatAgent()
  }

  /**
   * 执行 RAG 任务
   * @param query 查询内容
   * @returns 包含答案和来源的响应
   */
  async execute(query: string): Promise<{
    answer: string
    sources: any[]
    conversationId: string
  }> {
    const response = await this.chatAgent.sendMessage(query)

    return {
      answer: response,
      sources: [],
      conversationId: this.chatAgent.getConversationHistory().sessionId,
    }
  }

  /**
   * 获取聊天 Agent 实例
   */
  getChatAgent(): ChatAgent {
    return this.chatAgent
  }

  /**
   * 清空历史
   */
  clearHistory(): void {
    this.chatAgent.clearHistory()
  }
}

/**
 * 通用 Agent 执行器
 */
export class AgentExecutor {
  private agents: BaseAgent[]

  constructor(agents?: BaseAgent[]) {
    this.agents = agents || []
  }

  /**
   * 注册 Agent
   * @param agent 要注册的 Agent
   */
  registerAgent(agent: BaseAgent): void {
    this.agents.push(agent)
  }

  /**
   * 执行所有 Agent
   * @param input 输入数据
   * @returns 所有 Agent 的结果
   */
  async executeAll(input: any): Promise<any[]> {
    const results: any[] = []

    for (const agent of this.agents) {
      try {
        const result = await agent.execute(input)
        results.push({
          agentName: agent.getName(),
          result,
          status: 'success',
        })
      } catch (error) {
        results.push({
          agentName: agent.getName(),
          result: null,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  }

  /**
   * 执行指定 Agent
   * @param agentName Agent 名称
   * @param input 输入数据
   * @returns Agent 结果
   */
  async executeAgent(agentName: string, input: any): Promise<any> {
    const agent = this.agents.find((a) => a.getName() === agentName)

    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`)
    }

    return await agent.execute(input)
  }

  /**
   * 获取所有 Agent
   */
  getAgents(): BaseAgent[] {
    return [...this.agents]
  }
}

/**
 * 全局 Agent 执行器实例
 */
export const agentExecutor = new AgentExecutor()

/**
 * 创建聊天 Agent 的便捷函数
 */
export function createChatAgent(): ChatAgent {
  return new ChatAgent()
}

/**
 * 创建 RAG Agent 的便捷函数
 */
export function createRagAgent(): RagAgent {
  return new RagAgent()
}

/**
 * 创建 Agent 执行器的便捷函数
 */
export function createAgentExecutor(): AgentExecutor {
  return new AgentExecutor()
}
