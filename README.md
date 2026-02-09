# GuanDan2 掼蛋游戏项目

> 基于 Clean Architecture 标准的掼蛋游戏项目，采用 Next.js 14 + Phaser 3 + Supabase 架构，支持多人在线对战，房间人数不足时由 AI 智能补足。

---

## 项目概述

**GuanDan2** 是一个基于 Clean Architecture 标准的掼蛋游戏项目，采用 Next.js 14 + Phaser 3 + Supabase 架构，支持多人在线对战，房间人数不足时由 AI 智能补足。

### 核心特性

- ✅ 完整掼蛋游戏规则实现
- ✅ AI 智能补足（最多 3 个 AI）
- ✅ 多人在线同步（Supabase Realtime）
- ✅ 实时语音服务
- ✅ Material Design 3 UI 风格
- ✅ Clean Architecture 架构

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **前端框架** | Next.js 14 | React 框架，App Router |
| **游戏引擎** | Phaser 3.80 | 2D 游戏渲染和逻辑 |
| **状态管理** | Zustand 5 | 轻量级状态管理 |
| **后端服务** | Supabase | BaaS (Auth + Realtime + PostgreSQL) |
| **类型检查** | Pyright (TypeScript 严格模式) | 类型安全 |
| **UI设计** | Material Design 3 | 主题样式 |

---

## 项目结构

```
GuanDan2/
├── lib/                           # 核心库目录 (Clean Architecture)
│   ├── store/                     # Zustand 状态管理
│   ├── features/                  # 功能模块
│   │   ├── game/                  # 游戏功能模块
│   │   │   ├── engine/            # 游戏引擎
│   │   │   ├── rules/             # 游戏规则
│   │   │   ├── ai/                # AI 系统
│   │   │   └── services/          # 游戏服务
│   │   └── auth/                  # 认证功能模块
│   ├── domain/                    # 领域层
│   │   ├── entities/              # 领域实体
│   │   ├── value-objects/         # 值对象
│   │   ├── events/                # 领域事件
│   │   ├── repositories/          # 仓储接口
│   │   └── services/              # 领域服务
│   ├── infrastructure/            # 基础设施层
│   │   ├── phaser/                # Phaser 游戏引擎
│   │   ├── supabase/              # Supabase 集成
│   │   └── repositories/          # 仓储实现
│   ├── utils/                     # 通用工具
│   └── types/                     # 全局类型定义
├── components/                    # React 组件
│   ├── ui/                        # UI 基础组件
│   │   ├── Card.tsx               # 卡牌组件
│   │   ├── Button.tsx             # 按钮组件
│   │   ├── Modal.tsx              # 模态框组件
│   │   ├── Loading.tsx            # 加载组件
│   │   └── Toast.tsx              # 消息提示组件
│   ├── game/                      # 游戏组件
│   │   ├── GameBoard.tsx          # 游戏棋盘
│   │   ├── PlayerArea.tsx         # 玩家区域
│   │   ├── HumanPlayer.tsx        # 人类玩家展示
│   │   ├── AIPlayer.tsx           # AI 玩家展示
│   │   ├── Hand.tsx               # 手牌展示
│   │   ├── PlayArea.tsx           # 出牌区域
│   │   ├── ActionButtons.tsx      # 动作按钮
│   │   └── TurnIndicator.tsx      # 回合指示器
│   └── ...                        # 其他组件
├── app/                           # Next.js App Router
│   ├── (auth)/                    # 认证路由组
│   ├── (game)/                    # 游戏路由组
│   ├── (rooms)/                   # 房间路由组
│   └── api/                       # API 路由
├── supabase/                      # Supabase 相关
│   ├── functions/                 # Edge Functions
│   ├── migrations/                # 数据库迁移
│   └── seed/                      # 种子数据
├── tests/                         # 测试目录
│   ├── unit/                      # 单元测试
│   ├── integration/               # 集成测试
│   └── e2e/                       # 端到端测试
├── docs/                          # 文档目录
│   ├── architecture/              # 架构文档
│   ├── game/                      # 游戏文档
│   └── development/               # 开发文档
├── PROJECT_PROGRESS.md            # 项目进度跟踪
└── .env.example                   # 环境变量示例
```

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写必要的配置：

```bash
cp .env.example .env.local
```

主要配置项：
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `NEXTAUTH_SECRET` - NextAuth 密钥

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`

### 运行测试

```bash
npm test
```

### 构建项目

```bash
npm run build
```

---

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                          │
│  Pages                    Components                    UI Widgets │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     State Management Layer                       │
│  Zustand Stores (纯状态管理)                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                        │
│  Features (game, auth)                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        Domain Layer                              │
│  Entities, Value Objects, Events                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                         │
│  Supabase Client, Phaser Engine                                    │
└─────────────────────────────────────────────────────────────────┘
```

详细架构文档请参考 [docs/architecture.md](docs/architecture.md)

---

## 核心模块

### 1. 游戏引擎
- `GameEngine.ts` - 主引擎
- `DeckManager.ts` - 牌堆管理器
- `TurnManager.ts` - 回合管理器

### 2. 规则系统
- `CardPattern.ts` - 牌型定义
- `CardRecognizer.ts` - 牌型识别器
- `RuleValidator.ts` - 规则验证器

### 3. AI 系统
- `AIPlayer.ts` - AI 玩家基类
- `strategies/` - AI 策略（Random、Greedy、Memory）
- `AIPlayerFactory.ts` - AI 工厂（支持自动补足）

### 4. 状态管理
- `authStore.ts` - 认证状态
- `lobbyStore.ts` - 大厅状态
- `gameStore.ts` - 游戏状态
- `uiStore.ts` - UI 状态

---

## 游戏规则

### 基本规则
- 4 人一桌，两人一对
- 使用 108 张牌（含大小王）
- 王炸 > 同花顺 > 同花 > 顺子 > 对子 > 单张

### AI 策略
- **Random**: 随机出牌策略
- **Greedy**: 贪婪出牌策略（优先出大牌）
- **Memory**: 记忆策略（记住已出的牌）

### AI 自动补足
- 当房间人数不足 4 人时，自动补足 AI 玩家
- 最多自动补足 3 个 AI 玩家
- AI 策略按房间顺序循环分配

---

## 数据库 Schema

### Users 表
```sql
- id: UUID (主键)
- email: TEXT (唯一)
- username: TEXT (唯一)
- avatar: TEXT
- role: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Rooms 表
```sql
- id: UUID (主键)
- name: TEXT
- max_players: INTEGER
- current_players: INTEGER
- password: TEXT
- status: TEXT
- host_id: UUID
- game_type: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

详细数据库文档请参考 [docs/database/schema.md](docs/database/schema.md)

---

## API 端点

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出

### 房间相关
- `GET /api/rooms` - 获取房间列表
- `POST /api/rooms` - 创建房间
- `GET /api/rooms/[id]` - 获取房间详情

### 游戏相关
- `POST /api/games/start` - 开始游戏
- `POST /api/games/pass` - 跳过回合
- `POST /api/games/play` - 出牌
- `POST /api/games/next-round` - 下一轮

---

## 开发指南

- **编码标准**: 请参考项目根目录的 CODE_STANDARDS.md
- **架构文档**: 详细架构设计请参考 [docs/architecture.md](docs/architecture.md)
- **开发指南**: 详细开发流程请参考 [docs/development/](docs/development)
- **进度跟踪**: 项目实施进度请参考 [PROJECT_PROGRESS.md](PROJECT_PROGRESS.md)

---

## 许可证

MIT License

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 更新日志

### v1.0.0 (2026-02-05)
- ✅ 完成项目框架搭建（9 个阶段）
- ✅ 实现完整的 Clean Architecture 分层
- ✅ 完成核心类型定义
- ✅ 完成基础目录结构
- ✅ 完成测试框架搭建
- ✅ 完成文档架构
