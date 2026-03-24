import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

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
    { label: '周岁', value: `${result.years} 岁`, color: 'bg-indigo-50 text-indigo-700' },
    { label: '月数', value: `${result.months} 月`, color: 'bg-violet-50 text-violet-700' },
    { label: '天数', value: `${result.days} 天`, color: 'bg-blue-50 text-blue-700' },
    { label: '累计天数', value: `${result.totalDays.toLocaleString()} 天`, color: 'bg-sky-50 text-sky-700' },
    { label: '下次生日', value: result.daysToNext === 0 ? '🎉 今天！' : `还有 ${result.daysToNext} 天`, color: 'bg-pink-50 text-pink-700' },
    { label: '下次生日日期', value: result.nextBirthday, color: 'bg-rose-50 text-rose-700' },
    { label: '星座', value: result.zodiac, color: 'bg-amber-50 text-amber-700' },
    { label: '生肖', value: result.chineseZodiac, color: 'bg-emerald-50 text-emerald-700' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="年龄计算器" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <label className="text-xs font-medium text-gray-500">出生日期</label>
          <input type="date" value={birthday} onChange={e => { setBirthday(e.target.value); setResult(null) }}
            max={new Date().toISOString().split('T')[0]}
            className="h-11 px-3 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>

        <button onClick={handleCalc} disabled={!birthday}
          className="w-full py-3 rounded-xl bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold active:scale-95 transition">
          计算
        </button>

        {result && (
          <div className="grid grid-cols-2 gap-3">
            {cards.map(card => (
              <div key={card.label} className={cn('flex flex-col gap-0.5 p-3.5 rounded-2xl', card.color)}>
                <p className="text-xs opacity-70">{card.label}</p>
                <p className="text-lg font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
