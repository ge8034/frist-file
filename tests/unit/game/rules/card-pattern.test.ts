/**
 * 牌型单元测试
 */

import { describe, it, expect } from 'vitest'
import { CardPatternVO, CardPatternType } from '../../../../lib/domain/value-objects/CardPatternVO'
import { comparePatterns } from '../../../../lib/features/game/rules/CardPattern'

describe('牌型系统', () => {
  describe('CardPatternVO', () => {
    it('应该创建有效的单张牌型', () => {
      const mockCard = { rank: 'A', suit: 'heart' } as any
      const pattern = new CardPatternVO(
        CardPatternType.SINGLE,
        [mockCard],
        'A',
        1,
        14,
        1,
        true
      )

      expect(pattern.type).toBe(CardPatternType.SINGLE)
      expect(pattern.rank).toBe('A')
      expect(pattern.isValid).toBe(true)
    })

    it('应该创建有效的对子牌型', () => {
      const mockCards = [
        { rank: 'K', suit: 'heart' },
        { rank: 'K', suit: 'spade' }
      ] as any

      const pattern = new CardPatternVO(
        CardPatternType.PAIR,
        mockCards,
        'K',
        2,
        13,
        2,
        true
      )

      expect(pattern.type).toBe(CardPatternType.PAIR)
      expect(pattern.rank).toBe('K')
      expect(pattern.count).toBe(2)
    })
  })

  describe('牌型比较', () => {
    it('应该正确比较单张牌型', () => {
      const pattern1 = new CardPatternVO(
        CardPatternType.SINGLE,
        [{ rank: 'A' }] as any,
        'A',
        1,
        14,
        1,
        true
      )

      const pattern2 = new CardPatternVO(
        CardPatternType.SINGLE,
        [{ rank: 'K' }] as any,
        'K',
        1,
        13,
        1,
        true
      )

      const result = comparePatterns(pattern1, pattern2)

      expect(result.greater).toBe(true)
      expect(result.canBeat).toBe(true)
    })

    it('应该正确处理相同牌型的比较', () => {
      const pattern1 = new CardPatternVO(
        CardPatternType.SINGLE,
        [{ rank: '10' }] as any,
        '10',
        1,
        10,
        1,
        true
      )

      const pattern2 = new CardPatternVO(
        CardPatternType.SINGLE,
        [{ rank: '10' }] as any,
        '10',
        1,
        10,
        1,
        true
      )

      const result = comparePatterns(pattern1, pattern2)

      expect(result.equal).toBe(true)
      expect(result.canBeat).toBe(false)
    })

    it('应该正确处理炸弹牌型', () => {
      const bombPattern = new CardPatternVO(
        CardPatternType.BOMB,
        Array(4).fill({ rank: 'A' }) as any,
        'A',
        4,
        56, // 4张A炸弹的值
        4,
        true
      )

      const singlePattern = new CardPatternVO(
        CardPatternType.SINGLE,
        [{ rank: '2' }] as any, // 2是最大的单张
        '2',
        1,
        15,
        1,
        true
      )

      const result = comparePatterns(bombPattern, singlePattern)

      // 炸弹应该能打过任何非炸弹牌型
      expect(result.canBeat).toBe(true)
    })
  })
})
