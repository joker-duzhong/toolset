import { Home, Clock, CalendarDays, User } from 'lucide-react'
import type { MainTab } from '../types'
import { cn } from '@/utils/cn'

interface BottomNavProps {
  active: MainTab
  onChange: (tab: MainTab) => void
}

// 对应设计图的四个图标：首页(Home)、时刻(Clock)、清单(Calendar)、我们(User)
const navItems: { key: MainTab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'moments', label: '时刻', icon: Clock },
  { key: 'lists', label: '清单', icon: CalendarDays },
  { key: 'us', label: '我们', icon: User },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* 渐变背景与毛玻璃，使其融入浅色背景 */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-rose-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]" />

      {/* 导航项 */}
      <div className="relative flex justify-around items-center h-16 max-w-lg mx-auto px-4 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key

          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 w-16 transition-all duration-300',
                isActive
                  ? 'text-[#FA705A]' // 还原设计图的珊瑚红色
                  : 'text-stone-300 hover:text-stone-400'
              )}
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                  'transition-all duration-300',
                  isActive ? 'scale-110 -translate-y-0.5' : ''
                )} 
              />
              <span className={cn(
                'text-[10px] font-bold transition-colors',
                isActive ? 'text-[#FA705A]' : 'font-medium'
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* 安全区域适配 */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white/80 backdrop-blur-xl" />
    </nav>
  )
}