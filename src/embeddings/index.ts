/**
 * 向量嵌入模块
 * 提供文本向量化功能
 */

import type { EmbeddingResult, AppConfig } from '../types'

/**
 * 向量嵌入器类
 */
export class EmbeddingService {
  private config: AppConfig['embeddings']
  private model: string
  private dimension: number

  constructor(
    model: string = 'text-embedding-3-small',
    dimension: number = 1536,
    config?: Partial<AppConfig['embeddings']>
  ) {
    this.model = model
    this.dimension = dimension
    this.config = {
      model,
      dimension,
      batchSize: 10,
      ...config,
    }
  }

  /**
   * 将文本转换为向量
   * @param text 要转换的文本
   * @returns 向量嵌入结果
   */
  async embed(text: string): Promise<EmbeddingResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('输入文本不能为空')
    }

    const vector = await this.getVector(text)
    return {
      vector,
      dimension: vector.length,
      text: text.trim(),
    }
  }

  /**
   * 批量转换文本为向量
   * @param texts 要转换的文本数组
   * @returns 向量嵌入结果数组
   */
  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = []

    for (let i = 0; i < texts.length; i += this.config.batchSize) {
      const batch = texts.slice(i, i + this.config.batchSize)
      const batchResults = await Promise.all(
        batch.map(async (text) => await this.embed(text))
      )
      results.push(...batchResults)
    }

    return results
  }

  /**
   * 获取文本的向量表示
   * @param text 文本内容
   * @returns 向量数组
   */
  private async getVector(text: string): Promise<number[]> {
    // TODO: 调用实际的 embedding API
    // 示例：调用 OpenAI embedding API
    // const response = await fetch('https://api.openai.com/v1/embeddings', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     model: this.model,
    //     input: text,
    //   }),
    // })
    // const data = await response.json()
    // return data.data[0].embedding

    // 模拟实现
    return this.simulateEmbedding(text)
  }

  /**
   * 模拟向量嵌入（仅用于演示）
   * @param text 文本内容
   * @returns 模拟向量
   */
  private simulateEmbedding(text: string): number[] {
    // 实际项目中这里应该调用真实的 embedding API
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const vector: number[] = []
    for (let i = 0; i < this.dimension; i++) {
      const value = (seed + i * 13) % 1000 / 1000
      vector.push(Math.sin(value * i) * 0.5 + 0.5)
    }
    return vector
  }

  /**
   * 计算两个向量的余弦相似度
   * @param vectorA 向量A
   * @param vectorB 向量B
   * @returns 相似度分数（0-1）
   */
  cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('向量维度不匹配')
    }

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i]
      magnitudeA += vectorA[i] * vectorA[i]
      magnitudeB += vectorB[i] * vectorB[i]
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0
    }

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  }

  /**
   * 设置批量大小
   * @param batchSize 批量大小
   */
  setBatchSize(batchSize: number): void {
    this.config.batchSize = Math.max(1, Math.min(100, batchSize))
  }
}

/**
 * 全局嵌入服务实例
 */
export const embeddingService = new EmbeddingService()

/**
 * 将文本转换为向量的便捷函数
 * @param text 文本内容
 * @returns 向量嵌入结果
 */
export async function embedText(text: string): Promise<EmbeddingResult> {
  return await embeddingService.embed(text)
}

/**
 * 批量转换文本为向量的便捷函数
 * @param texts 文本数组
 * @returns 向量嵌入结果数组
 */
export async function embedTextBatch(texts: string[]): Promise<EmbeddingResult[]> {
  return await embeddingService.embedBatch(texts)
}

/**
 * 计算文本相似度的便捷函数
 * @param textA 文本A
 * @param textB 文本B
 * @returns 相似度分数
 */
export async function calculateSimilarity(
  textA: string,
  textB: string
): Promise<number> {
  const embeddingA = await embeddingService.embed(textA)
  const embeddingB = await embeddingService.embed(textB)
  return embeddingService.cosineSimilarity(embeddingA.vector, embeddingB.vector)
}
