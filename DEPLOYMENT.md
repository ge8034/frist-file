# GuanDan2 游戏部署指南

本文档提供 GuanDan2 掼蛋游戏的完整部署指南，包括环境变量配置、部署平台选择和具体部署步骤。

## 📋 部署前准备

### 1. 代码仓库准备
确保代码已提交到 Git 仓库（GitHub、GitLab 等）：
```bash
git init
git add .
git commit -m "准备部署 GuanDan2 游戏"
git remote add origin [你的仓库地址]
git push -u origin main
```

### 2. 项目健康检查
✅ 已完成的检查：
- 262 个测试全部通过
- Next.js 构建成功
- 设计系统一致性修复完成
- 响应式设计优化完成

## 🔧 环境变量配置

### 必需的环境变量
根据 `.env.example` 文件，以下是生产环境需要配置的变量：

#### Supabase 配置（必需）
```bash
# Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase 匿名密钥（客户端安全使用）
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase 服务角色密钥（服务器端使用）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 应用配置（必需）
```bash
# 生产环境应用 URL
NEXT_PUBLIC_APP_URL=https://你的域名.com
NEXTAUTH_URL=https://你的域名.com

# NextAuth 安全密钥（生成随机字符串）
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long
```

#### 可选配置（根据需求启用）
```bash
# OpenAI API（如需 AI 功能）
OPENAI_API_KEY=your_openai_api_key_here

# 向量数据库（如需高级 AI 功能）
VECTOR_DB_TYPE=chroma
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_API_KEY=

# 语音服务
NEXT_PUBLIC_VOICE_ENABLED=false
VOICE_API_KEY=your-voice-api-key

# GitHub OAuth（如需第三方登录）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# 游戏配置
GAME_PORT=4000
GAME_WS_PORT=4001

# 应用配置
NEXT_PUBLIC_GAME_NAME=掼蛋游戏
NEXT_PUBLIC_MAX_PLAYERS=4
NEXT_PUBLIC_DEBUG=false
```

### 如何获取 Supabase 配置
1. 访问 [Supabase 官网](https://supabase.com) 创建项目
2. 在项目设置中找到：
   - **Project URL**: `https://[project-ref].supabase.co`
   - **API Keys**: 获取 `anon public` 和 `service_role` 密钥
3. 确保启用以下 Supabase 功能：
   - PostgreSQL 数据库
   - Realtime 订阅
   - Row Level Security (RLS)

## 🚀 部署平台选择

### 选项一：Vercel（推荐）
**最适合 Next.js 项目的平台**
- 自动优化 Next.js 应用
- 全球 CDN 网络
- 自动 SSL 证书
- 免费套餐足够使用

**部署步骤：**
1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New..." → "Project"
3. 导入你的 Git 仓库
4. 配置环境变量（在项目设置中）
5. 点击 "Deploy"

### 选项二：Netlify
**替代选择，功能类似**
- 同样支持 Next.js
- 免费 SSL 和 CDN
- 简单的部署流程

**部署步骤：**
1. 访问 [netlify.com](https://netlify.com) 并登录
2. 拖拽 `out` 文件夹或连接 Git 仓库
3. 配置环境变量
4. 部署

### 选项三：自有服务器
**传统服务器部署**
```bash
# 1. 构建项目
npm run build

# 2. 安装生产依赖
npm ci --only=production

# 3. 启动生产服务器
npm run start
# 默认端口 3000，可通过环境变量 PORT 修改
```

## 📁 部署配置文件

### 1. `.gitignore`（已创建）
确保不提交敏感信息和缓存文件。

### 2. `vercel.json`（Vercel 专用）
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
      "NEXT_PUBLIC_APP_URL": "@next_public_app_url",
      "NEXTAUTH_URL": "@nextauth_url",
      "NEXTAUTH_SECRET": "@nextauth_secret",
      "NEXT_PUBLIC_DEBUG": "false"
    }
  }
}
```

### 3. `next.config.js` 优化建议
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 生产环境优化
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['your-supabase-domain.supabase.co'],
  },
  // 安全头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

## 🛠️ 详细部署步骤（以 Vercel 为例）

### 步骤 1：准备代码
```bash
# 确保所有更改已提交
git status
git add .
git commit -m "准备部署"
git push
```

### 步骤 2：Vercel 部署
1. **访问 Vercel 控制台**：https://vercel.com/dashboard
2. **导入项目**：
   - 点击 "Add New..." → "Project"
   - 选择你的 Git 仓库（GitHub/GitLab）
   - 授权 Vercel 访问仓库

3. **配置项目**：
   - **Framework Preset**: Next.js
   - **Root Directory**: . (项目根目录)
   - **Build Command**: `npm run build` (默认)
   - **Output Directory**: .next (默认)
   - **Install Command**: `npm install` (默认)

4. **环境变量配置**：
   - 在 "Environment Variables" 部分
   - 添加所有必需的环境变量（见上文）
   - **重要**：确保 `NODE_ENV` 设置为 `production`

5. **部署**：
   - 点击 "Deploy"
   - 等待构建完成（约 1-3 分钟）
   - 获得生产 URL：`https://guandan2.vercel.app`

### 步骤 3：域名配置（可选）
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录
4. Vercel 会自动配置 SSL 证书

### 步骤 4：验证部署
访问你的生产环境 URL，检查：
1. ✅ 首页加载正常
2. ✅ 游戏页面可访问 (`/game`)
3. ✅ 响应式设计正常
4. ✅ Phaser 游戏加载
5. ✅ Supabase 连接正常

## 🐛 常见问题解决

### 问题 1：Supabase 连接失败
**症状**：游戏无法加载，控制台显示 Supabase 错误
**解决**：
1. 检查环境变量是否正确
2. 验证 Supabase 项目是否运行
3. 检查网络策略是否允许连接

### 问题 2：Phaser 加载失败
**症状**：游戏画布空白，控制台显示 Phaser 错误
**解决**：
1. 检查 Phaser 版本兼容性
2. 确保动态导入正常工作
3. 检查浏览器控制台错误

### 问题 3：环境变量未生效
**症状**：应用使用默认值而非环境变量
**解决**：
1. Vercel 中：重新部署使环境变量生效
2. 自有服务器：重启应用进程
3. 检查变量命名是否正确（大小写敏感）

### 问题 4：构建失败
**症状**：Vercel/Netlify 构建失败
**解决**：
1. 检查 `npm run build` 本地是否成功
2. 查看构建日志中的具体错误
3. 确保所有依赖正确安装

## 📊 生产环境监控建议

### 性能监控
- **Google Analytics**：用户行为分析
- **Vercel Analytics**：性能指标（如果使用 Vercel）
- **Sentry**：错误监控

### 安全建议
1. **定期更新依赖**：`npm audit` 检查安全漏洞
2. **环境变量保护**：不在代码中硬编码敏感信息
3. **Supabase RLS**：确保数据库行级安全启用
4. **CSP 头**：添加内容安全策略

### 备份策略
1. **Supabase 数据库备份**：定期导出数据
2. **代码备份**：Git 仓库多副本
3. **环境变量备份**：安全存储加密副本

## 🔄 更新部署

当有代码更新时：
```bash
# 1. 本地开发和测试
git add .
git commit -m "更新描述"
git push

# 2. Vercel 会自动重新部署
# 或手动触发重新部署
```

## 📞 支持与帮助

如果遇到部署问题：
1. 查看控制台错误信息
2. 检查部署平台日志
3. 参考 Next.js 官方文档
4. 查看 Supabase 文档

**部署成功标志**：访问生产环境 URL，游戏功能完整，无错误信息。

---
*最后更新：2026-02-09*
*GuanDan2 开发团队*