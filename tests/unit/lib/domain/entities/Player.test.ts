/**
 * Player 实体单元测试
 */

import { describe, it, expect } from 'vitest'
import { Player } from '@/lib/domain/entities/Player'
import { Card, CardCollection } from '@/lib/domain/value-objects/Card'
import type { Card as CardType } from '@/lib/types/game'

describe('Player 实体', () => {
  describe('创建玩家', () => {
    it('应该成功创建人类玩家', () => {
      const player = new Player('user123', '玩家A', 'human')

      expect(player.userId).toBe('user123')
      expect(player.nickname).toBe('玩家A')
      expect(player.type).toBe('human')
      expect(player.position).toBeNull()
      expect(player.isReady).toBe(false)
      expect(player.isDealer).toBe(false)
      expect(player.score).toBe(0)
      expect(player.handCards).toEqual([])
    })

    it('应该成功创建AI玩家', () => {
      const player = new Player('ai001', 'AI_小明', 'ai')

      expect(player.userId).toBe('ai001')
      expect(player.type).toBe('ai')
    })

    it('应该成功设置位置', () => {
      const player = new Player('user123', '玩家A')
      player.setPosition('south')

      expect(player.position).toBe('south')
    })

    it('游戏进行中不能更改位置', () => {
      const player = new Player('user123', '玩家A')
      player.setPosition('south')
      player.startSession()

      expect(() => player.setPosition('north')).toThrow('游戏进行中不能更改位置')
    })
  })

  describe('准备状态', () => {
    it('应该设置准备状态', () => {
      const player = new Player('user123', '玩家A')
      player.setReady(true)

      expect(player.isReady).toBe(true)
    })

    it('应该取消准备状态', () => {
      const player = new Player('user123', '玩家A')
      player.setReady(true)
      player.setReady(false)

      expect(player.isReady).toBe(false)
    })
  })

  describe('庄家状态', () => {
    it('应该设置庄家状态', () => {
      const player = new Player('user123', '玩家A')
      player.setDealer(true)

      expect(player.isDealer).toBe(true)
    })
  })

  describe('搭档关系', () => {
    it('应该设置搭档关系', () => {
      const player = new Player('user123', '玩家A')
      player.setPartner(true)

      expect(player.isPartner).toBe(true)
    })

    it('应该更新搭档状态', () => {
      const player = new Player('user123', '玩家A')
      player.updatePartnerStatus('paired')

      expect(player.partnerStatus).toBe('paired')
    })
  })

  describe('得分管理', () => {
    it('应该增加得分', () => {
      const player = new Player('user123', '玩家A')
      player.addScore(100)

      expect(player.score).toBe(100)
    })

    it('应该正确计算总分', () => {
      const player = new Player('user123', '玩家A')
      player.addScore(100)
      player.addScore(50)
      player.addScore(-30)

      expect(player.score).toBe(120)
    })
  })

  describe('手牌管理', () => {
    it('应该设置手牌', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()
      const cards = [
        { id: '1', suit: 'spade', rank: 'A', value: 1 } as CardType,
        { id: '2', suit: 'heart', rank: 'K', value: 13 } as CardType,
      ]
      const cardObjects = cards.map(c => new Card(c.id, c.suit, c.rank, c.value))
      player.setHandCards(cardObjects)

      expect(player.handCards).toHaveLength(2)
      expect(player.remainingCards).toBe(2)
    })

    it('应该扣减手牌', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()
      const cards = [
        { id: '1', suit: 'spade', rank: 'A', value: 1 } as CardType,
        { id: '2', suit: 'heart', rank: 'K', value: 13 } as CardType,
      ]
      const cardObjects = cards.map(c => new Card(c.id, c.suit, c.rank, c.value))
      player.setHandCards(cardObjects)

      player.playCards([cardObjects[0]])

      expect(player.handCards).toHaveLength(1)
      expect(player.remainingCards).toBe(1)
    })

    it('游戏外不能设置手牌', () => {
      const player = new Player('user123', '玩家A')
      const card = new Card('1', 'spade', 'A', 1)

      expect(() => player.setHandCards([card])).toThrow('玩家不在游戏中')
    })

    it('游戏外不能出牌', () => {
      const player = new Player('user123', '玩家A')
      const card = new Card('1', 'spade', 'A', 1)

      expect(() => player.playCards([card])).toThrow('玩家不在游戏中')
    })

    it('应该验证出牌合法性', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()
      const card1 = new Card('1', 'spade', 'A', 1)
      const card2 = new Card('2', 'heart', 'K', 13)
      const card3 = new Card('3', 'club', 'Q', 12) // 玩家没有的卡牌
      player.setHandCards([card1, card2])

      expect(() => player.playCards([card2, card3])).toThrow('玩家 玩家A 没有这张卡牌')
    })
  })

  describe('游戏会话管理', () => {
    it('应该开始游戏会话', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()

      expect(player.isInGame()).toBe(true)
      expect(player.isEliminated).toBe(false)
      expect(player.state).toBe('ready')
    })

    it('应该结束游戏会话', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()
      player.endSession()

      expect(player.isInGame()).toBe(false)
      expect(player.state).toBe('waiting')
    })

    it('离线时应该标记为淘汰', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()
      player.goOffline()

      expect(player.isEliminated).toBe(true)
      expect(player.state).toBe('out')
    })

    it('重新上线应该清除淘汰状态', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()
      player.goOffline()
      player.goOnline()

      expect(player.isEliminated).toBe(false)
    })
  })

  describe('出牌权限检查', () => {
    it('游戏中可以出牌', () => {
      const player = new Player('user123', '玩家A')
      player.setPosition('south')
      player.startSession()
      player.setReady(true)

      expect(player.canPlay()).toBe(true)
    })

    it('不在游戏中不能出牌', () => {
      const player = new Player('user123', '玩家A')
      const card = new Card('1', 'spade', 'A', 1)

      expect(player.canPlay()).toBe(false)
      expect(() => player.playCards([card])).toThrow('玩家不在游戏中')
    })

    it('非准备状态不能出牌', () => {
      const player = new Player('user123', '玩家A')
      player.setPosition('south')
      player.startSession()
      player.setReady(false)

      expect(player.canPlay()).toBe(false)
    })
  })

  describe('状态流转', () => {
    it('应该正确流转思考状态', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()

      player.startThinking()
      expect(player.state).toBe('thinking')

      player.stopThinking()
      expect(player.state).toBe('ready')
    })

    it('应该正确流转游戏状态', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()

      player.startPlaying()
      expect(player.state).toBe('playing')
    })

    it('应该正确处理弃牌', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()

      player.surrender()

      expect(player.state).toBe('surrender')
      expect(player.isEliminated).toBe(true)
    })
  })

  describe('快照和恢复', () => {
    it('应该生成玩家快照', () => {
      const player = new Player('user123', '玩家A')
      player.setPosition('south')
      player.setReady(true)
      player.setDealer(true)
      player.isPartner = true
      player.partnerStatus = 'paired'
      player.score = 100
      player.state = 'ready'
      player.turnCount = 5
      player.startSession()

      const snapshot = player.toSnapshot()

      expect(snapshot.userId).toBe('user123')
      expect(snapshot.nickname).toBe('玩家A')
      expect(snapshot.position).toBe('south')
      expect(snapshot.isReady).toBe(true)
      expect(snapshot.isDealer).toBe(true)
      expect(snapshot.score).toBe(100)
      expect(snapshot.state).toBe('ready')
      expect(snapshot.turnCount).toBe(5)
    })

    it('应该从快照恢复玩家', () => {
      const snapshot = {
        userId: 'user123',
        nickname: '玩家A',
        type: 'human' as const,
        position: 'north',
        isReady: true,
        isDealer: false,
        isPartner: true,
        partnerStatus: 'paired',
        score: 50,
        remainingCards: 10,
        state: 'ready',
        turnCount: 3,
        inGameSession: true,
        isEliminated: false,
      }

      const player = Player.fromSnapshot(snapshot)

      expect(player.userId).toBe('user123')
      expect(player.nickname).toBe('玩家A')
      expect(player.position).toBe('north')
      expect(player.isReady).toBe(true)
      expect(player.score).toBe(50)
      expect(player.turnCount).toBe(3)
      expect(player.isEliminated).toBe(false)
    })

    it('应该从快照重建手牌列表', () => {
      const snapshot = {
        userId: 'user123',
        nickname: '玩家A',
        type: 'human' as const,
        position: 'south',
        isReady: true,
        isDealer: false,
        isPartner: false,
        partnerStatus: 'unknown',
        score: 0,
        remainingCards: 0,
        state: 'ready',
        turnCount: 0,
        inGameSession: true,
        isEliminated: false,
      }

      const player = Player.fromSnapshot(snapshot)

      expect(player.handCards).toEqual([])
    })
  })

  describe('回合计数', () => {
    it('应该增加回合计数', () => {
      const player = new Player('user123', '玩家A')
      player.startSession()

      player.incrementTurnCount()
      expect(player.turnCount).toBe(1)

      player.incrementTurnCount()
      player.incrementTurnCount()
      expect(player.turnCount).toBe(3)
    })
  })

  describe('CardCollection 集合操作', () => {
    it('应该创建空卡牌集合', () => {
      const collection = new CardCollection()
      expect(collection.isEmpty()).toBe(true)
      expect(collection.count()).toBe(0)
    })

    it('应该添加卡牌', () => {
      const card1 = new Card('1', 'spade', 'A', 1)
      const card2 = new Card('2', 'heart', 'K', 13)
      const collection = new CardCollection([card1])

      collection.addCards([card2])

      expect(collection.count()).toBe(2)
    })

    it('应该移除卡牌', () => {
      const card1 = new Card('1', 'spade', 'A', 1)
      const card2 = new Card('2', 'heart', 'K', 13)
      const collection = new CardCollection([card1, card2])

      collection.removeCards([card1])

      expect(collection.count()).toBe(1)
    })

    it('应该按数值排序', () => {
      const cards = [
        new Card('1', 'spade', '3', 3),
        new Card('2', 'heart', 'A', 1),
        new Card('3', 'club', '10', 10),
      ]
      const collection = new CardCollection(cards)

      collection.sortByValue(true)

      expect(collection.getAll()[0].rank).toBe('A')
      expect(collection.getAll()[1].rank).toBe('3')
      expect(collection.getAll()[2].rank).toBe('10')
    })

    it('应该按数值降序排序', () => {
      const cards = [
        new Card('1', 'spade', '3', 3),
        new Card('2', 'heart', 'A', 1),
        new Card('3', 'club', '10', 10),
      ]
      const collection = new CardCollection(cards)

      collection.sortByValue(false)

      expect(collection.getAll()[0].rank).toBe('10')
      expect(collection.getAll()[1].rank).toBe('3')
      expect(collection.getAll()[2].rank).toBe('A')
    })

    it('应该按花色分组', () => {
      const cards = [
        new Card('1', 'spade', 'A', 1),
        new Card('2', 'heart', 'K', 13),
        new Card('3', 'spade', '10', 10),
      ]
      const collection = new CardCollection(cards)

      const groups = collection.groupBySuit()
      expect(groups.get('spade')?.length).toBe(2)
      expect(groups.get('heart')?.length).toBe(1)
    })

    it('应该检查包含关系', () => {
      const card = new Card('1', 'spade', 'A', 1)
      const collection = new CardCollection([card])

      expect(collection.contains(card)).toBe(true)
      expect(collection.contains(new Card('2', 'heart', 'K', 13))).toBe(false)
    })
  })

  describe('Card 卡牌比较', () => {
    it('应该正确比较大小王', () => {
      const smallJoker = new Card('1', 'joker', 'JOKER', 0, 'small')
      const bigJoker = new Card('2', 'joker', 'JOKER', 1, 'big')

      expect(smallJoker.compareTo(bigJoker)).toBe(-1)
      expect(bigJoker.compareTo(smallJoker)).toBe(1)
    })

    it('应该正确比较普通卡牌', () => {
      const card1 = new Card('1', 'spade', '3', 3)
      const card2 = new Card('2', 'heart', 'A', 1)

      expect(card1.compareTo(card2)).toBe(2)
      expect(card2.compareTo(card1)).toBe(-2)
    })

    it('应该检测相等卡牌', () => {
      const card1 = new Card('1', 'spade', 'A', 1)
      const card2 = new Card('1', 'spade', 'A', 1)
      const card3 = new Card('2', 'spade', 'A', 1)

      expect(card1.equals(card1)).toBe(true)
      expect(card1.equals(card2)).toBe(true)
      // 相同花色和点数的卡牌被视为相等，即使id不同
      expect(card1.equals(card3)).toBe(true)
    })
  })
})
