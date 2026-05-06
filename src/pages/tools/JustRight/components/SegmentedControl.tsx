import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface SegmentedControlOption<T extends string> {
  value: T
  label: string
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
    <div className="relative flex p-1.5 bg-[#FFF0E6] rounded-full">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex-1 flex items-center justify-center py-2.5 rounded-full transition-colors z-10 outline-none',
              isActive ? 'text-white font-semibold' : 'text-[#BFAEA3] font-medium'
            )}
          >
            <span className="text-[15px]">{option.label}</span>

            {isActive && (
              <motion.div
                layoutId="segmented-control-bg"
                className="absolute inset-0 bg-[#FFAB84] rounded-full -z-10 shadow-sm"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}