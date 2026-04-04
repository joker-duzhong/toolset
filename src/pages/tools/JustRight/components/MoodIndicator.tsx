// 心情状态指示器
import { cn } from '@/utils/cn'

type MoodType = 'happy' | 'sad' | 'angry' | 'tired' | 'sick' | 'love' | 'period'

interface MoodIndicatorProps {
  mood?: MoodType
  note?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const moodConfig: Record<MoodType, { emoji: string; label: string; color: string; bg: string }> = {
  happy: { emoji: '😊', label: '开心', color: 'text-amber-600', bg: 'bg-amber-100' },
  sad: { emoji: '😢', label: '有点难过', color: 'text-blue-600', bg: 'bg-blue-100' },
  angry: { emoji: '😤', label: '生气中', color: 'text-red-600', bg: 'bg-red-100' },
  tired: { emoji: '😫', label: '好累', color: 'text-stone-600', bg: 'bg-stone-100' },
  sick: { emoji: '🤒', label: '不舒服', color: 'text-green-600', bg: 'bg-green-100' },
  love: { emoji: '🥰', label: '想你啦', color: 'text-pink-600', bg: 'bg-pink-100' },
  period: { emoji: '🩸', label: '特殊时期', color: 'text-rose-600', bg: 'bg-rose-100' },
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
}

export function MoodIndicator({ mood, note, size = 'md', showLabel = false }: MoodIndicatorProps) {
  if (!mood) return null

  const config = moodConfig[mood]

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          sizeClasses[size],
          config.bg
        )}
      >
        {config.emoji}
      </div>
      {showLabel && (
        <span className={cn('text-sm font-medium', config.color)}>
          {config.label}
        </span>
      )}
      {note && (
        <span className="text-xs text-stone-500 truncate max-w-[120px]">
          {note}
        </span>
      )}
    </div>
  )
}

// 心情选择器
interface MoodPickerProps {
  value?: MoodType
  onChange: (mood: MoodType) => void
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const moods = Object.entries(moodConfig) as [MoodType, typeof moodConfig.happy][]

  return (
    <div className="flex flex-wrap gap-2">
      {moods.map(([key, config]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'flex items-center gap-1 px-3 py-2 rounded-full transition-all duration-200',
            value === key
              ? `${config.bg} ring-2 ring-offset-1 ring-current ${config.color} scale-105`
              : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
          )}
        >
          <span>{config.emoji}</span>
          <span className="text-xs">{config.label}</span>
        </button>
      ))}
    </div>
  )
}

// 心情状态预警卡片
interface MoodAlertCardProps {
  mood?: MoodType
  note?: string
  partnerName?: string
}

export function MoodAlertCard({ mood, note, partnerName }: MoodAlertCardProps) {
  if (!mood || mood === 'happy' || mood === 'love') return null

  const config = moodConfig[mood]

  // 需要特别关注的心情
  const alerts: Record<MoodType, string> = {
    happy: '',
    love: '',
    sad: '需要抱抱',
    angry: '⚠️ 小心翼翼模式',
    tired: '需要休息',
    sick: '需要照顾',
    period: '🩸 多喝热水',
  }

  return (
    <div
      className={cn(
        'p-4 rounded-2xl border',
        config.bg,
        'border-current/20'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{config.emoji}</span>
        <div>
          <p className={cn('font-medium', config.color)}>
            {partnerName} {config.label}
          </p>
          {note && (
            <p className="text-sm text-stone-500 mt-1">{note}</p>
          )}
          {alerts[mood] && (
            <p className="text-xs text-stone-400 mt-1">{alerts[mood]}</p>
          )}
        </div>
      </div>
    </div>
  )
}
