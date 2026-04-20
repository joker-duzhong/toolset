# Hope Toolset 开发指南 (v2.0)

> 本文档为项目开发的核心与唯一权威参考。旨在统一架构规范、开发流程与 UI 风格，确保新工具开发时的架构“零疑惑”，从设计到上线实现标准化闭环。

---

## 目录
0. [AI 辅助开发核心准则](#0-ai-辅助开发核心准则)
1. [统一架构与基础设施](#1-统一架构与基础设施)
2. [UI 设计与动效规范 (Bento UI)](#2-ui-设计与动效规范-bento-ui)
3. [快速开始：标准化开发流](#3-快速开始标准化开发流)
4. [核心文件与 API 服务速查](#4-核心文件与-api-服务速查)

---

## 0. AI 辅助开发核心准则

> **致 AI 助手（Developer/Copilot）：** 零缺陷架构是最高优先级的目标，请严格按照以下准则行动。

### 0.1 沟通与执行 (Protocol)
- **中文优先**：全程使用 **中文（简体）** 与我交流，包括回复、思路分析和代码注释。
- **三思后答，不盲猜**：遇到模糊需求、未明确的类型、未见过的组件，**必须先使用工具收集上下文或直接询问**。严禁在信息不全时主观臆断并盲目生成大段代码。
- **最小化全局污染**：新工具代码聚焦在其独立的 `src/pages/tools/[AppName]/` 目录下，严禁随意修改基础共用件（除非为提取真正意义上的通用组件）。

### 0.2 依赖与环境健壮性 (Safety & Regression)
- **白名单依赖**：在使用如 `framer-motion`, `date-fns`, `swr`，或者各类组件库前，**第一步必须阅读 `package.json`**。绝不要造成 `Failed to resolve import` 的低级错误。
- **构建防线**：每次功能迭代闭环后，必须**主动执行**静态检测确保无致命报错：
  * `npm run lint` 
  * `npx tsc --noEmit`
- **极端异常防阻断**：所有网络调用、状态渲染强制使用保守异常捕获（Catch/Fallbacks）。任何情况下不应因为单一接口报错（如 500、429 等）或某字段 `undefined` 造成页面白屏崩溃。

---

## 1. 统一架构与基础设施

项目采取 **“单一统一入口 + 路由分发 + 独立模块内聚”** 架构。

### 1.1 模块目录规划 (Modular Design)
所有业务组件、类型声明、请求隔离在本身目录下，高度内聚。标准复杂应用目录示例：
```text
src/pages/tools/[AppName]/
├── index.tsx           # 工具主入口组件 (由 Router 拦截指向)
├── types.ts            # 工具内聚的类型 (杜绝 Any，杜绝重复声明)
├── constants.ts        # 全局配置、Tab 映射等不变常量
├── todo.md             # (可选) 从零开荒的规划节点
├── services/           
│   └── api.ts          # 专属的 API 服务层，处理独立模块所有发向后端的请求
├── hooks/              # 将数据请求、副作用 (Effects) 与视图解耦的状态 Hook 集合
├── components/         # 拆分的细小业务积木 (UI Components)
└── views/              # (可选) 当应用有下级页面或多级 Tab 视图时用来存放大型视图组件
```

### 1.2 网络服务层规范 (Network & Security)
- **基座ApiClient**：全局使用 `src/utils/apiClient.ts` 发起请求（自动挂载 `Authorization: Bearer`，自动对 401 续签 Token）。
- **应用头隔离**：在子应用的 `services/api.ts` 中封装网络调用，**必须主动挂载** `app: app_key` 标识作为业务区分。
  ```typescript
  // 简陋示例：通过 withAppHeader 加入应用标识
  function withAppHeader(init?: RequestInit): RequestInit {
    const headers = new Headers(init?.headers); headers.set('app', 'my_app_key'); return { ...init, headers };
  }
  export const getAppList = () => apiClient<MyData[]>('/path/to/api', withAppHeader());
  ```
- **后端 API 文档在线参考**：[https://api.lxyy.fun/docs](https://api.lxyy.fun/docs)

---

## 2. UI 设计与动效规范 (Bento UI)

秉承 **极简美学、移动端优、沉浸无缝、即时情绪反馈** 。

### 2.1 框架与布局 (Bento Box & Glassmorphism)
- **技术栈定死**：**React + Tailwind CSS + framer-motion**。并使用 `@tanstack/react-query` 或 `SWR` 等控制状态轮询（如有需要），彻底消灭 `window.location.reload()` 阻断感。
- **Bento Box (便当盒)**：打破单调长列表，优先使用 CSS Grid (`grid-cols-2` 等) 生成不规则或规则的圆角包裹卡片式布局。
- **毛玻璃滤镜 (Glassmorphism)**：底部导航、悬浮弹窗、吸顶头部请大量使用 `backdrop-blur`，搭配浅色/白透背景 (如 `bg-white/80`) 与极微弱的描边 (`border-white/20`)。

### 2.2 动效与交互体感 (Optimistic UI & Micro-interactions)
- **触觉点击 (Active States)**：由于偏移动端体系，**所有可交互的按钮/卡片必须带缩放弹跳**。使用 `active:scale-[0.98] transition-transform` 作为基础肌肉体感。
- **无感刷新与乐观更新**：
  - 增删改查动作：不用等接口彻底 `200` 才回传 UI。对于点赞、标记完成等操作先变更视图反馈并发动效，后台再悄悄同步变更，极大缓解网络延时的空窗期焦虑。
  - 对于短时间需要刷新结果的心跳请求模式：避免全屏 `Skeleton` 闪烁，而是利用骨架线、轻微流光特效或是淡蓝/暖色小气泡呈现过渡。

---

## 3. 快速开始：标准化开发流

假设要开发名为 `my-tool` 的应用。

**Step 1: 注册进入工具大厅配置**
在 `src/config/tools.ts` 加入元数据，确保入口生成：
```typescript
{
  id: 'my-tool',                    // 强标识：必须 kebab-case
  name: '我的工具名称',
  description: '解决某某问题',
  category: 'dev',                  // 归属大类映射背景色 (image, text, convert, dev, finance, etc)
  icon: 'Zap',                      // Lucide React 中的图标名称
  path: '/tools/my-tool',           // 将挂载的 Route 路径
}
```

**Step 2: 构建路由拦截**
在 `src/router/index.tsx` 添加懒加载和占位符：
```typescript
const MyTool = lazy(() => import('@/pages/tools/MyTool').then((m) => ({ default: m.default || m.MyTool })));
// 在 routes 配置节点插入
<Route path="/tools/my-tool" element={<ToolWrapper><MyTool /></ToolWrapper>} />
// 若需要满屏沉浸无默认头，可传递 <ToolWrapper fullscreen>
```

**Step 3: 进行应用本身代码构建**
按照前面 [1.1 模块目录规划](#11-模块目录规划-modular-design) 拆分布局、抽取 API 和编写页面逻辑结构即可开始业务闭环开发。

---

## 4. 核心文件与 API 服务速查

> 架构或状态拿捏不准时，随时温习 `TradeCopilot` 或 `JustRight` 这种强工程性示例。

| 分类 | 核心文件路径 | 核心业务覆盖点 |
|---|---|---|
| **路由及配置** | `src/config/tools.ts` | 应用的门面注册地，控制列表分类、名称。 |
| | `src/router/index.tsx` | URL 的中心调度，提供懒加载防阻塞和 `ToolWrapper`。 |
| **API 与认证** | `src/utils/apiClient.ts` | 接管一切对内核心 Fetch 调用（超时重拉、Token携带）。 |
| | `src/contexts/AuthContext.tsx` | 鉴定用户登录状态，向子组件抛出全局 `useAuth()` Hook。 |
| **通用组件库** | `src/components/PageHeader.tsx` | 标准的内页抬头（集成返回、分享交互）。 |
| | `src/components/AuthModal.tsx` | 全局扫码登录与会话恢复接管弹窗。 |
| **样式覆盖** | `src/utils/cn.ts` | 经典防撞色和防优先级的 Tailwind Class 合并器 `cn()`。 |
