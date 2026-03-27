// ────────────────────────────────────────────────
// 影视大全 - 类型定义
// ────────────────────────────────────────────────

/** 影视分类 */
export type MovieCategory = 'movie' | 'tv' | 'anime' | 'variety' | 'documentary'

export interface CategoryTab {
  key: MovieCategory | 'all'
  label: string
  icon?: string
}

/** 影视条目 */
export interface MovieItem {
  id: string
  title: string
  originalTitle?: string
  poster: string           // 海报图片 URL
  backdrop?: string        // 背景大图 URL
  rating: number           // 评分 0-10
  year: string
  category: MovieCategory
  genres: string[]
  region?: string          // 地区
  language?: string
  duration?: string        // 片长 / 集数
  status?: string          // 更新状态：完结 / 更新至第X集
  overview?: string        // 简介
  director?: string
  cast?: string[]
  episodes?: EpisodeGroup[]
}

/** 剧集分组（用于电视剧/动漫的多季） */
export interface EpisodeGroup {
  groupName: string        // "第一季" / "正片"
  episodes: Episode[]
}

export interface Episode {
  id: string
  name: string             // "第1集" / "EP01"
  url?: string             // 播放链接
}

/** 搜索结果 */
export interface SearchResult {
  items: MovieItem[]
  total: number
  page: number
  totalPages: number
}

/** 首页板块 */
export interface HomeSection {
  id: string
  title: string
  type: 'banner' | 'horizontal' | 'grid'
  items: MovieItem[]
}

/** API 数据源配置 */
export interface DataSourceConfig {
  name: string
  baseUrl: string
  type: 'tmdb' | 'douban' | 'custom'
  apiKey?: string
}
