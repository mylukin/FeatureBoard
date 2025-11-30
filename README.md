# FeatureBoard

一个功能驱动的迷你任务看板系统，用于管理开发功能。本项目作为示例，展示了如何使用 agent-foreman 工具进行 AI 辅助的功能驱动开发。

## 概述

FeatureBoard 是一个轻量级任务管理工具，专为个人开发者或小型团队设计，用于：

- 跨不同状态跟踪功能（待办、进行中、已完成）
- 按模块组织功能（前端、后端、测试等）
- 快速过滤和搜索功能
- 一目了然地查看统计数据

## 技术栈

### 前端

- **Vue 3**（Composition API）
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Vue Router** - 客户端路由
- **Lucide Vue** - 图标库

### 后端

- **Node.js** 配合 **Hono** - Web 框架
- **SQLite** 配合 **better-sqlite3** - 本地数据库
- **TypeScript** - 类型安全

### 测试

- **Playwright** - 端到端测试

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd FeatureBoard

# 安装所有依赖（根目录、后端、前端、e2e）
npm run install:all
```

### 开发

```bash
# 同时运行前端和后端
npm run dev

# 或者分别运行：
npm run dev:backend   # 后端运行在 http://localhost:3001
npm run dev:frontend  # 前端运行在 http://localhost:3000
```

在浏览器中打开 http://localhost:3000。

### 生产构建

```bash
npm run build
```

### 运行测试

```bash
# 运行 E2E 测试
npm run test:e2e

# 以有头模式运行 E2E 测试（可见浏览器）
npm run test:e2e -- --headed
```

## 项目结构

```text
FeatureBoard/
├── backend/              # Hono API 服务器
│   ├── src/
│   │   ├── db/          # 数据库模式和初始化
│   │   ├── routes/      # API 路由处理器
│   │   └── index.ts     # 服务器入口
│   └── data/            # SQLite 数据库文件
├── frontend/            # Vue 3 单页应用
│   ├── src/
│   │   ├── views/       # 页面组件
│   │   ├── api.ts       # API 客户端
│   │   ├── types.ts     # TypeScript 类型定义
│   │   └── App.vue      # 根组件
│   └── dist/            # 生产构建输出
├── tests/
│   └── e2e/             # Playwright E2E 测试
├── docs/                # 文档
│   └── PRD.md           # 产品需求文档
└── ai/                  # Agent-foreman 工具文件
    ├── feature_list.json
    └── progress.log
```

## API 接口

### 功能接口

| 方法 | 接口 | 描述 |
|--------|----------|-------------|
| GET | `/api/features` | 获取所有功能（支持 `?status=` 和 `?module=` 过滤） |
| GET | `/api/features/:id` | 获取单个功能 |
| POST | `/api/features` | 创建新功能 |
| PUT | `/api/features/:id` | 更新功能 |
| DELETE | `/api/features/:id` | 删除功能 |
| GET | `/api/features/stats` | 获取功能统计 |

### 请求/响应示例

**创建功能：**

```json
POST /api/features
{
  "title": "实现登录",
  "description": "添加用户认证",
  "module": "backend",
  "status": "todo",
  "priority": 4
}
```

**统计响应：**

```json
GET /api/features/stats
{
  "byStatus": {
    "todo": 5,
    "doing": 2,
    "done": 10
  },
  "byModule": {
    "frontend": 8,
    "backend": 5,
    "test": 4
  }
}
```

## 功能特性

- **功能列表** - 查看所有功能的标题、模块、状态和优先级
- **过滤功能** - 按状态（待办/进行中/已完成）和模块过滤
- **URL 同步** - 过滤状态保存在 URL 中便于分享
- **本地存储** - 记住上次使用的过滤条件
- **创建/编辑表单** - 完整的 CRUD 操作，带表单验证
- **快速状态切换** - 内联状态下拉框，支持乐观更新
- **统计仪表板** - 功能分布的可视化概览

## 数据模型

### 功能（Feature）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| id | integer | 自增主键 |
| title | string | 功能标题（必填） |
| description | string | 详细描述（可选） |
| module | string | 分类/模块名称 |
| status | enum | `todo` \| `doing` \| `done` |
| priority | integer | 1-5，数值越大优先级越高 |
| createdAt | datetime | 创建时间戳 |
| updatedAt | datetime | 最后更新时间戳 |

## 开发说明

本项目使用 **功能驱动开发** 方式，配合 [agent-foreman](https://github.com/mylukin/agent-foreman) 工具构建，展示了 AI 如何协助从 PRD 构建完整的全栈应用。

### 可用的 NPM 脚本

| 脚本 | 描述 |
|--------|-------------|
| `npm run dev` | 同时启动前端和后端 |
| `npm run dev:backend` | 仅启动后端 |
| `npm run dev:frontend` | 仅启动前端 |
| `npm run build` | 构建前端生产版本 |
| `npm run test:e2e` | 运行 Playwright E2E 测试 |
| `npm run install:all` | 安装所有依赖 |

## 许可证

MIT
