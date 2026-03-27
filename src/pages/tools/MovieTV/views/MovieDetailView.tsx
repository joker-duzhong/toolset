// ────────────────────────────────────────────────
// 影视大全 - 影视详情视图
// ────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { ArrowLeft, Star, Play, Heart, Share2, Clock, Globe, Film, Users } from 'lucide-react'
import { EpisodeSelector } from '../components/EpisodeSelector'
import { LoadingSpinner } from '../components/LoadingState'
import { fetchMovieDetail } from '../services/api'
import type { MovieItem } from '../types'

interface MovieDetailViewProps {
  movieId: string
  onBack: () => void
  onPlay: (movie: MovieItem, episodeId?: string) => void
  isFavorited?: boolean
  onToggleFavorite?: (movie: MovieItem) => void
}

export function MovieDetailView({ movieId, onBack, onPlay, isFavorited = false, onToggleFavorite }: MovieDetailViewProps) {
  const [movie, setMovie] = useState<MovieItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEp, setSelectedEp] = useState<string>()

  useEffect(() => {
    setLoading(true)
    fetchMovieDetail(movieId)
      .then(setMovie)
      .finally(() => setLoading(false))
  }, [movieId])

  if (loading) return <LoadingSpinner text="加载详情中..." />
  if (!movie) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-gray-400 mb-3">未找到该影视内容</p>
      <button onClick={onBack} className="text-indigo-600 text-sm font-medium">返回</button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-0">
      {/* 顶部背景 + 返回 */}
      <div className="relative h-56 sm:h-72 lg:h-80 xl:h-96 bg-gray-900 flex-shrink-0">
        {movie.backdrop && (
          <img src={movie.backdrop} alt="" className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-3 left-3 lg:top-5 lg:left-5 size-9 lg:size-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition z-10"
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>

      {/* 信息区域 */}
      <div className="relative -mt-20 lg:-mt-28 px-4 pb-6 flex-1 overflow-y-auto lg:px-0">
        <div className="lg:max-w-5xl xl:max-w-6xl lg:mx-auto lg:px-8">
          {/* PC 端：海报+基本信息+操作按钮 横排；移动端：保持竖排 */}
          <div className="flex gap-4 lg:gap-8 mb-4">
            {/* 海报 */}
            <div className="w-28 sm:w-32 lg:w-48 xl:w-56 flex-shrink-0">
              <div className="aspect-[2/3] rounded-xl lg:rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-gray-200">
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* 基本信息 */}
            <div className="flex-1 pt-4 lg:pt-6 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-1 lg:mb-2 line-clamp-2">{movie.title}</h1>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-xs lg:text-sm text-gray-400 mb-2 truncate">{movie.originalTitle}</p>
              )}

              <div className="flex items-center gap-2 mb-2 lg:mb-3">
                <span className="flex items-center gap-1 text-yellow-500 font-bold lg:text-lg">
                  <Star className="size-4 lg:size-5 fill-yellow-400" />
                  {movie.rating}
                </span>
                <span className="text-xs lg:text-sm text-gray-400">/ 10</span>
              </div>

              <div className="flex flex-wrap gap-1.5 lg:gap-2 mb-3 lg:mb-4">
                {movie.genres.map(g => (
                  <span key={g} className="px-2 py-0.5 lg:px-3 lg:py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs lg:text-sm font-medium">{g}</span>
                ))}
              </div>

              {/* 元信息 */}
              <div className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:gap-4 text-xs lg:text-sm text-gray-500">
                {movie.year && (
                  <span className="flex items-center gap-1.5"><Clock className="size-3 lg:size-4" />{movie.year}年</span>
                )}
                {movie.region && (
                  <span className="flex items-center gap-1.5"><Globe className="size-3 lg:size-4" />{movie.region}</span>
                )}
                {movie.duration && (
                  <span className="flex items-center gap-1.5"><Film className="size-3 lg:size-4" />{movie.duration}</span>
                )}
                {movie.status && (
                  <span className="flex items-center gap-1.5">
                    <span className={`size-1.5 lg:size-2 rounded-full ${movie.status === '已完结' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    {movie.status}
                  </span>
                )}
              </div>

              {/* PC 端：操作按钮放在信息区域内 */}
              <div className="hidden lg:flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const firstEpId = movie.episodes?.[0]?.episodes?.[0]?.id
                    onPlay(movie, selectedEp || firstEpId)
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white text-base font-semibold hover:bg-indigo-500 active:scale-95 transition"
                >
                  <Play className="size-5 fill-white" />
                  立即播放
                </button>
                <button
                  onClick={() => onToggleFavorite?.(movie)}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border text-base font-medium transition active:scale-95 ${
                    isFavorited ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`size-5 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
                  {isFavorited ? '已收藏' : '收藏'}
                </button>
                <button className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition active:scale-95">
                  <Share2 className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 移动端：操作按钮 */}
          <div className="flex gap-2 mb-4 lg:hidden">
          <button
            onClick={() => {
              // 电视剧/动漫默认播放第一集，电影直接播放
              const firstEpId = movie.episodes?.[0]?.episodes?.[0]?.id
              onPlay(movie, selectedEp || firstEpId)
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 active:scale-95 transition"
          >
            <Play className="size-4 fill-white" />
            立即播放
          </button>
          <button
            onClick={() => onToggleFavorite?.(movie)}
            className={`flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition active:scale-95 ${
              isFavorited ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className={`size-4 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
            {isFavorited ? '已收藏' : '收藏'}
          </button>
          <button className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition active:scale-95">
            <Share2 className="size-4" />
          </button>
        </div>

        {/* 简介 */}
        {movie.overview && (
          <div className="mb-4 lg:mb-6">
            <h2 className="text-sm lg:text-base font-semibold text-gray-800 mb-2">📖 剧情简介</h2>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed">{movie.overview}</p>
          </div>
        )}

        {/* PC 端双栏：左边导演/演员，右边选集 */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* 导演/演员 */}
          {(movie.director || movie.cast?.length) ? (
            <div className="mb-4 lg:mb-0 p-3 lg:p-4 bg-white rounded-xl lg:rounded-2xl border border-gray-100">
              {movie.director && (
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs lg:text-sm text-gray-400 flex-shrink-0 w-10">导演</span>
                  <span className="text-xs lg:text-sm text-gray-700 font-medium">{movie.director}</span>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="size-3 lg:size-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs lg:text-sm text-gray-700">{movie.cast.join(' / ')}</span>
                </div>
              )}
            </div>
          ) : <div />}

          {/* 剧集选择 */}
          {movie.episodes && movie.episodes.length > 0 && (
            <div className="mb-4 lg:mb-0">
              <h2 className="text-sm lg:text-base font-semibold text-gray-800 mb-2">🎬 选集</h2>
              <EpisodeSelector
              episodes={movie.episodes}
              onSelect={(epId) => {
                setSelectedEp(epId)
                onPlay(movie, epId)
              }}
              selectedId={selectedEp}
            />
          </div>
        )}
        </div>
      </div>
      </div>
    </div>
  )
}
