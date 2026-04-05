import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { TOOLS } from '@/config/tools'
import type { ToolCategory } from '@/types/tool'

export function useToolSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { status } = useAuth()

  const query = searchParams.get('q') ?? ''
  const activeCategory = (searchParams.get('cat') ?? 'all') as ToolCategory | 'all'

  const setQuery = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set('q', value)
        } else {
          next.delete('q')
        }
        return next
      },
      { replace: true },
    )
  }

  const setActiveCategory = (value: ToolCategory | 'all') => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === 'all') {
          next.delete('cat')
        } else {
          next.set('cat', value)
        }
        return next
      },
      { replace: true },
    )
  }

  const filteredTools = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return TOOLS.filter((tool) => {
      // 过滤隐藏工具
      if (tool.hidden) return false

      // 未认证时过滤需要认证的工具
      if (tool.requiresAuth && status !== 'authenticated') return false

      // 过滤分类
      if (activeCategory !== 'all' && tool.category !== activeCategory) return false

      // 关键词搜索
      if (keyword) {
        const searchTarget = [
          tool.name,
          tool.description,
          ...(tool.tags ?? []),
        ]
          .join(' ')
          .toLowerCase()
        return searchTarget.includes(keyword)
      }

      return true
    })
  }, [query, activeCategory, status])


  return {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    filteredTools,
  }
}
