/**
 * Card 组件演示页面
 *
 * 展示 Card 组件的各种状态和用法
 */

import React from 'react'
import { Card } from '../components/ui/Card'
import { Card as CardEntity } from '../lib/domain/entities/Card'

/**
 * 生成卡牌组
 */
const generateDeck = () => {
  const deck = CardEntity.createGuandanDeck()
  // 只显示前几张卡牌用于演示
  return deck.slice(0, 12)
}

const deck = generateDeck()

/**
 * 演示卡片
 */
export default function CardDemo() {
  const [selectedCards, setSelectedCards] = React.useState<Set<string>>(new Set())
  const [disabledCard, setDisabledCard] = React.useState<CardEntity | null>(null)

  const handleCardClick = (card: CardEntity) => {
    setSelectedCards(prev => {
      const next = new Set(prev)
      if (next.has(card.id)) {
        next.delete(card.id)
      } else {
        next.add(card.id)
      }
      return next
    })
  }

  const toggleDisabledCard = () => {
    if (!disabledCard) {
      setDisabledCard(deck[deck.length - 1])
    } else {
      setDisabledCard(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Card 组件演示</h1>

      {/* 普通卡牌组 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">普通卡牌组</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {deck.map(card => (
            <Card
              key={card.id}
              card={card}
              selected={selectedCards.has(card.id)}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
        <p className="text-center text-gray-600 mt-4">
          已选择 {selectedCards.size} 张卡牌
        </p>
      </section>

      {/* 大小王演示 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">大小王</h2>
        <div className="flex gap-8 justify-center">
          <Card
            card={new CardEntity('joker-1', 'joker', 'JOKER', 0, 'small')}
            selected={false}
          />
          <Card
            card={new CardEntity('joker-2', 'joker', 'JOKER', 0, 'big')}
            selected={false}
          />
        </div>
      </section>

      {/* 翻转卡牌演示 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">翻转卡牌</h2>
        <div className="flex gap-4 justify-center">
          <Card
            card={new CardEntity('spade-1', 'spade', 'A', 14)}
            selected={false}
          />
          <Card
            card={new CardEntity('spade-2', 'spade', 'K', 13)}
            selected={false}
          />
        </div>
      </section>

      {/* 禁用状态演示 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">禁用状态</h2>
        <div className="flex gap-4 justify-center">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleDisabledCard}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {disabledCard ? '启用卡牌' : '禁用最后一张卡牌'}
            </button>
            <Card
              card={disabledCard || new CardEntity('disabled', 'spade', '2', 2)}
              selected={false}
              disabled={!!disabledCard}
            />
          </div>
        </div>
      </section>

      {/* 选中状态演示 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">选中状态</h2>
        <div className="flex gap-4 justify-center">
          {deck.slice(0, 6).map(card => (
            <Card
              key={card.id}
              card={card}
              selected={card.rank === 'A' || card.rank === 'K'}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      </section>

      {/* 自定义样式演示 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">自定义样式</h2>
        <div className="flex gap-4 justify-center">
          <Card
            card={new CardEntity('custom-1', 'heart', 'A', 14)}
            selected={false}
            className="ring-2 ring-green-500"
          />
          <Card
            card={new CardEntity('custom-2', 'diamond', 'K', 13)}
            selected={true}
            className="ring-2 ring-yellow-500"
          />
        </div>
      </section>

      {/* 可访问性说明 */}
      <section className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">可访问性特性</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>完整的 ARIA 属性支持</li>
          <li>支持键盘操作（Enter 和空格键）</li>
          <li>禁用状态有适当的语义支持</li>
          <li>屏幕阅读器友好</li>
        </ul>
      </section>
    </div>
  )
}
