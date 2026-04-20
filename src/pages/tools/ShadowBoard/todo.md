### 🎨 UI/UX 优化建议 (给 ShadowBoard 的加分项)

1.  **高级感色彩体系 (Shadow Tone)**：
    *   抛弃传统的纯白背景，采用 **Zinc (锌灰) 或 Slate (板岩灰)** 为主色调的极浅背景（如 `bg-slate-50`）。
    *   卡片边框使用极细的半透明线 `border-white/20` 或 `border-slate-200/50`。
    *   高管角色的主色调采用低饱和度的“老钱风”色彩：深海蓝 (CEO/你)、勃艮第红 (PM/撕逼主力)、墨绿 (架构师/理性输出)、冷灰 (裁决使/无情裁判)。
2.  **微交互 (Framer-motion)**：
    *   **Bento 展开动画**：在会话列表中点击一个“Idea 卡片”时，使用 Framer-motion 的 `layoutId` 属性，让卡片平滑“放大”并过渡到整个聊天室视图。
    *   **打字机气泡生成**：当某个董事开始说话时，气泡框的出现应该带有轻微的 `y: 10, opacity: 0` 到 `y: 0, opacity: 1` 的弹跳涌现效果。
3.  **身份标识 (Minimalist Avatars)**：
    *   不要用拟人头像。建议用**极简的抽象几何图形 + 字母**。比如：产品经理是红色的三角形 `▲`，架构师是蓝色的正方形 `■`。显得更像一个没有感情但极度专业的 AI 引擎。

---

# 🎨 影子董事会 (ShadowBoard AI) - 前端开发 Todo List

**工作目录**: `src/pages/tools/ShadowBoard/`
**设计规范**: Bento Box, Backdrop-blur, Framer-motion

### [ ] 1. 工具注册与路由配置 (`src/config/tools.ts` & `router`)
*   **AC1:** `tools.ts` 中添加工具：`id: 'shadow-board'`, `name: '影子董事会'`, `description: '你的想法，值得一支顶配团队为你吵架'`, `category: 'dev'` 或 `'finance'`, `icon: 'UsersRound'`。
*   **AC2:** `router/index.tsx` 中添加全屏路由（因为带列表和聊天室，推荐全屏沉浸式体验）：`<Route path="/tools/shadow-board" element={<ToolWrapper fullscreen><ShadowBoardPage /></ToolWrapper>} />`。

### [ ] 2. 复杂工具目录结构搭建
*   **AC1:** 按照 FE RULE 创建标准目录：
    *   `types.ts` (定义 BoardSession, BoardMessage 接口)
    *   `services/api.ts`
    *   `hooks/useBoardSessions.ts` (管理列表)
    *   `hooks/useBoardDebate.ts` (管理单个会议室与 SSE)
    *   `components/BentoCard.tsx` (列表卡片)
    *   `components/DebateBubble.tsx` (聊天气泡)
    *   `views/SessionListView.tsx` (想法列表页)
    *   `views/BoardroomView.tsx` (会议室辩论页)
    *   `index.tsx` (主入口，负责在列表和会议室之间切换)

### [ ] 3. API 服务层扩展 (`services/api.ts`)
*   **AC1:** 使用 `apiClient` 并注入 `app: 'hope_shadow_board'` Header。
*   **AC2:** 实现列表 API：`getSessions()` (获取所有想法), `createSession(topic: string)` (抛出新想法), `deleteSession(id)`。
*   **AC3:** 实现会议室 API：`getSessionHistory(id)`, `getSessionStatus(id)`, `speakInBoard(id, content)`。

### [ ] 4. 💡 想法列表视图 (`views/SessionListView.tsx`)
*   **UI 目标:** Bento Box 瀑布流/网格布局。
*   **AC1:** 顶部放置醒目的 Hero Section，展示 Slogan：“Not your yes-men. Great products are born from great debates.”
*   **AC2:** 提供一个高亮、带有毛玻璃效果的输入框或按钮：“抛出一个新想法 / Propose an Idea”。
*   **AC3:** 会话列表使用 CSS Grid 实现 Bento 布局 (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`)。
*   **AC4 (UI Detail):** 每个 `BentoCard` 需包含：
    *   背景 `bg-white/60 backdrop-blur-md`，边框 `border border-slate-200/50`，圆角 `rounded-2xl`。
    *   悬浮效果 `hover:shadow-lg transition-all duration-300`。
    *   卡片内显示 Idea 的截断标题、参会的高管头像堆叠 (`AvatarGroup`)、最近更新时间，以及当前状态（如 `辩论中 (Debating)` 或 `已出结论 (Resolved)`）。
*   **AC5:** 点击卡片，切换 `activeSessionId` 状态，组件切换到 `BoardroomView`。

### [ ] 5. 🏛️ 会议室辩论视图 (`views/BoardroomView.tsx`)
*   **UI 目标:** 沉浸式群聊、毛玻璃导航栏、高管气泡。
*   **AC1:** 顶部固定导航栏（毛玻璃），包含“< 返回仪表盘”、“议题：[标题]”，右侧显示当前会议状态（绿色圆点表示 `引擎运转中`，灰色表示 `等待指示`）。
*   **AC2 (气泡设计):** 引入 `framer-motion`。使用 `<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>` 渲染 `DebateBubble`。
*   **AC3 (角色区分):** 在 `DebateBubble` 内，根据 `role` 显示不同颜色的几何图标和称谓。UI 必须区别于普通聊天软件，更像是一份“会议纪要动态展开”。
*   **AC4:** 底部输入区域（你/CEO的发言台），当状态非 `idle` 和 `done` 时（AI 团队正在激烈辩论），输入框显示毛玻璃遮罩并禁用，提示“高管正在激烈讨论中，请稍候...”。

### [ ] 6. 核心状态流转与断线重连 Hook (`hooks/useBoardDebate.ts`)
*   **AC1:** 传入 `sessionId`。初始化时并发调用 `getSessionHistory` 和 `getSessionStatus`。
*   **AC2 (热接流逻辑):**
    *   如果拉取到的 Status 为 `speaking` 或 `scoring`，立刻 `new EventSource('/api/v1/executives/stream?session_id=xxx')` 建立 SSE。
    *   接收 SSE 事件，实时更新最后一条气泡的 `content`。
    *   监听到 `event: done` 或 `status_change: idle`，主动 `source.close()` 关闭流，解除底部输入框的禁用状态。
*   **AC3:** 当用户提交新指示时，调用 `speakInBoard`，在本地立刻塞入一条“我/CEO”的记录，并将内部状态设为 `scoring` (触发引擎运转)，再次开启 SSE 监听后端推流。
*   **AC4:** 暴露出 `messages`, `status`, `isLoading`, `sendMessage` 供 `BoardroomView` 使用。自动处理滚动到底部的副作用 (`useEffect` 监听 `messages` 变化)。
