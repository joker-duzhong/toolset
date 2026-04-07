import { Home, MessageCircle, Navigation, type LucideIcon } from 'lucide-react'

interface Tab {
  key: string
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { key: 'home', label: '首页监控', icon: Home },
  { key: 'chat', label: '唤醒语筑', icon: MessageCircle },
  { key: 'radar', label: '捡漏雷达', icon: Navigation },
]

interface BottomNavProps {
  active: string
  onChange: (key: string) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-gray-100 flex items-center justify-around px-1 py-1.5"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition ${
            active === key ? 'text-indigo-600' : 'text-gray-400'
          }`}
        >
          <Icon className="size-5" />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}