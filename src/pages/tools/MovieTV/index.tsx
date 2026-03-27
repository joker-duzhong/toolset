// ────────────────────────────────────────────────
// 影视大全 - 主入口页面
// ────────────────────────────────────────────────
// 采用内部 tab 导航 + 详情页堆叠的方式
// 所有代码都在 MovieTV/ 文件夹内自包含
// ────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { BottomNav, type TabKey } from './components/BottomNav'
import { SideNav } from './components/SideNav'
import { MovieHomeView } from './views/MovieHomeView'
import { MovieSearchView } from './views/MovieSearchView'
import { CategoryView } from './views/CategoryView'
import { MineView } from './views/MineView'
import { MovieDetailView } from './views/MovieDetailView'
import { PlayerView } from './views/PlayerView'
import { useMovieStorage } from './hooks/useStorage'
import type { MovieItem } from './types'

interface PlayerState {
  movie: MovieItem
  episodeId?: string
}

export function MovieTVPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [player, setPlayer] = useState<PlayerState | null>(null)

  // 收藏 & 历史
  const {
    favorites, history,
    toggleFavorite, checkFavorite,
    addToHistory,
    removeFromFavorites, removeFromHistory,
    clearAllFavorites, clearAllHistory,
    getStorageSize,
  } = useMovieStorage()

  // 用 ref 保存 player，避免 handleEpisodeChange 依赖 player 状态
  const playerRef = useRef<PlayerState | null>(null)
  playerRef.current = player

  const handleItemClick = useCallback((item: MovieItem) => {
    setDetailId(item.id)
  }, [])

  const handleItemClickById = useCallback((id: string) => {
    setDetailId(id)
  }, [])

  const handleBack = useCallback(() => {
    setDetailId(null)
  }, [])

  const handleNavigateSearch = useCallback(() => {
    setActiveTab('search')
  }, [])

  const handlePlay = useCallback((movie: MovieItem, episodeId?: string) => {
    // 记录观看历史
    const epName = movie.episodes?.flatMap(g => g.episodes).find(e => e.id === episodeId)?.name
    addToHistory(movie, episodeId, epName)
    setPlayer({ movie, episodeId })
  }, [addToHistory])

  const handlePlayerBack = useCallback(() => {
    setPlayer(null)
  }, [])

  const handleEpisodeChange = useCallback((epId: string) => {
    const cur = playerRef.current
    if (cur) {
      const epName = cur.movie.episodes?.flatMap(g => g.episodes).find(e => e.id === epId)?.name
      addToHistory(cur.movie, epId, epName)
    }
    setPlayer(prev => prev ? { ...prev, episodeId: epId } : null)
  }, [addToHistory])

  // 如果在播放器页
  if (player) {
    return (
      <PlayerView
        movie={player.movie}
        episodeId={player.episodeId}
        onBack={handlePlayerBack}
        onEpisodeChange={handleEpisodeChange}
      />
    )
  }

  // 如果在详情页
  if (detailId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MovieDetailView
          movieId={detailId}
          onBack={handleBack}
          onPlay={handlePlay}
          isFavorited={checkFavorite(detailId)}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    )
  }

  // Tab 页面标题
  const tabTitles: Record<TabKey, string> = {
    home: '影视大全',
    category: '分类浏览',
    search: '搜索',
    mine: '我的',
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* 顶部 Header - 移动端显示 */}
      <div className="lg:hidden">
        <PageHeader title={tabTitles[activeTab]} showBack={true} />
      </div>

      {/* PC 端：顶部导航栏 */}
      <div className="hidden lg:block">
        <PageHeader
          title="影视大全"
          showBack={true}
          rightSlot={
            <SideNav active={activeTab} onChange={setActiveTab} layout="horizontal" />
          }
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 主体内容 */}
        <main className="flex-1 px-4 py-3 overflow-y-auto lg:px-0">
          <div className="lg:max-w-6xl lg:mx-auto lg:px-8 xl:max-w-7xl">
            {activeTab === 'home' && (
              <MovieHomeView onItemClick={handleItemClick} onNavigateSearch={handleNavigateSearch} />
            )}
            {activeTab === 'category' && (
              <CategoryView onItemClick={handleItemClick} />
            )}
            {activeTab === 'search' && (
              <MovieSearchView onItemClick={handleItemClick} />
            )}
            {activeTab === 'mine' && (
              <MineView
                favorites={favorites}
                history={history}
                onItemClick={handleItemClickById}
                onRemoveFavorite={removeFromFavorites}
                onRemoveHistory={removeFromHistory}
                onClearFavorites={clearAllFavorites}
                onClearHistory={clearAllHistory}
                storageSize={getStorageSize()}
              />
            )}
          </div>
        </main>
      </div>

      {/* 移动端底部导航 */}
      <div className="lg:hidden">
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}
