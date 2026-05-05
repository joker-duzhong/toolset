// 分段控制器组件
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface SegmentedControlOption<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="relative flex p-1.5 bg-[#F1EDE4] rounded-[2rem]">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.75rem] transition-colors z-10',
              isActive ? 'text-stone-700' : 'text-stone-400'
            )}
          >
            {option.icon}
            <span className="font-medium text-sm">{option.label}</span>

            {isActive && (
              <motion.div
                layoutId="segmented-control-bg"
                className="absolute inset-0 bg-white rounded-[1.75rem] shadow-sm -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
