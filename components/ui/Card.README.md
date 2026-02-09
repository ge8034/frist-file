# Card 组件使用说明

## 概述

`Card` 组件是一个用于展示掼蛋游戏卡牌的 React 组件，支持花色、点数、大小王以及翻转状态。

## 安装

组件位于 `components/ui/Card.tsx`，使用时需要导入：

```tsx
import { Card } from '@/components/ui/Card'
import { Card as CardEntity } from '@/lib/domain/entities/Card'
```

## 基础用法

```tsx
// 创建卡牌实体
const card = new CardEntity('1', 'spade', 'A', 14)

// 渲染卡牌
<Card card={card} />
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `card` | `CardEntity` | **必填** | 卡牌数据实体 |
| `selected` | `boolean` | `false` | 是否被选中 |
| `onClick` | `() => void` | `undefined` | 点击回调函数 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `className` | `string` | `''` | 自定义样式类 |

## 选中状态

```tsx
const [selected, setSelected] = useState(false)

<Card
  card={card}
  selected={selected}
  onClick={() => setSelected(!selected)}
/>
```

选中时卡牌会显示：
- 蓝色边框（`ring-4 ring-blue-400`）
- 放大效果（`scale-105`）
- 更强的阴影

## 禁用状态

```tsx
<Card
  card={card}
  disabled={true}
  onClick={handleClick}
/>
```

禁用时卡牌会显示：
- 半透明效果（`opacity-50`）
- 灰色滤镜（`grayscale`）
- 不可点击光标
- `tabIndex=-1`

## 翻转状态

```tsx
<Card
  card={card}
  isFaceUp={true} // 显示正面
  isFaceUp={false} // 显示背面
/>
```

### 花色颜色

- 红桃（♥）：红色
- 方块（♦）：红色
- 梅花（♣）：黑色
- 黑桃（♠）：黑色
- 大小王：紫色

## 可访问性

组件完整支持键盘操作和屏幕阅读器：

- **ARIA 属性**：
  - `aria-label`: 卡牌的完整描述
  - `aria-pressed`: 选中状态
  - `role="button"`: 按钮角色

- **键盘支持**：
  - `Enter` 键：触发点击
  - `空格键`：触发点击

- **Tab 键导航**：
  - 未禁用时：`tabIndex=0`，可被 Tab 键选中
  - 禁用时：`tabIndex=-1`，不可被 Tab 键选中

## 示例

### 完整示例

```tsx
import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Card as CardEntity } from '@/lib/domain/entities/Card'

function MyComponent() {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())

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

  return (
    <div className="flex flex-wrap gap-4">
      {deck.map(card => (
        <Card
          key={card.id}
          card={card}
          selected={selectedCards.has(card.id)}
          onClick={() => handleCardClick(card)}
        />
      ))}
    </div>
  )
}
```

### 卡牌背面

```tsx
<Card
  card={card}
  isFaceUp={false}
/>
```

显示卡牌背面图案和文字。

### 大小王

```tsx
// 小王
<Card
  card={new CardEntity('joker-1', 'joker', 'JOKER', 0, 'small')}
/>

// 大王
<Card
  card={new CardEntity('joker-2', 'joker', 'JOKER', 0, 'big')}
/>
```

## 样式定制

组件使用 Tailwind CSS，可以通过 `className` 属性自定义样式：

```tsx
<Card
  card={card}
  selected={true}
  className="ring-2 ring-green-500"
/>
```

## 技术规格

- **尺寸**：110px × 155px
- **样式框架**：Tailwind CSS
- **样式硬编码**：不依赖外部配置
- **无外部依赖**：纯展示组件

## 测试

组件包含完整的测试套件：

```bash
# 运行 Card 组件测试
npm test tests/components/Card.test.tsx
```

测试覆盖：
- 渲染正确性（正面、背面、各种花色）
- 点击交互
- 选中/禁用状态
- 可访问性
- 边界情况

## 演示页面

查看 `examples/CardDemo.tsx` 获取完整的使用示例和所有状态的展示。

## 依赖

- `Card` 实体：`lib/domain/entities/Card.ts`
- 生成卡牌：`CardEntity.createGuandanDeck()`
