// ────────────────────────────────────────────────
// 影视大全 - TMDB API 服务
// ────────────────────────────────────────────────
// 使用 TMDB (The Movie Database) 作为数据源
// 官方文档: https://developer.themoviedb.org/docs
// 免费注册获取 API Key: https://www.themoviedb.org/settings/api
//
// TMDB 优势:
// 1. 免费、数据质量极高、海报/剧照齐全
// 2. 支持中文搜索和中文元数据
// 3. 包含电影、电视剧、动漫、综艺、纪录片
// 4. 社区维护，数据更新及时
// ────────────────────────────────────────────────

import type {
  MovieItem,
  MovieCategory,
  HomeSection,
  SearchResult,
  EpisodeGroup,
} from '../types'

// ── TMDB 配置 ──────────────────────────────────
// 🔑 在此处填入你的 TMDB API Key（v3 auth）
// 注册地址: https://www.themoviedb.org/signup
// API Key 申请: https://www.themoviedb.org/settings/api
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZmU4YmE2ZGU2OWQyYmExZTQ2N2RhNGFjZWFkNGVjMyIsIm5iZiI6MTc3NDU3OTE4Ny4wOTcsInN1YiI6IjY5YzVlZGYzZjg1YTU5MzgwZjg5YmRhMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vmwOfpmHMAaUHdFZumRA7Up4NAafRMBVaPo2y7YWOco";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '0fe8ba6de69d2ba1e467da4acead4ec3'
const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p'

/** 海报尺寸 */
export const posterUrl = (path: string | null, size = 'w500') =>
  path ? `${IMG_BASE}/${size}${path}` : '/placeholder-poster.svg'

/** 背景图尺寸 */
export const backdropUrl = (path: string | null, size = 'w1280') =>
  path ? `${IMG_BASE}/${size}${path}` : ''

// ── 通用请求 ────────────────────────────────────
// 优先使用 Bearer Token（v4，更安全），回退到 API Key（v3）
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    language: 'zh-CN',
    ...params,
  })

  // 如果没有 Token 则把 api_key 放进 query（v3 兼容）
  if (!TMDB_TOKEN) {
    searchParams.set('api_key', TMDB_API_KEY)
  }

  const headers: HeadersInit = TMDB_TOKEN
    ? { Authorization: `Bearer ${TMDB_TOKEN}`, 'Content-Type': 'application/json' }
    : {}

  const res = await fetch(`${TMDB_BASE}${endpoint}?${searchParams}`, { headers })
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`)
  return res.json()
}

// ── TMDB 类型 ───────────────────────────────────
interface TmdbMovie {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  genre_ids?: number[]
  overview: string
  media_type?: string
  origin_country?: string[]
}

interface TmdbListResponse {
  results: TmdbMovie[]
  total_results: number
  page: number
  total_pages: number
}

interface TmdbMovieDetail {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  genres: { id: number; name: string }[]
  overview: string
  runtime?: number
  number_of_seasons?: number
  number_of_episodes?: number
  status: string
  production_countries?: { iso_3166_1: string; name: string }[]
  original_language: string
  credits?: {
    cast: { name: string; character: string; profile_path: string | null }[]
    crew: { name: string; job: string }[]
  }
  seasons?: { season_number: number; name: string; episode_count: number }[]
}

interface TmdbSeasonDetail {
  episodes: {
    episode_number: number
    name: string
    id: number
  }[]
}

// ── Genre 映射 ──────────────────────────────────
const GENRE_MAP: Record<number, string> = {
  28: '动作', 12: '冒险', 16: '动画', 35: '喜剧', 80: '犯罪',
  99: '纪录', 18: '剧情', 10751: '家庭', 14: '奇幻', 36: '历史',
  27: '恐怖', 10402: '音乐', 9648: '悬疑', 10749: '爱情',
  878: '科幻', 10770: 'TV电影', 53: '惊悚', 10752: '战争', 37: '西部',
  10759: '动作冒险', 10762: '儿童', 10763: '新闻', 10764: '真人秀',
  10765: '科幻奇幻', 10766: '肥皂剧', 10767: '脱口秀', 10768: '战争政治',
}

function genreName(id: number): string {
  return GENRE_MAP[id] || '其他'
}

// ── 数据转换 ─────────────────────────────────────
function toMovieItem(m: TmdbMovie, forceCategory?: MovieCategory): MovieItem {
  const isTV = m.media_type === 'tv' || !!m.first_air_date
  const cat = forceCategory ?? (
    m.genre_ids?.includes(16) ? 'anime' :
    m.genre_ids?.includes(99) ? 'documentary' :
    isTV ? 'tv' : 'movie'
  )
  return {
    id: `${isTV ? 'tv' : 'movie'}-${m.id}`,
    title: m.title || m.name || '未知',
    originalTitle: m.original_title || m.original_name,
    poster: posterUrl(m.poster_path),
    backdrop: backdropUrl(m.backdrop_path),
    rating: Math.round(m.vote_average * 10) / 10,
    year: (m.release_date || m.first_air_date || '').slice(0, 4),
    category: cat,
    genres: (m.genre_ids || []).map(genreName),
    overview: m.overview,
  }
}

// ── 公开 API ────────────────────────────────────

/** 获取首页数据（多板块） */
export async function fetchHomeSections(): Promise<HomeSection[]> {
  const [trending, nowPlaying, topRated, popular, tvPopular, animePopular] = await Promise.all([
    tmdbFetch<TmdbListResponse>('/trending/all/week'),
    tmdbFetch<TmdbListResponse>('/movie/now_playing', { region: 'CN' }),
    tmdbFetch<TmdbListResponse>('/movie/top_rated'),
    tmdbFetch<TmdbListResponse>('/movie/popular'),
    tmdbFetch<TmdbListResponse>('/tv/popular'),
    tmdbFetch<TmdbListResponse>('/discover/tv', { with_genres: '16', sort_by: 'popularity.desc' }),
  ])

  return [
    { id: 'trending', title: '🔥 本周热门', type: 'banner', items: trending.results.slice(0, 6).map(m => toMovieItem(m)) },
    { id: 'now-playing', title: '🎬 正在热映', type: 'horizontal', items: nowPlaying.results.slice(0, 12).map(m => toMovieItem(m, 'movie')) },
    { id: 'top-rated', title: '⭐ 高分佳作', type: 'horizontal', items: topRated.results.slice(0, 12).map(m => toMovieItem(m, 'movie')) },
    { id: 'popular-movie', title: '🍿 热门电影', type: 'grid', items: popular.results.slice(0, 12).map(m => toMovieItem(m, 'movie')) },
    { id: 'popular-tv', title: '📺 热门电视剧', type: 'horizontal', items: tvPopular.results.slice(0, 12).map(m => toMovieItem(m, 'tv')) },
    { id: 'anime', title: '🎌 热门动漫', type: 'horizontal', items: animePopular.results.slice(0, 12).map(m => toMovieItem(m, 'anime')) },
  ]
}

/** 搜索影视 */
export async function searchMovies(query: string, page = 1): Promise<SearchResult> {
  if (!query.trim()) return { items: [], total: 0, page: 1, totalPages: 0 }

  const data = await tmdbFetch<TmdbListResponse>('/search/multi', {
    query,
    page: String(page),
    include_adult: 'false',
  })
  return {
    items: data.results
      .filter(m => m.media_type !== 'person')
      .map(m => toMovieItem(m)),
    total: data.total_results,
    page: data.page,
    totalPages: data.total_pages,
  }
}

/** 按分类获取列表 */
export async function fetchByCategory(cat: MovieCategory, page = 1): Promise<SearchResult> {
  let endpoint: string
  const params: Record<string, string> = { page: String(page) }

  switch (cat) {
    case 'movie':
      endpoint = '/movie/popular'
      break
    case 'tv':
      endpoint = '/tv/popular'
      break
    case 'anime':
      endpoint = '/discover/tv'
      params.with_genres = '16'
      params.sort_by = 'popularity.desc'
      break
    case 'variety':
      endpoint = '/discover/tv'
      params.with_genres = '10764'
      params.sort_by = 'popularity.desc'
      break
    case 'documentary':
      endpoint = '/discover/movie'
      params.with_genres = '99'
      params.sort_by = 'popularity.desc'
      break
    default:
      endpoint = '/trending/all/week'
  }

  const data = await tmdbFetch<TmdbListResponse>(endpoint, params)
  return {
    items: data.results.map(m => toMovieItem(m, cat)),
    total: data.total_results,
    page: data.page,
    totalPages: data.total_pages,
  }
}

/** 获取影视详情 */
export async function fetchMovieDetail(id: string): Promise<MovieItem | null> {
  const [type, tmdbId] = id.split('-')
  const isTV = type === 'tv'
  const endpoint = isTV ? `/tv/${tmdbId}` : `/movie/${tmdbId}`

  const detail = await tmdbFetch<TmdbMovieDetail>(endpoint, {
    append_to_response: 'credits',
  })

  const director = detail.credits?.crew.find(c => c.job === 'Director')?.name
  const cast = detail.credits?.cast.slice(0, 10).map(c => c.name)

  let episodes: EpisodeGroup[] | undefined
  if (isTV && detail.seasons) {
    // 获取每季的剧集信息
    const seasonDetails = await Promise.all(
      detail.seasons
        .filter(s => s.season_number > 0)
        .slice(0, 5) // 限制最多获取5季
        .map(s =>
          tmdbFetch<TmdbSeasonDetail>(`/tv/${tmdbId}/season/${s.season_number}`)
            .then(sd => ({
              groupName: s.name,
              episodes: sd.episodes.map(ep => ({
                id: `ep-${s.season_number}-${ep.episode_number}`,
                name: `第${ep.episode_number}集`,
              })),
            }))
            .catch(() => null)
        )
    )
    episodes = seasonDetails.filter((s): s is EpisodeGroup => s !== null)
  }

  return {
    id,
    title: detail.title || detail.name || '未知',
    originalTitle: detail.original_title || detail.original_name,
    poster: posterUrl(detail.poster_path),
    backdrop: backdropUrl(detail.backdrop_path),
    rating: Math.round(detail.vote_average * 10) / 10,
    year: (detail.release_date || detail.first_air_date || '').slice(0, 4),
    category: isTV ? 'tv' : 'movie',
    genres: detail.genres.map(g => g.name),
    region: detail.production_countries?.[0]?.name,
    language: detail.original_language,
    duration: isTV
      ? `共${detail.number_of_episodes || '?'}集`
      : detail.runtime ? `${detail.runtime}分钟` : undefined,
    status: detail.status === 'Ended' ? '已完结' : detail.status === 'Returning Series' ? '连载中' : undefined,
    overview: detail.overview,
    director,
    cast,
    episodes,
  }
}
