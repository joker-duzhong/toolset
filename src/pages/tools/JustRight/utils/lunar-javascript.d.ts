// 类型声明文件 for lunar-javascript
declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar
    getLunar(): Lunar
    getYear(): number
    getMonth(): number
    getDay(): number
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar
    getSolar(): Solar
    getMonthInChinese(): string
    getDayInChinese(): string
    getYear(): number
    getMonth(): number
    getDay(): number
  }
}
