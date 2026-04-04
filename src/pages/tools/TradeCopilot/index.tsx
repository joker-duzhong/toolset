// ────────────────────────────────────────────────
// Trade Copilot - 主入口页面
// ────────────────────────────────────────────────
// 底部 Tab 导航 + 状态切换模式
// ────────────────────────────────────────────────

import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { type TabKey } from './constants'
import { DashboardView } from './views/DashboardView'
import { PositionsView } from './views/PositionsView'
import { WatchlistView } from './views/WatchlistView'
import { StrategiesView } from './views/StrategiesView'
import { JournalsView } from './views/JournalsView'

export function TradeCopilotPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />
      case 'positions':
        return <PositionsView />
      case 'watchlist':
        return <WatchlistView />
      case 'strategies':
        return <StrategiesView />
      case 'journals':
        return <JournalsView />
    }
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* 主体内容 */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-3">
          {renderView()}
        </div>
      </main>

      {/* 底部导航 */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
