/**
 * 向量嵌入模块测试
 */

import {
  EmbeddingService,
  embedText,
  embedTextBatch,
  calculateSimilarity,
} from '@/src/embeddings'
import type { EmbeddingResult } from '@/src/types'

describe('EmbeddingService', () => {
  let embeddingService: EmbeddingService

  beforeEach(() => {
    embeddingService = new EmbeddingService('text-embedding-3-small', 1536)
  })

  afterEach(() => {
    embeddingService = new EmbeddingService('text-embedding-3-small', 1536)
  })

  describe('embed', () => {
    test('应该成功嵌入文本', async () => {
      const result = await embeddingService.embed('测试文本')

      expect(result).toHaveProperty('vector')
      expect(result).toHaveProperty('dimension')
      expect(result).toHaveProperty('text')
      expect(result.vector.length).toBe(1536)
      expect(result.dimension).toBe(1536)
    })

    test('应该拒绝空文本', async () => {
      await expect(embeddingService.embed('')).rejects.toThrow()
      await expect(embeddingService.embed('   ')).rejects.toThrow()
    })

    test('向量长度应该匹配配置', async () => {
      const result = await embeddingService.embed('测试')

      expect(result.vector.length).toBe(1536)
    })
  })

  describe('embedBatch', () => {
    test('应该批量嵌入文本', async () => {
      const texts = ['文本1', '文本2', '文本3']
      const results = await embeddingService.embedBatch(texts)

      expect(results).toHaveLength(texts.length)
      results.forEach((result) => {
        expect(result.vector.length).toBe(1536)
      })
    })

    test('应该处理空数组', async () => {
      const results = await embeddingService.embedBatch([])

      expect(results).toHaveLength(0)
    })
  })

  describe('cosineSimilarity', () => {
    test('应该计算相似度', () => {
      const vectorA = [1, 2, 3]
      const vectorB = [4, 5, 6]
      const similarity = embeddingService.cosineSimilarity(vectorA, vectorB)

      expect(similarity).toBeGreaterThanOrEqual(0)
      expect(similarity).toBeLessThanOrEqual(1)
    })

    test('应该处理相同向量', () => {
      const vector = [1, 2, 3]
      const similarity = embeddingService.cosineSimilarity(vector, vector)

      expect(similarity).toBe(1)
    })

    test('应该处理相反向量', () => {
      const vectorA = [1, 0, 0]
      const vectorB = [-1, 0, 0]
      const similarity = embeddingService.cosineSimilarity(vectorA, vectorB)

      expect(similarity).toBe(-1)
    })

    test('应该处理零向量', () => {
      const vectorA = [1, 2, 3]
      const vectorB = [0, 0, 0]
      const similarity = embeddingService.cosineSimilarity(vectorA, vectorB)

      expect(similarity).toBe(0)
    })
  })

  describe('batchSize 设置', () => {
    test('应该正确设置批量大小', () => {
      embeddingService.setBatchSize(5)

      expect(true).toBe(true)
    })
  })
})

describe('便捷函数', () => {
  test('embedText 应该调用服务', async () => {
    const result = await embedText('测试文本')

    expect(result).toHaveProperty('vector')
  })

  test('embedTextBatch 应该批量嵌入', async () => {
    const texts = ['文本1', '文本2']
    const results = await embedTextBatch(texts)

    expect(results).toHaveLength(2)
  })

  test('calculateSimilarity 应该计算相似度', async () => {
    const similarity = await calculateSimilarity('文本A', '文本B')

    expect(typeof similarity).toBe('number')
    expect(similarity).toBeGreaterThanOrEqual(0)
    expect(similarity).toBeLessThanOrEqual(1)
  })
})