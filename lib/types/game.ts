/**
 * 游戏核心类型定义
 */

// 牌花色
export type CardSuit = 'spade' | 'heart' | 'club' | 'diamond' | 'joker';

// 牌面
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'JOKER';

// 大小王类型
export type JokerType = 'small' | 'big';

// 卡牌类型
export interface Card {
  suit: CardSuit;
  rank: CardRank;
  value: number;
  id: string;
  displayRank?: string;
  isJoker?: boolean;
}

// 玩家ID类型
export type PlayerId = string;

// 玩家角色
export type PlayerRole = 'host' | 'partner' | 'opponent';

// 玩家状态
export type PlayerStatus = 'ready' | 'playing' | 'idle' | 'offline';

// 游戏状态
export type GameState = 'waiting' | 'bidding' | 'playing' | 'finished' | 'paused';

// 游戏阶段
export type GamePhase = 'setup' | 'bidding' | 'playing' | 'round_end' | 'game_end';

// 回合阶段
export type TurnPhase = 'player_turn' | 'ai_turn' | 'pass' | 'wait';

// 游戏方向
export type GameDirection = 'clockwise' | 'counter-clockwise';

// 回合数
export type GameRound = 1 | 2 | 3 | 4;

// 玩家类型
export type PlayerType = 'human' | 'ai' | 'bot';

// 出牌选择
export type PlayChoice = 'play' | 'pass' | 'hint' | 'undo';
