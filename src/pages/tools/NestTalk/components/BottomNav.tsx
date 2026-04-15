import { Home, Navigation, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface Tab {
  key: string
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { key: 'home', label: '首页监控', icon: Home },
  { key: 'radar', label: '捡漏雷达', icon: Navigation },
]

interface BottomNavProps {
  active: string
  onChange: (key: string) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const activeIndex = TABS.findIndex(t => t.key === active)

  return (
    <nav
      className="sticky bottom-0 z-20 bg-white/40 backdrop-blur-xl border-t border-white/60 flex items-center justify-around px-2 py-2 shadow-lg"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ key, label, icon: Icon }, idx) => (
        <motion.button
          key={key}
          onClick={() => onChange(key)}
          initial={false}
          animate={{
            x: activeIndex === idx ? 0 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition ${
            active === key
              ? 'text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <motion.div
            animate={{
              x: active === key ? 4 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            <Icon className="size-5" />
          </motion.div>
          <motion.span
            animate={{
              x: active === key ? 4 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="text-[10px] font-semibold"
          >
            {label}
          </motion.span>
        </motion.button>
      ))}
    </nav>
  )
}