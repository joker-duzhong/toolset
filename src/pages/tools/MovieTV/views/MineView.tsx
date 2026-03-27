// ────────────────────────────────────────────────
// 影视大全 - "我的" 视图
// ────────────────────────────────────────────────
// 包含：菜单、收藏列表、历史列表 三个子视图

import { useState } from 'react'
import {
  Heart, Clock, Download, Settings, ChevronRight, Film,
  ArrowLeft, Trash2, Star, X, HardDrive,
} from 'lucide-react'
import type { FavoriteItem, HistoryItem } from '../hooks/useStorage'

// ── 相对时间格式化 ──

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return new Date(ts).toLocaleDateString('zh-CN')
}

// ── Props ──

type SubView = 'menu' | 'favorites' | 'history'

interface MineViewProps {
  favorites: FavoriteItem[]
  history: HistoryItem[]
  onItemClick: (id: string) => void
  onRemoveFavorite: (id: string) => void
  onRemoveHistory: (id: string, episodeId?: string) => void
  onClearFavorites: () => void
  onClearHistory: () => void
  storageSize: { favorites: number; history: number; total: number }
}

// ── 主组件 ──

export function MineView({
  favorites,
  history,
  onItemClick,
  onRemoveFavorite,
  onRemoveHistory,
  onClearFavorites,
  onClearHistory,
  storageSize,
}: MineViewProps) {
  const [subView, setSubView] = useState<SubView>('menu')

  if (subView === 'favorites') {
    return (
      <FavoritesContent
        items={favorites}
        onBack={() => setSubView('menu')}
        onItemClick={onItemClick}
        onRemove={onRemoveFavorite}
        onClearAll={onClearFavorites}
      />
    )
  }

  if (subView === 'history') {
    return (
      <HistoryContent
        items={history}
        onBack={() => setSubView('menu')}
        onItemClick={onItemClick}
        onRemove={onRemoveHistory}
        onClearAll={onClearHistory}
      />
    )
  }

  // ── 菜单主页 ──

  const menuItems = [
    {
      icon: Heart,
      label: '我的收藏',
      count: favorites.length,
      color: 'text-pink-500 bg-pink-50',
      onClick: () => setSubView('favorites'),
    },
    {
      icon: Clock,
      label: '观看历史',
      count: history.length,
      color: 'text-blue-500 bg-blue-50',
      onClick: () => setSubView('history'),
    },
    {
      icon: Download,
      label: '离线缓存',
      count: undefined as number | undefined,
      color: 'text-green-500 bg-green-50',
      onClick: undefined as (() => void) | undefined,
      disabled: true,
    },
    {
      icon: Settings,
      label: '播放设置',
      count: undefined as number | undefined,
      color: 'text-gray-500 bg-gray-100',
      onClick: undefined as (() => void) | undefined,
      disabled: true,
    },
  ]

  return (
    <div className="flex flex-col gap-4 pb-4 lg:max-w-2xl lg:mx-auto lg:w-full">
      {/* 用户区域 */}
      <div className="flex items-center gap-4 p-4 lg:p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
        <div className="size-14 lg:size-16 rounded-full bg-white/20 flex items-center justify-center">
          <Film className="size-7 lg:size-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold">影视大全</h2>
          <p className="text-sm text-white/70">登录后享受更多功能</p>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={item.onClick}
            disabled={item.disabled}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition ${
              i < menuItems.length - 1 ? 'border-b border-gray-50' : ''
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`size-8 rounded-lg flex items-center justify-center ${item.color}`}>
              <item.icon className="size-4" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className="text-xs text-gray-400">{item.count}</span>
            )}
            {item.disabled && (
              <span className="text-[10px] text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded">即将上线</span>
            )}
            <ChevronRight className="size-4 text-gray-300" />
          </button>
        ))}
      </div>

      {/* 存储容量 */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="size-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">本地缓存</span>
          <span className="text-[10px] text-gray-400 ml-auto">{storageSize.total} KB</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all"
            style={{ width: `${Math.min((storageSize.total / 2048) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
          <span>收藏 {storageSize.favorites} KB · 历史 {storageSize.history} KB</span>
          <span>上限 2 MB</span>
        </div>
      </div>

      {/* 数据来源 */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          影视数据由 TMDB (The Movie Database) 提供
        </p>
      </div>
    </div>
  )
}

// ── 收藏列表 ──────────────────────────────────

function FavoritesContent({
  items,
  onBack,
  onItemClick,
  onRemove,
  onClearAll,
}: {
  items: FavoriteItem[]
  onBack: () => void
  onItemClick: (id: string) => void
  onRemove: (id: string) => void
  onClearAll: () => void
}) {
  return (
    <div className="flex flex-col gap-3 pb-4 lg:max-w-3xl lg:mx-auto lg:w-full">
      {/* 子页头 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm">返回</span>
        </button>
        <h2 className="text-base font-semibold text-gray-800">
          我的收藏
          {items.length > 0 && (
            <span className="text-xs text-gray-400 font-normal ml-1.5">({items.length})</span>
          )}
        </h2>
        {items.length > 0 ? (
          <button
            onClick={() => { if (window.confirm('确定要清空所有收藏吗？此操作不可恢复。')) onClearAll() }}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition"
          >
            <Trash2 className="size-3" />
            清空
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      {/* 空状态 */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="size-12 text-gray-200 mb-3" />
          <p className="text-sm text-gray-400 mb-1">还没有收藏的影视</p>
          <p className="text-xs text-gray-300">去发现更多精彩内容吧</p>
        </div>
      )}

      {/* 网格列表 */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {items.map(item => (
            <div key={item.id} className="group relative">
              <button
                onClick={() => onItemClick(item.id)}
                className="w-full text-left"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-1.5 text-xs font-medium text-gray-800 line-clamp-1">{item.title}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="size-3 text-yellow-500 fill-yellow-400" />
                  <span className="text-[10px] text-gray-400">{item.rating}</span>
                  <span className="text-[10px] text-gray-300 ml-auto">{item.year}</span>
                </div>
              </button>
              {/* 删除按钮 */}
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(item.id) }}
                className="absolute top-1 right-1 size-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 历史列表 ──────────────────────────────────

function HistoryContent({
  items,
  onBack,
  onItemClick,
  onRemove,
  onClearAll,
}: {
  items: HistoryItem[]
  onBack: () => void
  onItemClick: (id: string) => void
  onRemove: (id: string, episodeId?: string) => void
  onClearAll: () => void
}) {
  // 按日期分组
  const groups = groupHistoryByDate(items)

  return (
    <div className="flex flex-col gap-3 pb-4 lg:max-w-3xl lg:mx-auto lg:w-full">
      {/* 子页头 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm">返回</span>
        </button>
        <h2 className="text-base font-semibold text-gray-800">
          观看历史
          {items.length > 0 && (
            <span className="text-xs text-gray-400 font-normal ml-1.5">({items.length})</span>
          )}
        </h2>
        {items.length > 0 ? (
          <button
            onClick={() => { if (window.confirm('确定要清空所有观看历史吗？此操作不可恢复。')) onClearAll() }}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition"
          >
            <Trash2 className="size-3" />
            清空
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      {/* 空状态 */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clock className="size-12 text-gray-200 mb-3" />
          <p className="text-sm text-gray-400 mb-1">还没有观看记录</p>
          <p className="text-xs text-gray-300">去看看热门影视吧</p>
        </div>
      )}

      {/* 分组列表 */}
      {groups.map(group => (
        <div key={group.label}>
          <h3 className="text-xs font-semibold text-gray-400 mb-2 px-1">{group.label}</h3>
          <div className="flex flex-col gap-2">
            {group.items.map(item => (
              <div
                key={`${item.id}-${item.episodeId || ''}`}
                className="group flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition cursor-pointer"
                onClick={() => onItemClick(item.id)}
              >
                {/* 缩略图 */}
                <div className="w-16 sm:w-20 flex-shrink-0">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100">
                    <img src={item.poster} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</h4>
                  {item.episodeName && (
                    <p className="text-xs text-indigo-500 mt-0.5">看到 {item.episodeName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Star className="size-2.5 text-yellow-500 fill-yellow-400" />
                      {item.rating}
                    </span>
                    <span>{item.year}</span>
                    <span>{item.genres.slice(0, 2).join(' / ')}</span>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-1">{formatRelativeTime(item.watchedAt)}</p>
                </div>
                {/* 删除 */}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(item.id, item.episodeId) }}
                  className="size-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 历史分组辅助 ──

function groupHistoryByDate(items: HistoryItem[]): { label: string; items: HistoryItem[] }[] {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86400000
  const weekStart = todayStart - 7 * 86400000

  const groups: { label: string; items: HistoryItem[] }[] = []
  const today: HistoryItem[] = []
  const yesterday: HistoryItem[] = []
  const thisWeek: HistoryItem[] = []
  const earlier: HistoryItem[] = []

  for (const item of items) {
    if (item.watchedAt >= todayStart) today.push(item)
    else if (item.watchedAt >= yesterdayStart) yesterday.push(item)
    else if (item.watchedAt >= weekStart) thisWeek.push(item)
    else earlier.push(item)
  }

  if (today.length > 0) groups.push({ label: '今天', items: today })
  if (yesterday.length > 0) groups.push({ label: '昨天', items: yesterday })
  if (thisWeek.length > 0) groups.push({ label: '本周', items: thisWeek })
  if (earlier.length > 0) groups.push({ label: '更早', items: earlier })

  return groups
}
