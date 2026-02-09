/**
 * Card 组件测试
 *
 * 测试覆盖：
 * - 渲染正确性测试（正面、背面）
 * - 点击交互测试
 * - 样式测试（选中状态、禁用状态）
 * - 可访问性测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../../components/ui/Card'
import { Card as CardEntity } from '../../lib/domain/entities/Card'

describe('Card 组件', () => {
  describe('渲染正确性', () => {
    it('应该渲染普通卡牌（正面）', () => {
      const card = new CardEntity('1', 'spade', 'A', 14)
      render(<Card card={card} />)

      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('♠')).toBeInTheDocument()
    })

    it('应该渲染红桃卡牌（红色）', () => {
      const card = new CardEntity('2', 'heart', 'K', 13)
      render(<Card card={card} />)

      const cardElement = screen.getByRole('button')
      expect(cardElement).toHaveClass(/text-red-600/)
    })

    it('应该渲染方块卡牌（红色）', () => {
      const card = new CardEntity('3', 'diamond', 'Q', 12)
      render(<Card card={card} />)

      const cardElement = screen.getByRole('button')
      expect(cardElement).toHaveClass(/text-red-600/)
    })

    it('应该渲染梅花卡牌（黑色）', () => {
      const card = new CardEntity('4', 'club', 'J', 11)
      render(<Card card={card} />)

      const cardElement = screen.getByRole('button')
      expect(cardElement).toHaveClass(/text-gray-900/)
    })

    it('应该渲染黑桃卡牌（黑色）', () => {
      const card = new CardEntity('5', 'spade', '10', 10)
      render(<Card card={card} />)

      const cardElement = screen.getByRole('button')
      expect(cardElement).toHaveClass(/text-gray-900/)
    })

    it('应该渲染小王（紫色）', () => {
      const card = new CardEntity('6', 'joker', 'JOKER', 0, 'small')
      render(<Card card={card} />)

      const cardElement = screen.getByRole('button')
      expect(cardElement).toHaveClass(/text-purple-600/)
      expect(screen.getByText('小王')).toBeInTheDocument()
      expect(screen.getByText('🎭')).toBeInTheDocument()
    })

    it('应该渲染大王（紫色）', () => {
      const card = new CardEntity('7', 'joker', 'JOKER', 0, 'big')
      render(<Card card={card} />)

      const cardElement = screen.getByRole('button')
      expect(cardElement).toHaveClass(/text-purple-600/)
      expect(screen.getByText('大王')).toBeInTheDocument()
      expect(screen.getByText('🤡')).toBeInTheDocument()
    })

    it('应该渲染卡牌背面（isFaceUp=false）', () => {
      const card = new CardEntity('8', 'spade', 'A', 14)
      render(<Card card={card} isFaceUp={false} />)

      expect(screen.getByText('🎴')).toBeInTheDocument()
      expect(screen.getByText('卡牌背面')).toBeInTheDocument()
    })
  })

  describe('点击交互测试', () => {
    it('应该调用 onClick 回调', () => {
      const card = new CardEntity('9', 'spade', 'A', 14)
      const handleClick = vi.fn()

      render(<Card card={card} onClick={handleClick} />)

      const cardElement = screen.getByRole('button')
      cardElement.click()

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('点击卡牌应该触发正确的 aria-label', () => {
      const card = new CardEntity('10', 'heart', 'K', 13)
      const handleClick = vi.fn()

      render(<Card card={card} onClick={handleClick} />)

      const cardElement = screen.getByRole('button')
      expect(cardElement).toHaveAttribute('aria-label', 'K♥')
    })

    it('应该正确设置 aria-pressed 状态', () => {
      const card = new CardEntity('11', 'spade', 'A', 14)

      render(<Card card={card} selected={false} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

      render(<Card card={card} selected={true} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('样式测试', () => {
    it('选中状态应该有蓝色边框和缩放效果', () => {
      const card = new CardEntity('12', 'spade', 'A', 14)

      const { container } = render(<Card card={card} selected={true} />)

      const cardElement = container.querySelector('[role="button"]')
      expect(cardElement).toHaveClass(/ring-4/)
      expect(cardElement).toHaveClass(/ring-blue-400/)
      expect(cardElement).toHaveClass(/scale-105/)
    })

    it('禁用状态应该有灰色滤镜和不可点击样式', () => {
      const card = new CardEntity('13', 'spade', 'A', 14)

      const { container } = render(<Card card={card} disabled={true} />)

      const cardElement = container.querySelector('[role="button"]')
      expect(cardElement).toHaveClass(/opacity-50/)
      expect(cardElement).toHaveClass(/cursor-not-allowed/)
      expect(cardElement).toHaveClass(/grayscale/)
    })

    it('应该使用标准卡牌尺寸（110px × 155px）', () => {
      const card = new CardEntity('14', 'spade', 'A', 14)

      const { container } = render(<Card card={card} />)

      const cardElement = container.querySelector('[role="button"]')
      expect(cardElement).toHaveStyle({ width: '110px', height: '155px' })
    })

    it('应该支持自定义 className', () => {
      const card = new CardEntity('15', 'spade', 'A', 14)

      const { container } = render(<Card card={card} className="custom-class" />)

      const cardElement = container.querySelector('[role="button"]')
      expect(cardElement).toHaveClass('custom-class')
    })
  })

  describe('可访问性测试', () => {
    it('应该有完整的 ARIA 属性', () => {
      const card = new CardEntity('16', 'spade', 'A', 14)
      const handleClick = vi.fn()

      render(
        <Card card={card} onClick={handleClick} selected={true} disabled={false} />
      )

      const cardElement = screen.getByRole('button')
      expect(cardElement).toHaveAttribute('role', 'button')
      expect(cardElement).toHaveAttribute('aria-label', 'A♠')
      expect(cardElement).toHaveAttribute('aria-pressed', 'true')
    })

    it('禁用状态应该设置 tabindex=-1', () => {
      const card = new CardEntity('17', 'spade', 'A', 14)

      const { container } = render(<Card card={card} disabled={true} />)

      const cardElement = container.querySelector('[role="button"]')
      expect(cardElement).toHaveAttribute('tabindex', '-1')
    })

    it('未禁用状态应该设置 tabindex=0', () => {
      const card = new CardEntity('18', 'spade', 'A', 14)

      const { container } = render(<Card card={card} disabled={false} />)

      const cardElement = container.querySelector('[role="button"]')
      expect(cardElement).toHaveAttribute('tabindex', '0')
    })

    it('应该支持键盘操作（Enter 和空格键）', () => {
      const card = new CardEntity('19', 'spade', 'A', 14)
      const handleClick = vi.fn()

      render(<Card card={card} onClick={handleClick} />)

      const cardElement = screen.getByRole('button')

      // 模拟键盘事件
      cardElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      expect(handleClick).toHaveBeenCalledTimes(1)

      // 重置 mock
      handleClick.mockClear()

      cardElement.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('禁用时不应该响应键盘操作', () => {
      const card = new CardEntity('20', 'spade', 'A', 14)
      const handleClick = vi.fn()

      render(<Card card={card} onClick={handleClick} disabled={true} />)

      const cardElement = screen.getByRole('button')

      // 模拟键盘事件
      cardElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('边界情况测试', () => {
    it('应该正确处理未选中的卡牌（默认值）', () => {
      const card = new CardEntity('21', 'spade', 'A', 14)

      render(<Card card={card} />)

      const cardElement = screen.getByRole('button')
      expect(cardElement).not.toHaveClass(/ring-4/)
    })

    it('应该正确处理未禁用的卡牌（默认值）', () => {
      const card = new CardEntity('22', 'spade', 'A', 14)

      render(<Card card={card} />)

      const cardElement = screen.getByRole('button')
      expect(cardElement).toHaveClass(/cursor-pointer/)
    })
  })
})
