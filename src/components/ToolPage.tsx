// 工具页面通用包装组件
// 自动处理：页面标题设置、导航栏显示/隐藏
import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import { TOOLS } from '@/config/tools'
import { cn } from '@/utils/cn'

interface ToolPageProps {
  children: React.ReactNode
  /** 自定义标题，默认从工具配置获取 */
  title?: string
  /** 自定义副标题 */
  subtitle?: string
  /** 自定义类名 */
  className?: string
  /** 是否全屏模式（无导航栏、无背景） */
  fullscreen?: boolean
}

/**
 * 工具页面包装组件
 *
 * 自动功能：
 * 1. 根据路由路径匹配工具配置，设置页面标题
 * 2. 根据 hidden 属性决定是否显示导航栏
 * 3. 使用 flex 布局，内容区域 flex-1 自适应高度
 * 4. 组件卸载时恢复默认标题
 */
export function ToolPage({
  children,
  title,
  subtitle,
  className,
  fullscreen = false,
}: ToolPageProps) {
  const location = useLocation()

  // 查找当前工具配置
  const tool = useMemo(
    () => TOOLS.find((t) => t.path === location.pathname),
    [location.pathname]
  )

  // 决定是否显示导航栏
  // fullscreen 模式 或 工具配置了 hidden 则不显示
  const showHeader = !fullscreen && !tool?.hidden

  // 最终标题
  const pageTitle = title || tool?.name || ''

  // 设置页面标题
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} - Hope Toolset`
    }

    return () => {
      document.title = 'Hope Toolset'
    }
  }, [pageTitle])

  // 全屏模式：直接渲染内容，使用 h-full
  if (fullscreen) {
    return (
      <div className={cn('h-full', className)}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn('h-full flex flex-col', className)}
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      {showHeader && <PageHeader title={pageTitle} subtitle={subtitle} />}
      <main className="flex-1 min-h-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}

/**
 * 获取当前路由对应的工具配置
 */
export function useCurrentTool() {
  const location = useLocation()
  return useMemo(
    () => TOOLS.find((t) => t.path === location.pathname),
    [location.pathname]
  )
}
