// ────────────────────────────────────────────────
// 影视大全 - 剧集选择器组件
// ────────────────────────────────────────────────

import { useState } from 'react'
import type { EpisodeGroup } from '../types'

interface EpisodeSelectorProps {
  episodes: EpisodeGroup[]
  onSelect: (episodeId: string) => void
  selectedId?: string
}

export function EpisodeSelector({ episodes, onSelect, selectedId }: EpisodeSelectorProps) {
  const [activeGroup, setActiveGroup] = useState(0)

  if (episodes.length === 0) return null

  const group = episodes[activeGroup]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 季/组选择 */}
      {episodes.length > 1 && (
        <div className="flex gap-1 p-3 border-b border-gray-100 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {episodes.map((g, i) => (
            <button
              key={i}
              onClick={() => setActiveGroup(i)}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition ${
                i === activeGroup
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g.groupName}
            </button>
          ))}
        </div>
      )}

      {/* 集列表 */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {group.groupName} · 共{group.episodes.length}集
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2">
          {group.episodes.map(ep => (
            <button
              key={ep.id}
              onClick={() => onSelect(ep.id)}
              className={`py-2 rounded-lg text-xs font-medium transition ${
                ep.id === selectedId
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {ep.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
