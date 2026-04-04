// 转盘组件
import { useState, useRef } from 'react'
import { Play, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { RouletteOption } from '../types'

// 类别配置
const categoryConfig = {
  food: { label: '吃什么', emoji: '🍽️', color: 'from-amber-400 to-orange-500' },
  place: { label: '去哪里', emoji: '📍', color: 'from-sky-400 to-blue-500' },
  other: { label: '玩什么', emoji: '🎮', color: 'from-violet-400 to-purple-500' },
}

// 转盘颜色
const wheelColors = [
  '#fcd34d', '#f97316', '#fb923c', '#fbbf24',
  '#f59e0b', '#ea580c', '#facc15', '#eab308',
]

interface RouletteWheelProps {
  options: RouletteOption[]
  category: 'food' | 'place' | 'other'
  onSpinEnd?: (option: RouletteOption) => void
}

export function RouletteWheel({ options, category, onSpinEnd }: RouletteWheelProps) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<RouletteOption | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  const config = categoryConfig[category]
  const validOptions = options.filter((o) => o.category === category)

  const spin = () => {
    if (spinning || validOptions.length < 2) return

    setSpinning(true)
    setResult(null)

    // 随机选择结果
    const randomIndex = Math.floor(Math.random() * validOptions.length)
    const selectedOption = validOptions[randomIndex]

    // 计算旋转角度
    const segmentAngle = 360 / validOptions.length
    const targetAngle = 360 - (randomIndex * segmentAngle) - segmentAngle / 2
    const extraRotations = 5 + Math.floor(Math.random() * 3) // 5-7 圈
    const totalRotation = extraRotations * 360 + targetAngle

    setRotation((prev) => prev + totalRotation)

    // 动画结束后显示结果
    setTimeout(() => {
      setSpinning(false)
      setResult(selectedOption)
      onSpinEnd?.(selectedOption)
    }, 4000)
  }

  return (
    <div className="flex flex-col items-center">
      {/* 指针 */}
      <div className="relative z-10 -mb-4">
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-stone-800" />
      </div>

      {/* 转盘 */}
      <div
        ref={wheelRef}
        className="relative w-64 h-64 rounded-full shadow-xl overflow-hidden border-4 border-stone-200"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
        }}
      >
        {validOptions.length === 0 ? (
          <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">
            添加选项开始抽取
          </div>
        ) : (
          validOptions.map((option, index) => {
            const angle = (360 / validOptions.length) * index
            const skew = 90 - (360 / validOptions.length)

            return (
              <div
                key={option.id}
                className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-center"
                style={{
                  backgroundColor: option.color || wheelColors[index % wheelColors.length],
                  transform: `rotate(${angle}deg) skewY(${skew}deg)`,
                }}
              >
                <span
                  className="absolute text-xs font-medium text-stone-800 truncate max-w-[60px]"
                  style={{
                    transform: `skewY(-${skew}deg) rotate(${(360 / validOptions.length) / 2}deg)`,
                    left: '60%',
                    top: '40%',
                  }}
                >
                  {option.title}
                </span>
              </div>
            )
          })
        )}

        {/* 中心按钮 */}
        <button
          onClick={spin}
          disabled={spinning || validOptions.length < 2}
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all',
            spinning
              ? 'bg-stone-300 text-stone-500'
              : `bg-gradient-to-br ${config.color} text-white hover:scale-110 active:scale-95`
          )}
        >
          <Play size={24} fill="currentColor" />
        </button>
      </div>

      {/* 结果展示 */}
      {result && (
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 text-center animate-bounce-in">
          <p className="text-sm text-stone-500 mb-1">今天就</p>
          <p className="text-xl font-bold text-amber-600">{result.title}</p>
          <p className="text-2xl mt-2">🎉</p>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

// 转盘选项管理
interface RouletteOptionsProps {
  options: RouletteOption[]
  category: 'food' | 'place' | 'other'
  onAdd: (title: string) => void
  onDelete: (id: number) => void
}

export function RouletteOptions({ options, category, onAdd, onDelete }: RouletteOptionsProps) {
  const [newOption, setNewOption] = useState('')

  const filteredOptions = options.filter((o) => o.category === category)
  const config = categoryConfig[category]

  const handleAdd = () => {
    if (newOption.trim()) {
      onAdd(newOption.trim())
      setNewOption('')
    }
  }

  return (
    <div className="mt-6">
      <h4 className="font-medium text-stone-700 mb-3">
        {config.emoji} {config.label}选项
      </h4>

      {/* 添加输入 */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加新选项..."
          className="flex-1 px-4 py-2 bg-white rounded-xl border border-stone-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={!newOption.trim()}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 选项列表 */}
      <div className="flex flex-wrap gap-2">
        {filteredOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-stone-200 text-sm text-stone-600 group"
          >
            {option.title}
            <button
              onClick={() => onDelete(option.id)}
              className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// 类别选择器
interface CategorySelectorProps {
  value: 'food' | 'place' | 'other'
  onChange: (category: 'food' | 'place' | 'other') => void
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl">
      {(Object.entries(categoryConfig) as [keyof typeof categoryConfig, typeof categoryConfig.food][]).map(
        ([key, config]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-sm transition-all',
              value === key
                ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                : 'text-stone-500 hover:bg-white'
            )}
          >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </button>
        )
      )}
    </div>
  )
}
