// 农历转换工具函数
import { Lunar, Solar } from 'lunar-javascript'

/**
 * 将阳历日期转换为农历显示文本
 * @param solarDate 阳历日期字符串 (YYYY-MM-DD)
 * @returns 农历显示文本，如 "腊月初八"
 */
export function convertToLunar(solarDate: string): string {
  try {
    const [year, month, day] = solarDate.split('-').map(Number)
    const solar = Solar.fromYmd(year, month, day)
    const lunar = solar.getLunar()
    return `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
  } catch (error) {
    console.error('农历转换失败:', error)
    return solarDate
  }
}

/**
 * 将农历日期转换为阳历日期字符串
 * @param lunarYear 农历年份
 * @param lunarMonth 农历月份
 * @param lunarDay 农历日期
 * @returns 阳历日期字符串 (YYYY-MM-DD)
 */
export function convertToSolar(lunarYear: number, lunarMonth: number, lunarDay: number): string {
  try {
    const lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay)
    const solar = lunar.getSolar()
    return `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`
  } catch (error) {
    console.error('阳历转换失败:', error)
    return ''
  }
}

/**
 * 获取下一个农历日期对应的阳历日期
 * @param lunarMonth 农历月份
 * @param lunarDay 农历日期
 * @returns 阳历日期字符串 (YYYY-MM-DD)
 */
export function getNextLunarDate(lunarMonth: number, lunarDay: number): string {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()

    // 尝试今年的农历日期
    let lunar = Lunar.fromYmd(currentYear, lunarMonth, lunarDay)
    let solar = lunar.getSolar()
    let targetDate = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay())

    // 如果今年的日期已过，使用明年的
    if (targetDate < now) {
      lunar = Lunar.fromYmd(currentYear + 1, lunarMonth, lunarDay)
      solar = lunar.getSolar()
    }

    return `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`
  } catch (error) {
    console.error('获取下一个农历日期失败:', error)
    return ''
  }
}

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1 (YYYY-MM-DD)
 * @param date2 日期2 (YYYY-MM-DD)
 * @returns 天数差（正数表示 date2 在 date1 之后）
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = d2.getTime() - d1.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 格式化日期显示
 * @param date 日期字符串 (YYYY-MM-DD)
 * @param isLunar 是否为农历
 * @returns 格式化后的日期显示
 */
export function formatDate(date: string, isLunar: boolean): string {
  if (isLunar) {
    return convertToLunar(date)
  }

  const [year, month, day] = date.split('-')
  return `${year}年${month}月${day}日`
}
