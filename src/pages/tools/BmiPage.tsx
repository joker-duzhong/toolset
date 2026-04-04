import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'

interface BmiResult {
  bmi: number
  level: string
  color: string
  advice: string
}

function calcBmi(weight: number, heightCm: number): BmiResult {
  const h = heightCm / 100
  const bmi = weight / (h * h)
  if (bmi < 18.5) return { bmi, level: '偏瘦', color: '#2196F3', advice: '建议适当增加营养摄入' }
  if (bmi < 24) return { bmi, level: '正常', color: '#4CAF50', advice: '继续保持健康的生活方式' }
  if (bmi < 28) return { bmi, level: '超重', color: '#FF9800', advice: '建议适量运动，控制饮食' }
  return { bmi, level: '肥胖', color: '#F44336', advice: '建议咨询医生，制定减重计划' }
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <PageHeader title="BMI 计算器" subtitle="体重指数评估" />

      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <div
          className="flex flex-col gap-3 p-4"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              身高 (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="例：170"
              className="h-11 px-3 text-sm outline-none"
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px var(--color-primary)'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              体重 (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="例：65"
              className="h-11 px-3 text-sm outline-none"
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px var(--color-primary)'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        <button
          onClick={handleCalc}
          disabled={!height || !weight}
          className="w-full py-3 text-sm font-semibold active:scale-95 transition disabled:active:scale-100"
          style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: !height || !weight ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
          }}
        >
          计算 BMI
        </button>

        {result && (
          <div
            className="flex flex-col items-center gap-2 p-5 text-center"
            style={{
              backgroundColor: 'var(--color-bg-base)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              你的 BMI 指数
            </p>
            <p className="text-5xl font-bold tabular-nums" style={{ color: result.color }}>
              {result.bmi.toFixed(1)}
            </p>
            <span
              className="text-sm font-semibold px-4 py-1"
              style={{
                color: result.color,
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {result.level}
            </span>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {result.advice}
            </p>

            {/* 参考区间 */}
            <div className="w-full mt-3 grid grid-cols-4 gap-1 text-[10px]">
              {[
                { range: '< 18.5', label: '偏瘦', bg: '#E3F2FD', color: '#1976D2' },
                { range: '18.5-24', label: '正常', bg: '#E8F5E9', color: '#388E3C' },
                { range: '24-28', label: '超重', bg: '#FFF3E0', color: '#F57C00' },
                { range: '≥ 28', label: '肥胖', bg: '#FFEBEE', color: '#D32F2F' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-2"
                  style={{
                    backgroundColor: item.bg,
                    color: item.color,
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
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
