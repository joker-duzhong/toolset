export interface Task {
  id: string
  title: string
  description: string
  active: boolean
  wechatBind: boolean
}

export interface Property {
  id: string
  name: string
  priceTotal: number
  priceUnit: number
  layout: string
  area: string
  location: string
  analysis: string
  isBargain?: boolean
  discountRate?: number
}