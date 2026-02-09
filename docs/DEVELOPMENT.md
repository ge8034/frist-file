# 开发指南

## 环境要求

- Node.js >= 18.17.0
- npm >= 9.6.7 或 pnpm >= 8.11.0

## 安装依赖

```bash
npm install
```

## 开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 构建项目

```bash
npm run build
```

## 运行测试

```bash
npm test
```

## 代码规范

### 函数长度

每个函数不超过 50 行代码。

### 函数命名

- 使用动词开头
- 清晰描述函数功能
- 避免使用缩写

### 注释

- 所有公共函数添加 JSDoc 注释
- 复杂逻辑添加行内注释
- 注释使用中文

### TypeScript 类型

- 优先使用具体类型而非 `any`
- 导出重要类型
- 使用接口和类型别名

### 单一职责

- 每个函数只做一件事
- 保持函数短小精悍

## 项目配置

- `tsconfig.json`: TypeScript 配置
- `tailwind.config.ts`: Tailwind CSS 配置
- `.eslintrc.json`: ESLint 配置
- `jest.config.js`: Jest 配置

## 环境变量

创建 `.env.local` 文件：

```env
OPENAI_API_KEY=your_api_key
DATABASE_URL=postgresql://localhost:5432/guandan2
VECTOR_DB_TYPE=chroma
```

## 添加新功能

1. 在相应目录创建文件
2. 定义必要的类型
3. 实现功能逻辑
4. 添加单元测试
5. 更新文档
