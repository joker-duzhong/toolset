这份前端的开发指南同样极具实战价值！基于你的《Hope Toolset 开发指南 (v2.0)》以及我们刚刚敲定的言图 (TypoCraft) 后端接口，我为你整理了**前端模块化开发 Todo List**，并附带了一段**“喂给 AI 的顶级 UI 设计语言 Prompt”**，确保生成的代码极具现代感和苹果级的高级质感。

---

### 🎨 附录前置：给 AI 助手的 UI 设计语言 (System Prompt)

在让 AI 助手写具体的组件代码之前，**必须先发送以下这段 Prompt 作为全局 UI 设定**，它将彻底唤醒 AI 的“高级设计师”人格：

```markdown
# 🌟 全局 UI 设计与美学规范 (Bento UI & Modern Apple-like)

在接下来的组件开发中，你必须严格遵循以下 UI 视觉语言。我们的目标是构建一个媲美 Apple、Linear 或 Vercel 的顶级移动优先 Web 应用：

1. **便当盒美学 (Bento Box)**：
   - 彻底摒弃传统的生硬长列表。所有内容区块使用 CSS Grid 构建，使用不同尺寸的卡片（如 `col-span-1`, `col-span-2`, `row-span-2`）拼接成呼吸感极强的错落布局。
   - 卡片基础样式：`bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-zinc-800/50 rounded-2xl`，辅以极轻微的阴影 `shadow-sm`。

2. **毛玻璃与全景沉浸 (Glassmorphism & Spatial)**：
   - 悬浮元素（如吸顶 Header、底部导航、弹窗、下拉菜单）强制使用强效毛玻璃（`backdrop-blur-2xl` 或 `backdrop-blur-3xl`）。
   - 背景禁止使用死板的纯白或纯黑，应使用带极其微弱环境色渐变的底色（如 `bg-gradient-to-br from-zinc-50 to-slate-100` 或利用固定定位的模糊彩色光球作为背景点缀）。

3. **微交互与肌肉记忆 (Tactile Micro-interactions)**：
   - **绝对禁止死板的点击**。所有可交互元素（Button, Card）必须带有 `framer-motion` 的 `whileTap={{ scale: 0.96 }}` 或 Tailwind 的 `active:scale-[0.98] transition-transform duration-200 ease-out`。
   - Hover 态不要突兀改变背景色，而是使用透明度变化或微弱的浮动（`hover:-translate-y-1 hover:shadow-md`）。

4. **灵动状态与乐观渲染 (Fluid States & Optimistic UI)**：
   - **消灭生硬的 Loading 菊花图 (Spinner)**。在等待 AI 生成图片时，使用骨架屏上的流光溢彩（Shimmer 动画：`animate-pulse bg-gradient-to-r`）或者呼吸感的彩色光晕代表“AI 正在思考”。
   - 图片加载必须有平滑淡入（`opacity-0` 到 `opacity-100`，搭配 `transition-opacity duration-500`）。

5. **排版质感 (Typography)**：
   - 标题使用 `tracking-tight` (微缩字间距)，字重使用 `font-semibold` 或 `font-medium`，正文使用 `text-zinc-500 dark:text-zinc-400`，建立极强的文字层级对比。
```

---

### 🚀 言图 (TypoCraft) 前端开发 Todo List

假设模块建立在 `src/pages/tools/typo-craft/` 目录下。

#### 📦 阶段 1：入口配置与架构搭建
*   [ ] **1.1 注册大厅与路由配置**
    *   **任务**: 在全局文件中注册 `typo-craft` 工具。
    *   **AC (验收标准)**:
        1. 在 `src/config/tools.ts` 中添加条目：`id: 'typo-craft', name: '言图', description: '一语成图，字见其境', category: 'image', icon: 'Sparkles', path: '/tools/typo-craft'`。
        2. 在 `src/router/index.tsx` 中配置懒加载 `<Route path="/tools/typo-craft" element={<ToolWrapper fullscreen><TypoCraft /></ToolWrapper>} />`（由于是画廊应用，建议开启 `fullscreen` 沉浸模式）。
*   [ ] **1.2 初始化模块骨架**
    *   **任务**: 在 `src/pages/tools/typo-craft/` 建立标准目录。
    *   **AC**: 创建 `index.tsx`, `types.ts`, `services/api.ts`, `constants.ts`, 以及 `components/`, `hooks/` 文件夹。

#### 💾 阶段 2：类型定义与网络层封装 (`types.ts` & `services/api.ts`)
*   [ ] **2.1 同步后端 TS 类型 (`types.ts`)**
    *   **任务**: 定义出入参的 TS Interface，杜绝 `any`。
    *   **AC**:
        1. 定义 `TypoProject` (项目) 和 `TypoAsset` (资产) 类型。状态枚举 `AssetStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REJECTED'`。
        2. 定义 `GeneratePosterPayload` 和 `GenerateUIPayload`。
*   [ ] **2.2 封装专属 Api 层 (`services/api.ts`)**
    *   **任务**: 基于全局 `apiClient` 构建针对言图的请求函数，必须带有应用隔离 Header。
    *   **AC**:
        1. 注入 Header: `headers: { app: 'typo_craft' }`。
        2. 导出 `fetchFeed`, `createProject`, `getProjects`, `submitGenerate`, `pollAssetStatus` 函数。所有请求强制使用 `try...catch` 兜底，或依赖 `SWR/React-Query` 的错误边界。

#### ⚙️ 阶段 3：状态管理与轮询逻辑 (`hooks/`)
*   [ ] **3.1 编写画廊数据流 (`useFeed.ts`)**
    *   **任务**: 使用 SWR / React-Query 管理广场瀑布流数据。
    *   **AC**: 实现无限滚动 (Infinite Scroll) 或标准分页缓存，提供 `isLoading`, `isError`, `data` 等状态。
*   [ ] **3.2 编写任务生成与状态机轮询 Hook (`useGenerateEngine.ts`)**
    *   **任务**: 核心重难点，接管用户点击“生成”到最终图片展示的完整生命周期。
    *   **AC**:
        1. 暴露 `submit(payload)` 方法。提交成功后，在本地状态写入临时占位卡片（Optimistic UI），状态设为 `PENDING`。
        2. 启动轮询：使用 SWR 的 `refreshInterval` 机制，如果当前存在状态为 `PENDING` 的任务，则每隔 3000ms 自动静默调用 `pollAssetStatus`。
        3. 一旦接口返回 `SUCCESS` (带着图片 URL) 或 `FAILED`，停止对应 ID 的轮询，触发 UI 平滑过渡展示结果图片。

#### 🧱 阶段 4：组件积木开发 (`components/`)
> *约束：强制应用附录中的 UI 设计语言，利用 Tailwind + framer-motion 实现。*

*   [ ] **4.1 开发 Bento 瀑布流画廊 (`MasonryFeed.tsx` & `AssetCard.tsx`)**
    *   **任务**: 首页核心视觉区。
    *   **AC**:
        1. `AssetCard` 组件：毛玻璃背景，图片圆角包裹。Hover 时图片极轻微放大 (`group-hover:scale-105`)，使用 `framer-motion` 做懒加载淡入 (`initial={{ opacity: 0, y: 20 }}`)。
        2. `MasonryFeed` 组件：如果是移动端单列排布，PC/Pad 端使用 CSS 多列或 `grid` 排布大小不一的卡片（Bento 风格）。
*   [ ] **4.2 开发 AI 思考态占位卡片 (`GeneratingSkeleton.tsx`)**
    *   **任务**: 当任务处于 `PENDING` 时的视觉反馈组件。
    *   **AC**: 绝不使用转圈 loading。采用毛玻璃卡片底色，内部实现一个丝滑的流光动画（动态渐变背景或呼吸发光），配以文字如“AI 正在构思画面细节...”，缓解用户焦虑。
*   [ ] **4.3 开发创作抽屉/弹窗 (`CreationBottomSheet.tsx`)**
    *   **任务**: 移动优先的底部滑出式创作面板。
    *   **AC**:
        1. 使用 `framer-motion` 实现顺滑的向上拉出动画（Bottom Sheet 体验）。
        2. 顶部带一个小抓手 (Handle bar)。
        3. 内部使用 Tabs 切分：“海报生成” / “App 系列插图”。
        4. 表单输入框采用无边框+底色设计（`bg-black/5 focus:bg-white/50 border-transparent focus:ring-2 focus:ring-blue-500/30`），点击时带有微弹跳反馈。
*   [ ] **4.4 开发吸顶玻璃导航栏 (`GlassHeader.tsx`)**
    *   **任务**: 悬浮在画廊顶部的操作栏。
    *   **AC**:
        1. 必须配置 `sticky top-0 z-50 backdrop-blur-xl border-b border-white/20`。
        2. 包含左侧返回按钮（调用系统标准的 `PageHeader` 后退），中间展示应用 Logo/Title，右侧放置“创作中心/我的图库”入口。

#### 🎬 阶段 5：主页面组装与验收 (`index.tsx`)
*   [ ] **5.1 组装并联调**
    *   **任务**: 在 `index.tsx` 中把所有 Hook 和 Component 串联。
    *   **AC**:
        1. 页面骨架：`<GlassHeader />` + `<MasonryFeed />` + 右下角悬浮的超大主行动按钮 (FAB, 点击弹跳并打开创作抽屉) + `<CreationBottomSheet />`。
        2. **异常防阻断验收**：断开网络或后端返回 500 时，页面不白屏，SWR 能够截获错误并展示轻量的 Toast 或空状态界面。
        3. **静态回归验收**：跑一遍 `npm run lint` 和 `npx tsc --noEmit`，确保模块内零 Type Error。

---

### 💡 如何在真实开发中指派 AI？

当你要开始切入前端代码时，复制上述的**【全局 UI 设计与美学规范 (System Prompt)】**，并加上这句指令扔给 Cursor/Claude：

> *"请阅读上文的美学规范，并结合我提供的《Hope Toolset 前端开发指南》。现在我们要执行 **TypoCraft 前端 Todo List 的 阶段 4.1 (AssetCard 与 MasonryFeed 组件)**。请帮我编写这两个组件的 React (TSX) 代码，确保完美应用 Bento Box 与 Glassmorphism 风格，并且加上 `framer-motion` 的优雅微交互。"*

AI 会瞬间吐出极其干净、动效拉满的现代化 React 组件代码，完全符合你的顶级工程预期！