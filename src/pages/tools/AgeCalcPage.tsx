import { useState } from 'react'

interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  nextBirthday: string
  daysToNext: number
  zodiac: string
  chineseZodiac: string
}

const ZODIAC = [
  { name: '摩羯座', end: [1, 19] }, { name: '水瓶座', end: [2, 18] },
  { name: '双鱼座', end: [3, 20] }, { name: '白羊座', end: [4, 19] },
  { name: '金牛座', end: [5, 20] }, { name: '双子座', end: [6, 20] },
  { name: '巨蟹座', end: [7, 22] }, { name: '狮子座', end: [8, 22] },
  { name: '处女座', end: [9, 22] }, { name: '天秤座', end: [10, 22] },
  { name: '天蝎座', end: [11, 21] }, { name: '射手座', end: [12, 31] },
]
const CHINESE_ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

function getZodiac(month: number, day: number) {
  for (const z of ZODIAC) {
    if (month < z.end[0] || (month === z.end[0] && day <= z.end[1])) return z.name
  }
  return '摩羯座'
}

function calcAge(birthday: string): AgeResult | null {
  const birth = new Date(birthday)
  if (isNaN(birth.getTime())) return null
  const now = new Date()
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86400000)

  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()
  if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate() }
  if (months < 0) { years--; months += 12 }

  const nextYear = now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate())
    ? now.getFullYear() + 1 : now.getFullYear()
  const next = new Date(nextYear, birth.getMonth(), birth.getDate())
  const daysToNext = Math.ceil((next.getTime() - now.getTime()) / 86400000)
  const nextBirthday = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`

  const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate())
  const chineseZodiac = CHINESE_ZODIAC[(birth.getFullYear() - 4) % 12]

  return { years, months, days, totalDays, nextBirthday, daysToNext, zodiac, chineseZodiac }
}

export function AgeCalcPage() {
  const [birthday, setBirthday] = useState('')
  const [result, setResult] = useState<AgeResult | null>(null)

  const handleCalc = () => setResult(calcAge(birthday))

  const cards = result ? [
    { label: '周岁', value: `${result.years} 岁`, bg: '#e6f4ff', color: '#0d99ff' },
    { label: '月数', value: `${result.months} 月`, bg: '#f0f9ff', color: '#0284c7' },
    { label: '天数', value: `${result.days} 天`, bg: '#fff7ed', color: '#ea580c' },
    { label: '累计天数', value: `${result.totalDays.toLocaleString()} 天`, bg: '#faf5ff', color: '#9333ea' },
    { label: '下次生日', value: result.daysToNext === 0 ? '🎉 今天！' : `还有 ${result.daysToNext} 天`, bg: '#fdf2f8', color: '#db2777' },
    { label: '下次生日日期', value: result.nextBirthday, bg: '#fef2f2', color: '#dc2626' },
    { label: '星座', value: result.zodiac, bg: '#fefce8', color: '#ca8a04' },
    { label: '生肖', value: result.chineseZodiac, bg: '#f0fdf4', color: '#16a34a' },
  ] : []

  return (
    <main className="h-full overflow-auto px-4 py-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div
          className="flex flex-col gap-1 p-4"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            出生日期
          </label>
          <input
            type="date"
            value={birthday}
            onChange={e => { setBirthday(e.target.value); setResult(null) }}
            max={new Date().toISOString().split('T')[0]}
            className="h-11 px-3 text-sm outline-none"
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        <button
          onClick={handleCalc}
          disabled={!birthday}
          className="w-full py-3 text-sm font-semibold active:scale-95 transition disabled:active:scale-100"
          style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: !birthday ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
          }}
        >
          计算
        </button>

        {result && (
          <div className="grid grid-cols-2 gap-3">
            {cards.map(card => (
              <div
                key={card.label}
                className="flex flex-col gap-0.5 p-3.5"
                style={{
                  backgroundColor: card.bg,
                  borderRadius: 'var(--radius-lg)',
                  color: card.color,
                }}
              >
                <p className="text-xs opacity-70">{card.label}</p>
                <p className="text-lg font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        )}
    </main>
  )
}
