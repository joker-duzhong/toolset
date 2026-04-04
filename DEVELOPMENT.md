# Hope Toolset 开发指南

> 本文档总结了项目的开发规则和最佳实践，帮助快速开发符合项目规范的新工具。

---

## 目录

1. [快速开始：添加新工具](#1-快速开始添加新工具)
2. [项目结构](#2-项目结构)
3. [工具配置规范](#3-工具配置规范)
4. [路由配置规范](#4-路由配置规范)
5. [API 服务层规范](#5-api-服务层规范)
6. [类型定义规范](#6-类型定义规范)
7. [组件开发规范](#7-组件开发规范)
8. [样式规范](#8-样式规范)
9. [认证与权限](#9-认证与权限)
10. [关键文件速查](#10-关键文件速查)

---

## 1. 快速开始：添加新工具

### 简单工具（无后端 API）

**步骤 1：添加工具配置**

```typescript
// src/config/tools.ts
{
  id: 'my-tool',                    // 唯一标识（kebab-case）
  name: '我的工具',                  // 显示名称
  description: '一句话描述功能',     // 描述
  category: 'dev',                  // 所属分类
  icon: 'Wrench',                   // lucide-react 图标名
  path: '/tools/my-tool',           // 路由路径
  tags: ['标签1', '标签2'],         // 搜索关键词
  isNew: true,                      // 可选：新上线标记
  isHot: false,                     // 可选：热门标记
  hidden: false,                    // 可选：隐藏工具
}
```

**步骤 2：创建页面组件**

```typescript
// src/pages/tools/MyToolPage.tsx
import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'

export function MyToolPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="我的工具" />
      <main className="flex-1 px-4 py-5">
        {/* 工具内容 */}
      </main>
    </div>
  )
}
```

**步骤 3：添加路由**

```typescript
// src/router/index.tsx

// 1. 添加懒加载
const MyToolPage = lazy(() =>
  import('@/pages/tools/MyToolPage').then((m) => ({ default: m.MyToolPage }))
)

// 2. 在 Routes 中添加路由
<Route path="/tools/my-tool" element={<ToolWrapper><MyToolPage /></ToolWrapper>} />
```

### 复杂工具（有后端 API + 多视图）

推荐目录结构：

```
src/pages/tools/MyComplexTool/
├── index.tsx           # 主入口（Tab 切换逻辑）
├── types.ts            # 类型定义
├── constants.ts        # 常量配置（Tab 定义等）
├── services/
│   └── api.ts          # API 服务（使用 apiClient + X-App header）
├── hooks/
│   ├── useData.ts      # 数据获取 hook
│   └── ...
├── components/
│   ├── BottomNav.tsx   # 底部导航
│   └── ...
└── views/
    ├── HomeView.tsx    # 首页视图
    ├── ListView.tsx    # 列表视图
    └── ...
```

---

## 2. 项目结构

```
src/
├── components/          # 通用组件
│   ├── PageHeader.tsx   # 页面头部（返回按钮 + 标题）
│   ├── ToolPage.tsx     # 工具页面包装器
│   ├── ToolCard.tsx     # 工具卡片
│   └── ...
├── config/
│   └── tools.ts         # 🔧 工具配置中心
├── contexts/
│   └── AuthContext.tsx  # 认证上下文
├── hooks/               # 通用 hooks
├── pages/
│   ├── HomePage.tsx     # 首页
│   └── tools/           # 工具页面目录
│       ├── BmiPage.tsx           # 简单工具示例
│       ├── TradeCopilot/         # 复杂工具示例
│       └── JustRight/            # 复杂工具示例
├── router/
│   └── index.tsx        # 🔧 路由配置
├── types/
│   ├── tool.ts          # 工具类型定义
│   └── auth.ts          # 认证类型定义
├── utils/
│   ├── apiClient.ts     # 🔧 API 客户端（自动携带 Token）
│   ├── storage.ts       # Token 存储工具
│   ├── cn.ts            # Tailwind 类名合并
│   └── ...
└── index.css            # 全局样式
```

---

## 3. 工具配置规范

### 分类配置

```typescript
// src/config/tools.ts
export const CATEGORIES: ToolCategoryInfo[] = [
  {
    key: 'image',           // 分类标识
    label: '图片处理',       // 显示名称
    color: 'bg-violet-100',      // Tailwind 背景色
    textColor: 'text-violet-600', // Tailwind 文字色
  },
  // 可用分类：image, text, convert, encode, life, dev, entertainment, finance, other
]
```

### 工具项配置

```typescript
export const TOOLS: ToolItem[] = [
  {
    id: 'trade-copilot',            // 必填：唯一标识
    name: 'Trade Copilot',          // 必填：显示名称
    description: 'A股实盘交易辅助', // 必填：描述
    category: 'finance',            // 必填：所属分类
    icon: 'TrendingUp',             // 必填：lucide-react 图标名
    path: '/tools/trade-copilot',   // 必填：路由路径
    tags: ['A股', '交易'],          // 可选：搜索标签
    isNew: true,                    // 可选：新上线标记
    isHot: false,                   // 可选：热门标记
    hidden: false,                  // 可选：隐藏（不在首页显示但可直接访问）
    disabled: false,                // 可选：禁用（即将上线）
  },
]
```

---

## 4. 路由配置规范

### 基本模式

```typescript
// src/router/index.tsx
import { lazy, Suspense } from 'react'
import { ToolPage } from '@/components/ToolPage'

// 懒加载（处理 named exports）
const MyToolPage = lazy(() =>
  import('@/pages/tools/MyToolPage').then((m) => ({ default: m.MyToolPage }))
)

// 页面加载占位
function PageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// 工具页面包装器
function ToolWrapper({ children, fullscreen = false }) {
  return (
    <ToolPage fullscreen={fullscreen}>
      <Suspense fallback={<PageLoading />}>{children}</Suspense>
    </ToolPage>
  )
}
```

### 路由定义

```typescript
// 普通工具路由
<Route path="/tools/my-tool" element={<ToolWrapper><MyToolPage /></ToolWrapper>} />

// 全屏模式工具（无导航栏，如 JustRight）
<Route path="/tools/justright" element={<ToolWrapper fullscreen><JustRightPage /></ToolWrapper>} />
```

---

## 5. API 服务层规范

### 5.1 使用通用 apiClient

```typescript
// src/utils/apiClient.ts 已封装好，直接导入使用
import { apiClient } from '@/utils/apiClient'

// API 基础地址：https://api.lxyy.fun/api/v1
// 自动携带 Authorization: Bearer {token}
// 自动处理 401 刷新 token
```

### 5.2 工具 API 服务层模板

**每个需要后端 API 的工具都必须有自己的服务层**，统一注入 `X-App` header：

```typescript
// src/pages/tools/MyTool/services/api.ts
import { apiClient } from '@/utils/apiClient'
import type { MyData, CreateMyDataRequest } from '../types'

const BASE = '/my-tool'              // API 路径前缀
const APP_KEY = 'hope_my_tool'       // 应用标识（后端用于区分不同工具）

/** 统一注入 X-App header */
function withAppHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers)
  headers.set('X-App', APP_KEY)
  return { ...init, headers }
}

// ============ API 方法 ============

/** 获取列表 */
export async function getList() {
  return apiClient<MyData[]>(`${BASE}/list`, withAppHeader())
}

/** 获取详情 */
export async function getById(id: number) {
  return apiClient<MyData>(`${BASE}/${id}`, withAppHeader())
}

/** 创建 */
export async function create(data: CreateMyDataRequest) {
  return apiClient<MyData>(`${BASE}`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  }))
}

/** 更新 */
export async function update(id: number, data: Partial<CreateMyDataRequest>) {
  return apiClient<MyData>(`${BASE}/${id}`, withAppHeader({
    method: 'PUT',
    body: JSON.stringify(data),
  }))
}

/** 删除 */
export async function remove(id: number) {
  return apiClient<void>(`${BASE}/${id}`, withAppHeader({
    method: 'DELETE',
  }))
}
```

### 5.3 文件上传（预留接口）

> **注意**：暂不实现服务器上传，后期接入 OSS 后再完善。目前使用本地预览。

```typescript
// 预留接口，暂不实现
export const uploadApi = {
  /** 暂未实现，后期接入 OSS */
  image: async (_file: File): Promise<string> => {
    throw new Error('图片上传功能暂未开放')
  },
}

// 当前使用本地预览替代
const handleImageSelect = (file: File) => {
  // 使用本地 blob URL 预览，不会实际上传
  const localUrl = URL.createObjectURL(file)
  setImageUrl(localUrl)
}
```

---

## 6. 类型定义规范

### 6.1 工具类型 (`src/types/tool.ts`)

```typescript
export type ToolCategory =
  | 'image'         // 图片处理
  | 'text'          // 文本处理
  | 'convert'       // 格式转换
  | 'encode'        // 编解码
  | 'life'          // 生活实用
  | 'dev'           // 开发工具
  | 'entertainment' // 影音娱乐
  | 'finance'       // 金融理财
  | 'other'         // 其他

export interface ToolItem {
  id: string
  name: string
  description: string
  category: ToolCategory
  icon: string         // lucide-react 图标名
  path: string
  tags?: string[]
  isNew?: boolean
  isHot?: boolean
  disabled?: boolean
  hidden?: boolean
}
```

### 6.2 工具内部类型

```typescript
// src/pages/tools/MyTool/types.ts

// 数据实体
export interface MyData {
  id: number
  field1: string
  field2: number
  created_at: string
  updated_at: string
}

// 创建请求
export interface CreateMyDataRequest {
  field1: string
  field2: number
}

// API 响应
export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}
```

---

## 7. 组件开发规范

### 7.1 页面头部

```typescript
import { PageHeader } from '@/components/PageHeader'

// 基本用法
<PageHeader title="我的工具" />

// 带副标题
<PageHeader title="我的工具" subtitle="功能描述" />

// 不显示返回按钮
<PageHeader title="我的工具" showBack={false} />
```

### 7.2 底部导航（多视图工具）

```typescript
// src/pages/tools/MyTool/components/BottomNav.tsx
import { Home, List, Settings, type LucideIcon } from 'lucide-react'

interface Tab {
  key: string
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'list', label: '列表', icon: List },
  { key: 'settings', label: '设置', icon: Settings },
]

interface BottomNavProps {
  active: string
  onChange: (key: string) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-gray-100 flex items-center justify-around px-1 py-1.5"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition ${
            active === key ? 'text-indigo-600' : 'text-gray-400'
          }`}
        >
          <Icon className="size-5" />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}
```

### 7.3 自定义 Hook（数据获取）

```typescript
// src/pages/tools/MyTool/hooks/useMyData.ts
import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { MyData } from '../types'

export function useMyData() {
  const [data, setData] = useState<MyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getList()
      if (res.code === 200 && res.data) {
        setData(res.data)
      } else {
        setError(res.message || '获取数据失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const create = useCallback(async (item: CreateMyDataRequest) => {
    const res = await api.create(item)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '创建失败' }
  }, [refresh])

  return { data, loading, error, refresh, create }
}
```

---

## 8. 样式规范

### 8.1 类名合并工具

```typescript
import { cn } from '@/utils/cn'

// 自动处理 Tailwind 类名冲突
<div className={cn(
  'px-4 py-2 rounded-xl',
  isActive && 'bg-indigo-600 text-white',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
```

### 8.2 常用样式模式

```typescript
// 页面容器
<div className="min-h-screen bg-gray-50 flex flex-col">

// 卡片
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">

// 输入框
<input className="h-11 px-3 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />

// 主按钮
<button className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition disabled:bg-gray-200 disabled:text-gray-400">

// 次要按钮
<button className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium">

// 标签
<span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">

// 列表项
<button className="w-full text-left bg-white rounded-xl shadow-sm p-4 transition active:scale-[0.98]">

// 加载动画
<div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
```

### 8.3 分类配色

| 分类 | 背景 | 文字 |
|------|------|------|
| image | bg-violet-100 | text-violet-600 |
| text | bg-blue-100 | text-blue-600 |
| convert | bg-emerald-100 | text-emerald-600 |
| encode | bg-amber-100 | text-amber-600 |
| life | bg-pink-100 | text-pink-600 |
| dev | bg-slate-100 | text-slate-600 |
| entertainment | bg-rose-100 | text-rose-600 |
| finance | bg-cyan-100 | text-cyan-600 |
| other | bg-gray-100 | text-gray-600 |

### 8.4 安全区域适配

```typescript
// 底部导航需要适配 iOS safe-area
<nav style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}>
```

---

## 9. 认证与权限

### 9.1 Token 存储

```typescript
// src/utils/storage.ts
import { getStoredTokens, setStoredTokens, clearStoredTokens } from '@/utils/storage'

// 获取 token
const tokens = getStoredTokens()
// tokens: { accessToken, refreshToken, tokenType } | null

// 存储 token
setStoredTokens({ access_token, refresh_token, token_type })

// 清除 token
clearStoredTokens()
```

### 9.2 认证上下文

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, status, logout } = useAuth()
  
  // status: 'checking' | 'authenticated' | 'unauthenticated'
  
  if (status === 'checking') return <div>加载中...</div>
  if (status === 'unauthenticated') return <div>请先登录</div>
  
  return <div>欢迎, {user?.nickname}</div>
}
```

### 9.3 API 自动认证

```typescript
// apiClient 自动处理 token 携带和刷新
const res = await apiClient<User>('/auth/me')
// 自动携带 Authorization: Bearer {accessToken}
// 401 时自动刷新 token 并重试
```

---

## 10. 关键文件速查

| 功能 | 文件路径 |
|------|----------|
| 工具配置 | `src/config/tools.ts` |
| 路由配置 | `src/router/index.tsx` |
| API 客户端 | `src/utils/apiClient.ts` |
| Token 存储 | `src/utils/storage.ts` |
| 类名合并 | `src/utils/cn.ts` |
| 工具类型 | `src/types/tool.ts` |
| 认证类型 | `src/types/auth.ts` |
| 认证上下文 | `src/contexts/AuthContext.tsx` |
| 页面头部 | `src/components/PageHeader.tsx` |
| 工具包装器 | `src/components/ToolPage.tsx` |
| 全局样式 | `src/index.css` |

---

## 参考示例

- **简单工具**：`src/pages/tools/BmiPage.tsx`
- **复杂工具（API + 多视图）**：
  - `src/pages/tools/TradeCopilot/` - 交易工具
  - `src/pages/tools/JustRight/` - 情侣工具
