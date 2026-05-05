// 底部导航栏
import { Home, Camera, ListChecks, Users } from 'lucide-react'
import type { MainTab } from '../types'
import { cn } from '@/utils/cn'

interface BottomNavProps {
  active: MainTab
  onChange: (tab: MainTab) => void
}

const navItems: { key: MainTab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'moments', label: '时刻', icon: Camera },
  { key: 'lists', label: '清单', icon: ListChecks },
  { key: 'us', label: '我们', icon: Users },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-1">
      {/* 毛玻璃背景 */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-amber-100/50" />

      {/* 导航项 */}
      <div className="relative flex justify-around items-center h-16 max-w-lg mx-auto px-6 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key

          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 transition-all duration-300',
                isActive
                  ? 'text-amber-600'
                  : 'text-stone-400 hover:text-stone-600'
              )}
            >
              <Icon size={20} className={cn(
                'transition-transform duration-300',
                isActive && 'scale-110'
              )} />
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                isActive && 'text-amber-600'
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* 安全区域 */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white/90" />
    </nav>
  )
}
