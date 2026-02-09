-- 添加游戏房间、房间玩家和聊天消息表
-- 迁移版本：002

-- 创建游戏房间表（与现有代码兼容）
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  max_players INTEGER DEFAULT 4,
  current_players INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  password TEXT,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  game_mode TEXT DEFAULT 'casual',
  ai_players INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建房间玩家表
CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  is_host BOOLEAN DEFAULT false,
  is_ready BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

-- 创建聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'player',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_host_id ON game_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_created_at ON game_rooms(created_at);

CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_player_id ON room_players(player_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- 添加注释
COMMENT ON TABLE game_rooms IS '游戏房间表';
COMMENT ON TABLE room_players IS '房间玩家关系表';
COMMENT ON TABLE chat_messages IS '聊天消息表';