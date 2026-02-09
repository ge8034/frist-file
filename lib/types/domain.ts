/**
 * 领域相关类型定义
 */

// 游戏ID类型
export type GameId = string;

// 房间ID类型
export type RoomId = string;

// 赛事ID类型
export type TournamentId = string;

// 匹配ID类型
export type MatchId = string;

// 金钱类型
export type Money = number;

// 货币类型
export type Currency = 'CNY' | 'USD' | 'coins';

// 时间戳接口
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// 领域事件基类
export interface DomainEvent {
  id: string;
  type: string;
  payload: any;
  occurredAt: Date;
}

// 事件发布者接口
export interface EventPublisher {
  publish(event: DomainEvent): void;
  subscribe(eventType: string, handler: (event: DomainEvent) => void): void;
  unsubscribe(eventType: string, handler: (event: DomainEvent) => void): void;
}
