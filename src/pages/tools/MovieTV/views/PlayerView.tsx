// ────────────────────────────────────────────────
// 影视大全 - 播放器视图
// ────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import type { MovieItem, Episode, EpisodeGroup } from '../types'

interface PlayerViewProps {
  movie: MovieItem
  /** 当前播放的集 id（电影传 undefined） */
  episodeId?: string
  onBack: () => void
  onEpisodeChange?: (epId: string) => void
}

/**
 * 根据 TMDB movie.id 和 episodeId 构建 vidsrc.to 嵌入播放地址
 * movie.id 格式：  "movie-{tmdbId}"  或  "tv-{tmdbId}"
 * episodeId 格式： "ep-{season}-{episode}"
 *
 * vidsrc.to 使用 TMDB ID 直接提供视频嵌入，支持全球绝大多数影视内容。
 * 备用线路：vidsrc.me / vidsrc.xyz / multiembed.mov
 */
// 视频源配置 - 优先使用无广告/少广告源
const VIDEO_SOURCES = {
  smashystream: {
    name: 'SmashyStream',
    build: (type: string, tmdbId: string, season?: string, episode?: string) =>
      type === 'tv'
        ? `https://player.smashy.stream/series/${tmdbId}/${season ?? '1'}/${episode ?? '1'}`
        : `https://player.smashy.stream/movie/${tmdbId}`
  },
  embedsu: {
    name: 'Embed.su',
    build: (type: string, tmdbId: string, season?: string, episode?: string) =>
      type === 'tv'
        ? `https://embed.su/embed/tv/${tmdbId}/${season ?? '1'}/${episode ?? '1'}`
        : `https://embed.su/embed/movie/${tmdbId}`
  },
  vidsrcnl: {
    name: 'VidSrc.nl',
    build: (type: string, tmdbId: string, season?: string, episode?: string) =>
      type === 'tv'
        ? `https://vidsrc.nl/embed/tv/${tmdbId}/${season ?? '1'}/${episode ?? '1'}`
        : `https://vidsrc.nl/embed/movie/${tmdbId}`
  },
  vidsrcicu: {
    name: 'VidSrc.icu',
    build: (type: string, tmdbId: string, season?: string, episode?: string) =>
      type === 'tv'
        ? `https://vidsrc.icu/embed/tv/${tmdbId}/${season ?? '1'}/${episode ?? '1'}`
        : `https://vidsrc.icu/embed/movie/${tmdbId}`
  },
  vidsrc: {
    name: 'VidSrc(备用)',
    build: (type: string, tmdbId: string, season?: string, episode?: string) =>
      type === 'tv'
        ? `https://vidsrc.to/embed/tv/${tmdbId}/${season ?? '1'}/${episode ?? '1'}`
        : `https://vidsrc.to/embed/movie/${tmdbId}`
  }
} as const

type SourceKey = keyof typeof VIDEO_SOURCES

function buildEmbedUrl(movieId: string, episodeId?: string, sourceKey: SourceKey = 'vidsrc'): string {
  const dashIdx = movieId.indexOf('-')
  const type = dashIdx !== -1 ? movieId.slice(0, dashIdx) : 'movie'
  const tmdbId = dashIdx !== -1 ? movieId.slice(dashIdx + 1) : movieId

  const source = VIDEO_SOURCES[sourceKey]

  if (type === 'tv' && episodeId) {
    const parts = episodeId.split('-')
    const season = parts[1] ?? '1'
    const episode = parts[2] ?? '1'
    return source.build(type, tmdbId, season, episode)
  }
  if (type === 'tv') {
    return source.build(type, tmdbId, '1', '1')
  }
  return source.build(type, tmdbId)
}

export function PlayerView({ movie, episodeId, onBack, onEpisodeChange }: PlayerViewProps) {
  const [showEpPanel, setShowEpPanel] = useState(false)
  const [currentSource, setCurrentSource] = useState<SourceKey>('smashystream')

  // 当前集信息
  const currentEp = findEpisode(movie.episodes, episodeId)

  // 嵌入播放地址（随 episodeId 和 source 变化而更新）
  const embedUrl = useMemo(
    () => buildEmbedUrl(movie.id, episodeId, currentSource),
    [movie.id, episodeId, currentSource]
  )

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      {/* ── 播放器区域 ── */}
      <div className="lg:flex-1 lg:flex lg:flex-col bg-black relative group">
        {/* 顶部悬浮返回按钮 */}
        <div className="absolute top-0 left-0 right-0 p-3 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <button
            onClick={onBack}
            className="pointer-events-auto size-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate drop-shadow">
              {movie.title}
              {currentEp && <span className="text-white/60 ml-2">{currentEp.name}</span>}
            </p>
          </div>
        </div>

        {/* iframe 播放器 */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy="no-referrer"
            title={movie.title}
          />
        </div>
      </div>

      {/* ── 播放器下方信息（移动端）/ 右侧面板（PC） ── */}
      <div className="flex-1 bg-gray-950 overflow-y-auto lg:w-96 lg:flex-none lg:border-l lg:border-white/5 no-scrollbar">
        {/* 当前播放信息 */}
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="text-white font-semibold text-base">
            {movie.title}
            {currentEp && <span className="text-indigo-400 text-sm ml-2">· {currentEp.name}</span>}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span>⭐ {movie.rating}</span>
            <span>·</span>
            <span>{movie.year}</span>
            <span>·</span>
            <span>{movie.genres.slice(0, 2).join(' / ')}</span>
            {movie.duration && <><span>·</span><span>{movie.duration}</span></>}
          </div>
        </div>

        {/* 播放线路选择 */}
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">📡 播放线路</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(VIDEO_SOURCES) as SourceKey[]).map(key => (
              <button
                key={key}
                onClick={() => setCurrentSource(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentSource === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {VIDEO_SOURCES[key].name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">💡 如果当前线路广告多，请尝试切换其他线路</p>
        </div>

        {/* 选集面板（内联） */}
        {movie.episodes && movie.episodes.length > 0 && (
          <div className="px-4 py-3 border-b border-white/5">
            <button
              onClick={() => setShowEpPanel(!showEpPanel)}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <h3 className="text-sm font-semibold text-gray-300">🎬 选集</h3>
              <ChevronRight className={`size-4 text-gray-500 transition-transform ${showEpPanel ? 'rotate-90' : ''}`} />
            </button>
            {showEpPanel && (
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-5 gap-2 mt-2">
                {movie.episodes.flatMap(g => g.episodes).map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => { onEpisodeChange?.(ep.id) }}
                    className={`py-2 rounded-lg text-xs font-medium transition ${
                      ep.id === episodeId
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {ep.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 简介 */}
        {movie.overview && (
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-1">简介</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{movie.overview}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 辅助函数 ─────────────────────────────────────

function findEpisode(groups?: EpisodeGroup[], epId?: string): Episode | undefined {
  if (!groups || !epId) return undefined
  for (const g of groups) {
    const ep = g.episodes.find(e => e.id === epId)
    if (ep) return ep
  }
  return undefined
}
