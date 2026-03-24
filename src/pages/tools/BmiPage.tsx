import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

interface BmiResult {
  bmi: number
  level: string
  color: string
  advice: string
}

function calcBmi(weight: number, heightCm: number): BmiResult {
  const h = heightCm / 100
  const bmi = weight / (h * h)
  if (bmi < 18.5) return { bmi, level: '偏瘦', color: 'text-blue-500', advice: '建议适当增加营养摄入' }
  if (bmi < 24) return { bmi, level: '正常', color: 'text-emerald-500', advice: '继续保持健康的生活方式' }
  if (bmi < 28) return { bmi, level: '超重', color: 'text-amber-500', advice: '建议适量运动，控制饮食' }
  return { bmi, level: '肥胖', color: 'text-rose-500', advice: '建议咨询医生，制定减重计划' }
}

export function BmiPage() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState<BmiResult | null>(null)

  const handleCalc = () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!h || !w || h < 50 || h > 250 || w < 10 || w > 500) return
    setResult(calcBmi(w, h))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="BMI 计算器" subtitle="体重指数评估" />

      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">身高 (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="例：170"
              className="h-11 px-3 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">体重 (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="例：65"
              className="h-11 px-3 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <button
          onClick={handleCalc}
          disabled={!height || !weight}
          className="w-full py-3 rounded-xl bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold active:scale-95 transition"
        >
          计算 BMI
        </button>

        {result && (
          <div className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-xs text-gray-400">你的 BMI 指数</p>
            <p className={cn('text-5xl font-bold tabular-nums', result.color)}>
              {result.bmi.toFixed(1)}
            </p>
            <span
              className={cn(
                'text-sm font-semibold px-4 py-1 rounded-full',
                result.color,
                'bg-gray-50 border border-current/20',
              )}
            >
              {result.level}
            </span>
            <p className="text-xs text-gray-500 mt-1">{result.advice}</p>

            {/* 参考区间 */}
            <div className="w-full mt-3 grid grid-cols-4 gap-1 text-[10px]">
              {[
                { range: '< 18.5', label: '偏瘦', c: 'bg-blue-100 text-blue-600' },
                { range: '18.5-24', label: '正常', c: 'bg-emerald-100 text-emerald-600' },
                { range: '24-28', label: '超重', c: 'bg-amber-100 text-amber-600' },
                { range: '≥ 28', label: '肥胖', c: 'bg-rose-100 text-rose-600' },
              ].map((item) => (
                <div key={item.label} className={cn('rounded-lg p-2', item.c)}>
                  <p className="font-semibold">{item.label}</p>
                  <p className="opacity-70">{item.range}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
