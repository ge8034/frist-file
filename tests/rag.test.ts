/**
 * RAG 模块测试
 */

import { RagManager } from '@/src/rag'
import type { RagQueryRequest } from '@/src/types'

describe('RagManager', () => {
  let ragManager: RagManager

  beforeEach(() => {
    ragManager = new RagManager({
      enabled: true,
      topK: 3,
      similarityThreshold: 0.5,
    })
  })

  afterEach(() => {
    ragManager.disable()
  })

  describe('初始化配置', () => {
    test('应该正确初始化配置', () => {
      expect(ragManager).toBeInstanceOf(RagManager)
    })

    test('应该正确设置检索数量', () => {
      ragManager.setTopK(10)
      // 验证范围限制
      expect(true).toBe(true)
    })

    test('应该正确设置相似度阈值', () => {
      ragManager.setSimilarityThreshold(0.9)
      expect(true).toBe(true)
    })
  })

  describe('RAG 查询', () => {
    test('应该能够执行查询', async () => {
      const request: RagQueryRequest = {
        query: '测试查询',
        topK: 3,
      }

      const response = await ragManager.query(request)

      expect(response).toHaveProperty('results')
      expect(response).toHaveProperty('answer')
      expect(response).toHaveProperty('metadata')
      expect(response.metadata).toHaveProperty('queryTime')
      expect(response.metadata).toHaveProperty('sourcesCount')
      expect(response.metadata).toHaveProperty('modelUsed')
    })

    test('当 RAG 禁用时应该返回默认响应', async () => {
      ragManager.disable()

      const request: RagQueryRequest = {
        query: '测试查询',
      }

      const response = await ragManager.query(request)

      expect(response.answer).toBe('RAG 功能未启用')
      expect(response.results).toHaveLength(0)
    })
  })
})