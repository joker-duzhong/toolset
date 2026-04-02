# Trade Copilot — 产品需求文档 (PRD)

## 1. 产品概述

**定位：** 个人A股实盘交易辅助工具，帮助散户在交易中做到"有纪律、有记录、有反思"。

**核心价值：**
- 大盘风控一目了然（红绿灯 + 温度计）
- 持仓/流水全链路管理
- 观察池 + 策略引擎 + 仓位计算
- 交易日记驱动知行合一

**用户场景：** 用户（A股散户）在微信浏览器中使用该工具，辅助每日盯盘、买卖决策和复盘。

---

## 2. 信息架构

```
Trade Copilot (底部 Tab 导航)
├── 驾驶舱 Dashboard (首页)
│   ├── 大盘红绿灯 (上证/深证 20日线状态)
│   ├── 市场温度计 (赚钱效应 / 情绪周期 / 领涨板块)
│   └── 持仓概览卡片 (盈亏汇总)
│
├── 持仓 Positions
│   ├── 当前持仓列表 (实时盈亏、止盈止损进度)
│   ├── 已清仓列表
│   ├── 新增买入 表单
│   └── 持仓详情
│       ├── 持仓基本信息
│       ├── 交易流水 (BS点记录)
│       └── 添加交易流水
│
├── 观察 Watchlist
│   ├── 观察池列表
│   ├── 新增观察 (含 ST 黑名单拦截)
│   └── 编辑/删除观察项
│
├── 策略 Strategies
│   ├── 策略列表
│   ├── 创建策略 (止盈/止损网格)
│   ├── 编辑策略
│   ├── 资金设置 (总本金 + 凯利仓位)
│   └── 废弃策略
│
└── 日记 Journals
    ├── 日记列表 (按日期倒序)
    ├── 新建日记 (情绪评分 + 犯错记录)
    └── 编辑日记
```

---

## 3. 页面详细设计

### 3.1 驾驶舱 Dashboard

**功能说明：** 交易时段打开 APP 的第一眼，快速判断"今天能不能交易"。

| 区域 | 数据来源 | 展示形式 |
|------|----------|----------|
| 大盘红绿灯 | `GET /market/status` | 两个指示灯卡片（上证/深证），红=线之上安全，绿=跌破防守，附带原因文字 |
| 市场温度计 | `GET /market/thermometer` | 综合得分环形进度条(0-100) + 情绪周期标签(冰点/分歧/高潮) + 涨跌停家数 + 领涨板块 Top5 列表 |
| 持仓概览 | `GET /positions?status=holding` | 汇总卡片：总市值、总盈亏额、总盈亏率、持仓数量 |

**交互要点：**
- 页面进入时自动刷新所有数据，支持下拉刷新
- 红绿灯状态用醒目颜色区分
- 温度计得分 < 30 显示冰蓝色，30-70 黄色，> 70 红色（过热警告）

### 3.2 持仓管理 Positions

**列表页：**
- 顶部 Tab 切换：当前持仓 / 已清仓
- 持仓卡片信息：股票名称、代码、成本价、买入日期、持仓数量、当前状态
- 右下角 FAB 按钮：新增买入
- 点击卡片进入持仓详情

**新增买入表单 (`POST /positions`)：**
- 股票代码（必填，6位数字）
- 股票名称（必填）
- 买入日期（默认今天）
- 成本价（必填，> 0）
- 买入数量（必填，正整数且为100的倍数）

**持仓详情页：**
- 顶部：股票名称 + 代码 + 状态标签
- 信息区：成本价、数量、买入日期
- 交易流水列表 (`GET /positions/{id}/transactions`)
- 添加交易流水按钮 (buy/sell，价格，数量)
- 卖出清仓操作 (`PUT /positions/{id}`，状态改为 closed)
- 删除持仓 (`DELETE /positions/{id}`，需二次确认)

### 3.3 观察池 Watchlist

**功能说明：** 狙击雷达，提前标记感兴趣的标的。

- 列表展示：股票代码、名称、加入时间、备注
- 新增观察 (`POST /watchlist`)：输入股票代码 + 名称，**ST 股自动拦截**（调用 `GET /market/st-list` 校验）
- 滑动/长按操作：编辑 (`PUT`)、删除 (`DELETE`)
- 点击可快速跳转新增买入

### 3.4 策略管理 Strategies

**策略列表：**
- 每条策略卡片展示：策略名称、适用范围、止盈/止损比例
- 状态标识：生效中 / 已废弃
- 支持创建、编辑、废弃操作

**创建策略 (`POST /strategies`)：**
- 策略名称（必填）
- 止盈网格比例（如 10%, 20%, 30%）
- 止损网格比例（如 -5%, -8%）
- 适用范围描述

**资金设置 (`GET/PUT /settings/capital`)：**
- 显示总可用本金
- 可修改总本金
- 展示凯利仓位建议（基于板块分数自动计算）

### 3.5 交易日记 Journals

**功能说明：** 每天记录情绪与决策，驱动复盘。

- 日记列表：按日期倒序，展示日期、情绪评分(1-5星)、简要内容
- 新建日记 (`POST /journals`)：
  - 交易日期（默认今天）
  - 情绪评分（1-5 星选择器）
  - 今日操作回顾（文字）
  - 犯错记录（文字）
  - 心得体会（文字）
- 编辑日记 (`PUT /journals/{id}`)

---

## 4. 技术规格

### 4.1 架构选型

遵循项目现有架构：
- React 19 + TypeScript + Vite
- Tailwind CSS 4（无 UI 组件库，纯 Tailwind 手写）
- react-router-dom v7
- 无全局状态库，各模块独立管理 state
- API 调用使用现有 `apiClient`（已封装 Bearer token 鉴权）

### 4.2 文件结构

```
src/pages/tools/TradeCopilot/
├── index.tsx                 # 主入口，底部 Tab 导航 + 路由分发
├── types.ts                  # 所有类型定义
├── constants.ts              # 常量（Tab 配置、情绪周期枚举等）
├── services/
│   └── api.ts                # 封装所有 trade_copilot API 调用
├── hooks/
│   ├── useMarket.ts          # 大盘/温度计数据 hook
│   ├── usePositions.ts       # 持仓 CRUD hook
│   ├── useWatchlist.ts       # 观察池 CRUD hook
│   ├── useStrategies.ts      # 策略 CRUD hook
│   ├── useJournals.ts        # 日记 CRUD hook
│   └── useCapital.ts         # 资金设置 hook
├── views/
│   ├── DashboardView.tsx     # 驾驶舱
│   ├── PositionsView.tsx     # 持仓列表
│   ├── PositionDetailView.tsx# 持仓详情
│   ├── WatchlistView.tsx     # 观察池
│   ├── StrategiesView.tsx    # 策略管理
│   └── JournalsView.tsx      # 交易日记
└── components/
    ├── BottomNav.tsx         # 底部导航栏
    ├── TrafficLight.tsx      # 大盘红绿灯组件
    ├── Thermometer.tsx       # 市场温度计组件
    ├── PositionCard.tsx      # 持仓卡片
    ├── TransactionList.tsx   # 交易流水列表
    ├── WatchlistItem.tsx     # 观察池条目
    ├── StrategyCard.tsx      # 策略卡片
    ├── JournalCard.tsx       # 日记卡片
    ├── StarRating.tsx        # 星级评分选择器
    └── EmptyState.tsx        # 空状态占位
```

### 4.3 API 基础路径

所有接口前缀: `/trade_copilot`，通过现有 `apiClient` 调用，自动携带 Bearer token。

### 4.4 App 标识符

后端要求所有独立工具应用在请求中携带 `app` 参数以区分不同工具。Trade Copilot 的 app key 为：

```
hope_trade_copilot
```

**传递方式：** 所有 API 请求的 query 参数或 request body 中携带 `app: "hope_trade_copilot"`，具体以后端要求为准。需在 `services/api.ts` 中统一封装，避免每个调用处重复传递。

### 4.4 关键交互规则

1. **ST 拦截：** 新增观察时先调用 `GET /market/st-list` 缓存黑名单，前端校验 + 后端双重拦截
2. **乐观更新：** 删除操作使用乐观更新，失败时回滚
3. **下拉刷新：** 所有列表页支持下拉刷新
4. **空状态：** 所有列表为空时展示友好空状态引导
5. **Loading 状态：** 所有 API 调用期间展示 loading 骨架屏/spinner
6. **表单校验：** 前端校验必填项和格式，错误信息就近展示

---

## 5. 非功能需求

| 项目 | 要求 |
|------|------|
| 兼容性 | 主要在微信浏览器中使用，需保证 iOS/Android 微信兼容 |
| 性能 | 驾驶舱首屏加载 < 2s，列表滚动 60fps |
| 离线 | 无离线要求，所有数据来自 API |
| 安全 | 所有请求通过 apiClient 自动携带 token，无明文凭据 |
