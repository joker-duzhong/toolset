# Trade Copilot — 开发任务清单

> 每个任务包含 **验收标准 (AC)**，完成前需逐条确认。

---

## Phase 0: 基础设施 (Foundation)

### T0.1 注册路由 & 工具入口
**内容：** 在 `src/config/tools.ts` 添加 Trade Copilot 工具条目，在 `src/router/index.tsx` 添加路由。

**AC:**
- [ ] `tools.ts` 中新增条目：category=`finance`（或合适的分类），icon=`TrendingUp`，path=`/tools/trade-copilot`，中文标签
- [ ] 首页工具网格中可见 Trade Copilot 卡片，点击跳转正确
- [ ] 浏览器直接访问 `/tools/trade-copilot` 可正常渲染（不 404）

### T0.2 创建 types.ts
**内容：** 定义所有 TypeScript 类型：MarketStatus, Thermometer, Position, Transaction, WatchlistItem, Journal, Strategy, CapitalSettings, 以及所有 API 请求/响应类型。

**AC:**
- [ ] 类型覆盖 API 文档中所有 8 个模块的请求参数和响应数据
- [ ] 无 `any` 类型
- [ ] 编译通过，无 TS 报错

### T0.3 创建 constants.ts
**内容：** Tab 配置、情绪周期枚举映射、默认值等常量。

**AC:**
- [ ] 包含底部导航 5 个 Tab 的 key/label/icon 配置
- [ ] 情绪周期枚举到中文标签的映射
- [ ] 持仓状态枚举（holding/closed）
- [ ] 交易类型枚举（buy/sell）

### T0.4 创建 services/api.ts
**内容：** 基于 `apiClient` 封装所有 Trade Copilot API 调用函数。所有请求需统一携带 `app: "hope_trade_copilot"` 标识符。

**AC:**
- [ ] 覆盖 API 文档中全部 17 个接口
- [ ] 每个函数有明确的参数类型和返回类型
- [ ] 基础路径统一为 `/trade_copilot`
- [ ] **所有请求统一携带 `app: "hope_trade_copilot"` 标识符**，在封装层统一注入，业务调用处无需关心
- [ ] 导出清晰，按模块分组注释

---

## Phase 1: 骨架 & 导航 (Shell)

### T1.1 底部导航栏 BottomNav 组件
**内容：** 实现 5-Tab 底部导航（驾驶舱/持仓/观察/策略/日记），参考 MovieTV 的 BottomNav 模式。

**AC:**
- [ ] 5 个 Tab 正确显示图标 + 文字
- [ ] 当前选中 Tab 高亮（indigo 色系）
- [ ] Tab 切换时内容区域正确切换
- [ ] 固定在页面底部，不随内容滚动
- [ ] iPhone X+ 安全区底部适配 (`pb-safe` 或 `env(safe-area-inset-bottom)`)

### T1.2 主入口 index.tsx
**内容：** 创建 TradeCopilot 主入口，管理 Tab 状态和视图切换。

**AC:**
- [ ] 使用 useState 管理 activeTab，根据 activeTab 渲染对应 View
- [ ] 不使用 react-router 嵌套路由（与 MovieTV 一致的纯状态切换模式）
- [ ] 整体布局：内容区 flex-1 可滚动 + 底部固定导航
- [ ] 页面背景色与其他工具一致 (`bg-gray-50`)

### T1.3 EmptyState 通用空状态组件
**内容：** 列表为空时的占位组件。

**AC:**
- [ ] 接收 icon、title、description 可选参数
- [ ] 有默认的空状态文案和图标
- [ ] 居中布局，视觉友好

---

## Phase 2: 驾驶舱 Dashboard

### T2.1 useMarket Hook
**内容：** 封装大盘红绿灯和市场温度计数据获取逻辑。

**AC:**
- [ ] `useMarketStatus()` 调用 `GET /market/status`，返回 { data, loading, error, refresh }
- [ ] `useMarketThermometer()` 调用 `GET /market/thermometer`，返回同结构
- [ ] loading 状态正确管理
- [ ] 请求失败时 error 非空，不抛异常到 UI

### T2.2 TrafficLight 红绿灯组件
**内容：** 展示上证/深证 20 日线状态。

**AC:**
- [ ] 两个并排卡片，分别显示上证和深证
- [ ] `red` 状态：红色/暖色调，文字"线之上"
- [ ] `green` 状态：绿色/冷色调，文字"已跌破"
- [ ] 展示原因描述文字
- [ ] 未加载时展示骨架占位

### T2.3 Thermometer 温度计组件
**内容：** 展示市场综合评分、情绪周期、涨跌停数据、领涨板块。

**AC:**
- [ ] 综合评分以环形/半圆进度条展示，数字居中
- [ ] 评分 < 30 冰蓝色，30-70 黄色，> 70 红色
- [ ] 情绪周期以标签形式展示（如"分歧"带颜色标签）
- [ ] 涨停/跌停家数以数字展示
- [ ] 领涨板块 Top5 以列表/标签组展示

### T2.4 DashboardView 驾驶舱视图
**内容：** 组装 Dashboard 页面，集成红绿灯 + 温度计 + 持仓概览。

**AC:**
- [ ] 顶部：大盘红绿灯区域
- [ ] 中部：市场温度计区域
- [ ] 底部：持仓概览汇总卡片（调用 `GET /positions?status=holding`，展示总持仓数、总盈亏）
- [ ] 进入页面自动加载数据
- [ ] 支持下拉刷新（所有数据重新加载）
- [ ] 各区域独立 loading 状态，不互相阻塞

---

## Phase 3: 持仓管理 Positions

### T3.1 usePositions Hook
**内容：** 封装持仓 CRUD + 交易流水操作。

**AC:**
- [ ] `usePositions(status?)` — 获取持仓列表，支持 status 参数筛选
- [ ] `useCreatePosition()` — 新增持仓，成功后刷新列表
- [ ] `useUpdatePosition()` — 更新持仓（卖出清仓等）
- [ ] `useDeletePosition()` — 删除持仓（乐观更新）
- [ ] `useTransactions(positionId)` — 获取某持仓的交易流水
- [ ] `useCreateTransaction()` — 添加交易流水
- [ ] 所有写操作完成后自动刷新相关数据

### T3.2 PositionCard 持仓卡片组件
**内容：** 持仓列表中的单条卡片。

**AC:**
- [ ] 展示：股票名称、代码、成本价、买入日期、数量
- [ ] 展示持仓状态标签（持有中/已清仓）
- [ ] 点击卡片进入持仓详情
- [ ] 紧凑布局，信息层级清晰

### T3.3 TransactionList 交易流水组件
**内容：** 展示某持仓下的所有买卖流水。

**AC:**
- [ ] 按时间倒序排列
- [ ] 买入(buy)用绿色标识，卖出(sell)用红色标识
- [ ] 每条展示：日期、操作类型、价格、数量
- [ ] 支持新增流水按钮

### T3.4 PositionsView 持仓列表视图
**内容：** 持仓管理主页面。

**AC:**
- [ ] 顶部 Tab 切换：当前持仓 / 已清仓
- [ ] 当前持仓 Tab：调用 `GET /positions?status=holding`
- [ ] 已清仓 Tab：调用 `GET /positions?status=closed`
- [ ] 右下角 FAB 按钮，点击弹出新增买入表单
- [ ] 列表为空时展示 EmptyState
- [ ] 支持下拉刷新

### T3.5 新增买入表单 (Modal/Sheet)
**内容：** 弹出式表单，用于记录新增买入。

**AC:**
- [ ] 字段：股票代码（6位数字校验）、股票名称、买入日期（默认今天）、成本价（> 0）、数量（正整数，100 的倍数）
- [ ] 必填校验：提交前检查所有必填字段
- [ ] 提交成功后关闭表单，列表自动刷新
- [ ] 提交失败展示错误提示
- [ ] 支持"取消"关闭表单

### T3.6 PositionDetailView 持仓详情视图
**内容：** 单个持仓的详情页面。

**AC:**
- [ ] 顶部展示股票名称 + 代码 + 状态标签
- [ ] 信息区：成本价、数量、买入日期
- [ ] 交易流水区域：使用 TransactionList 组件
- [ ] "添加流水"按钮 → 弹出 buy/sell 表单（价格 + 数量）
- [ ] "卖出清仓"按钮 → 二次确认 → 调用 `PUT /positions/{id}` 改为 closed
- [ ] "删除"按钮 → 二次确认 → 调用 `DELETE /positions/{id}` → 返回列表
- [ ] 返回按钮回到持仓列表

---

## Phase 4: 观察池 Watchlist

### T4.1 useWatchlist Hook
**内容：** 封装观察池 CRUD。

**AC:**
- [ ] `useWatchlist()` — 获取观察池列表
- [ ] `useAddToWatchlist()` — 新增观察，ST 股前端拦截
- [ ] `useUpdateWatchlist()` — 更新观察项
- [ ] `useDeleteWatchlist()` — 删除观察项（乐观更新）
- [ ] `useStList()` — 获取 ST 黑名单（缓存）

### T4.2 WatchlistItem 组件
**内容：** 观察池单条组件。

**AC:**
- [ ] 展示股票代码、名称、加入时间、备注
- [ ] 支持编辑和删除操作入口
- [ ] 提供"快速买入"按钮（跳转到新增持仓表单，预填代码和名称）

### T4.3 WatchlistView 观察池视图
**内容：** 观察池管理页面。

**AC:**
- [ ] 列表展示所有观察项
- [ ] 底部/右下角"新增观察"按钮
- [ ] 新增表单：输入股票代码 + 名称 → 提交前校验 ST 黑名单 → 拦截则提示"该股票为 ST 股，风险较高，不建议观察"
- [ ] 后端拒绝 ST 时也展示后端返回的错误信息
- [ ] 支持编辑（修改备注等）
- [ ] 支持删除（二次确认）
- [ ] 列表为空时展示 EmptyState，引导"添加你的第一个观察目标"

---

## Phase 5: 策略管理 Strategies

### T5.1 useStrategies Hook + useCapital Hook
**内容：** 封装策略和资金设置的 CRUD。

**AC:**
- [ ] `useStrategies()` — 获取/创建/编辑/废弃策略
- [ ] `useCapital()` — 获取/更新资金设置
- [ ] 废弃策略调用 `DELETE /strategies/{id}`
- [ ] 所有写操作后自动刷新列表

### T5.2 StrategyCard 策略卡片组件
**内容：** 策略列表中的卡片。

**AC:**
- [ ] 展示策略名称、止盈/止损比例
- [ ] 展示状态标签（生效中 / 已废弃）
- [ ] 操作按钮：编辑、废弃
- [ ] 已废弃策略置灰展示

### T5.3 StrategiesView 策略管理视图
**内容：** 策略管理主页面。

**AC:**
- [ ] 顶部：资金设置卡片（总本金 + 凯利仓位建议），点击可编辑
- [ ] 策略列表区域：使用 StrategyCard
- [ ] "新建策略"按钮 → 表单（名称、止盈比例、止损比例、适用范围）
- [ ] 编辑策略 → 预填已有数据的表单
- [ ] 废弃策略 → 二次确认 → 状态变为已废弃
- [ ] 列表为空时展示 EmptyState

### T5.4 资金设置编辑
**内容：** 修改总本金的表单/弹窗。

**AC:**
- [ ] 展示当前总本金
- [ ] 输入框修改总本金（数字，> 0）
- [ ] 保存调用 `PUT /settings/capital`
- [ ] 展示凯利仓位建议（只读，来自 API 返回）

---

## Phase 6: 交易日记 Journals

### T6.1 useJournals Hook
**内容：** 封装日记 CRUD。

**AC:**
- [ ] `useJournals()` — 获取日记列表
- [ ] `useCreateJournal()` — 创建日记
- [ ] `useUpdateJournal()` — 修改日记
- [ ] 列表按日期倒序

### T6.2 StarRating 星级评分组件
**内容：** 1-5 星选择器，用于情绪评分。

**AC:**
- [ ] 5 颗星，点击选择评分
- [ ] 选中星星高亮（金色），未选中灰色
- [ ] 支持受控模式（value + onChange）
- [ ] 触摸友好，星星点击区域足够大（≥ 44px）

### T6.3 JournalCard 日记卡片组件
**内容：** 日记列表中的卡片。

**AC:**
- [ ] 展示日期、情绪评分（星星图标）、操作回顾摘要
- [ ] 点击进入编辑
- [ ] 视觉上与日记场景匹配（偏暖色调或书签感）

### T6.4 JournalsView 交易日记视图
**内容：** 日记管理主页面。

**AC:**
- [ ] 日记列表按日期倒序
- [ ] 每条展示日期 + 星级 + 内容摘要
- [ ] 右下角 FAB："新建日记"
- [ ] 新建/编辑表单：交易日期、情绪评分(StarRating)、操作回顾、犯错记录、心得体会
- [ ] 所有文字字段非必填，日期和评分必填
- [ ] 保存成功后返回列表并刷新
- [ ] 列表为空时展示 EmptyState，引导"记录你的第一篇交易日记"

---

## Phase 7: 集成 & 优化 (Polish)

### T7.1 全局错误处理 & Toast 提示
**内容：** 统一 API 错误提示机制。

**AC:**
- [ ] API 调用失败时展示错误 Toast（从 response.message 提取）
- [ ] 网络异常时展示"网络连接失败"提示
- [ ] Toast 3 秒后自动消失
- [ ] 不使用 alert/prompt/confirm

### T7.2 Loading 状态统一
**内容：** 所有列表和表单的加载态统一处理。

**AC:**
- [ ] 首次加载列表：展示骨架屏（2-3 行占位块）
- [ ] 下拉刷新：顶部 spinner
- [ ] 表单提交：按钮变为 loading 状态，禁止重复提交
- [ ] 删除确认弹窗中确认按钮：loading 状态

### T7.3 交互细节打磨
**内容：** 提升操作流畅度。

**AC:**
- [ ] 所有按钮有 `active:scale-[0.97]` 按压反馈
- [ ] Tab 切换有淡入淡出过渡动画
- [ ] 卡片点击有微弱阴影/背景色反馈
- [ ] 表单输入聚焦时有明显边框高亮
- [ ] 数字键盘：成本价/数量输入框使用 `inputMode="decimal"` / `inputMode="numeric"`

### T7.4 飞书 Webhook 调试入口（可选）
**内容：** 在设置/调试页面提供飞书推送测试。

**AC:**
- [ ] 输入标题 + 内容 → 调用 `POST /feishu-test`
- [ ] 展示发送成功/失败结果
- [ ] 仅在开发模式下展示入口（或放在策略页底部）

---

## 任务依赖关系

```
Phase 0 (T0.1-T0.4) → Phase 1 (T1.1-T1.3) → Phase 2~6 可并行
                                            → Phase 2 (T2.1-T2.4) 驾驶舱
                                            → Phase 3 (T3.1-T3.6) 持仓
                                            → Phase 4 (T4.1-T4.3) 观察池
                                            → Phase 5 (T5.1-T5.4) 策略
                                            → Phase 6 (T6.1-T6.4) 日记
                                            → Phase 7 (T7.1-T7.4) 集成优化
```

**预计总任务数：** 27 个子任务
**建议开发顺序：** Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7
