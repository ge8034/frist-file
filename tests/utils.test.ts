/**
 * 工具函数测试
 */

// 模拟 localStorage 用于 Node.js 环境
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null
  },
  setItem(key: string, value: string) {
    this.store[key] = value
  },
  removeItem(key: string) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  }
}

// 只在 Node.js 环境中设置全局 localStorage
if (typeof window === 'undefined') {
  ;(global as any).localStorage = localStorageMock
}

import { vi } from 'vitest'
import {
  generateId,
  delay,
  debounce,
  throttle,
  deepClone,
  randomString,
  saveToLocal,
  loadFromLocal,
  formatDateTime,
  truncateText,
  isEmptyObject,
  mergeObjects,
} from '@/src/utils'

describe('工具函数', () => {
  describe('generateId', () => {
    test('应该生成唯一ID', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
    })

    test('ID应该包含时间戳', () => {
      const id = generateId()

      expect(id).toBeDefined()
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('delay', () => {
    test('应该延迟指定时间', async () => {
      const startTime = Date.now()
      await delay(100)
      const endTime = Date.now()

      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    })
  })

  describe('debounce', () => {
    test('应该在等待时间后执行函数', async () => {
      const executed = vi.fn()
      const debouncedFn = debounce(executed, 100)

      debouncedFn()
      debouncedFn()

      await delay(150)
      expect(executed).toHaveBeenCalledTimes(1)
    })

    test('应该在等待时间后再次执行', async () => {
      const executed = vi.fn()
      const debouncedFn = debounce(executed, 100)

      debouncedFn()
      await delay(150)
      debouncedFn()

      await delay(150)
      expect(executed).toHaveBeenCalledTimes(2)
    })
  })

  describe('throttle', () => {
    test('应该在时间限制内只执行一次', async () => {
      const executed = vi.fn()
      const throttledFn = throttle(executed, 100)

      throttledFn()
      throttledFn()

      await delay(150)
      expect(executed).toHaveBeenCalledTimes(1)
    })
  })

  describe('deepClone', () => {
    test('应该深度克隆对象', () => {
      const original = { a: 1, b: { c: 2 }, d: [3, 4] }
      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
      expect(cloned.d).not.toBe(original.d)
    })

    test('应该克隆数组', () => {
      const original = [1, 2, 3]
      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })

    test('应该克隆原始值', () => {
      expect(deepClone(null)).toBeNull()
      expect(deepClone(undefined)).toBeUndefined()
      expect(deepClone(1)).toBe(1)
      expect(deepClone('string')).toBe('string')
    })
  })

  describe('randomString', () => {
    test('应该生成指定长度的随机字符串', () => {
      const str = randomString(10)

      expect(str).toHaveLength(10)
      expect(/[a-zA-Z0-9]/.test(str)).toBe(true)
    })

    test('默认应该生成8位字符串', () => {
      const str = randomString()

      expect(str).toHaveLength(8)
    })
  })

  describe('formatDateTime', () => {
    test('应该格式化日期时间', () => {
      const date = new Date('2024-01-15T10:30:00')
      const formatted = formatDateTime(date)

      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })

    test('应该处理时间戳', () => {
      const timestamp = Date.now()
      const formatted = formatDateTime(timestamp)

      expect(formatted).toBeDefined()
    })
  })

  describe('truncateText', () => {
    test('应该截断超出长度的文本', () => {
      const text = '这是一段很长的文本用于测试截断功能'
      const truncated = truncateText(text, 10, '...')

      expect(truncated).toBe('这是一段很长的...')
    })

    test('应该返回未截断的文本', () => {
      const text = '短文本'
      const truncated = truncateText(text, 100)

      expect(truncated).toBe(text)
    })
  })

  describe('isEmptyObject', () => {
    test('应该识别空对象', () => {
      expect(isEmptyObject({})).toBe(true)
      expect(isEmptyObject({ a: 1 })).toBe(false)
    })

    test('应该处理非对象值', () => {
      expect(isEmptyObject(null)).toBe(false)
      expect(isEmptyObject(undefined)).toBe(false)
      expect(isEmptyObject('string')).toBe(false)
      expect(isEmptyObject(1)).toBe(false)
    })
  })

  describe('mergeObjects', () => {
    test('应该合并多个对象', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 3, c: 4 }
      const obj3 = { c: 5, d: 6 }

      const merged = mergeObjects(obj1, obj2, obj3)

      expect(merged).toEqual({ a: 1, b: 3, c: 5, d: 6 })
    })

    test('应该合并对象', () => {
      const obj1 = { a: 1 }
      const obj2 = { b: 2 }

      const merged = mergeObjects(obj1, obj2)

      expect(merged).toEqual({ a: 1, b: 2 })
    })

    test('应该处理空对象', () => {
      const merged = mergeObjects({}, {}, {})

      expect(merged).toEqual({})
    })
  })
})
