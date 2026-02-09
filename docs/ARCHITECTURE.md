# 架构文档

## 项目概述

GuanDan2 是一个基于 TypeScript + Next.js + React + Tailwind CSS 构建的 AI 应用项目，包含 RAG（检索增强生成）功能。

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript 5
- **UI 库**: React 18 + Tailwind CSS
- **AI**: OpenAI SDK + LangChain
- **测试**: Jest + Testing Library

## 目录结构

```
src/
├── agents/          # Agent 模块
│   └── index.ts     # Agent 基类和实现
├── rag/             # RAG 核心功能
│   └── index.ts     # RAG 管理器
├── embeddings/      # 向量嵌入
│   └── index.ts     # 嵌入服务
├── ui/              # 前端界面
│   ├── Pages/       # 页面组件
│   └── Components/  # 通用组件
├── types/           # TypeScript 类型
│   └── index.ts
├── utils/           # 工具函数
│   └── index.ts
└── app/             # Next.js App Router
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

## 模块设计

### Agent 模块

提供智能 Agent 功能，包括：
- `BaseAgent`: Agent 基类
- `ChatAgent`: 聊天 Agent
- `RagAgent`: RAG Agent
- `AgentExecutor`: Agent 执行器

### RAG 模块

实现检索增强生成功能：
- `RagManager`: RAG 管理器
- 文档检索
- 向量检索
- 相似度计算

### Embeddings 模块

提供向量嵌入功能：
- `EmbeddingService`: 嵌入服务
- 文本向量化
- 批量嵌入
- 相似度计算

### 类型系统

定义核心数据类型：
- `UserMessage`: 用户消息
- `KnowledgeSource`: 知识来源
- `RagQueryRequest`: RAG 查询请求
- `RagQueryResponse`: RAG 查询响应

### 工具函数

提供通用工具方法：
- ID 生成
- 延迟执行
- 防抖/节流
- 深度克隆
- 本地存储

## RAG 工作流程

1. 用户提交查询请求
2. 系统将查询转换为向量
3. 在向量数据库中搜索相似文档
4. 过滤相似度结果
5. 结合检索结果生成回答

## 命名规范

- **函数**: 使用动词开头（如 `generateId`, `embedText`）
- **类**: 使用名词或名词短语（如 `RagManager`, `EmbeddingService`）
- **常量**: 使用大写下划线分隔（如 `DEFAULT_BATCH_SIZE`）
- **类型**: 使用 PascalCase（如 `RagQueryRequest`）
