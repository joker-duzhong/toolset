import type { Task, Property } from '../types'
import { apiClient } from '@/utils/apiClient'

const BASE = '/nest-talk'
const APP_KEY = 'hope_nest_talk'

function withAppHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers)
  headers.set('app', APP_KEY)
  return { ...init, headers }
}

export async function getMockTasks(): Promise<Task[]> {
  try {
    const res = await apiClient<any>(`${BASE}/user/preferences`, withAppHeader())
    
    if (res.code === 200 && res.data) {
      const p = res.data
      if (p.preferred_regions || p.budget_max) {
        return [{
          id: p.id.toString(),
          title: `${p.preferred_regions || '任意区域'} · ${p.budget_max ? p.budget_max + '万内' : '不限预算'}`,
          description: `户型: ${p.rooms_min || 0}-${p.rooms_max || '不限'}室 | 面积: ${p.area_min || 0}-${p.area_max || '不限'}㎡`,
          active: true,
          wechatBind: !!p.notify_endpoint
        }]
      }
    }
  } catch (err) {
    // ignore
  }

  // Backup mock logic if no preferences configured
  return []
}

export async function getPropertyRadar(): Promise<Property[]> {
  try {
    const res = await apiClient<any>(`${BASE}/houses/bargain/list?page=1&page_size=20`, withAppHeader())
    if (res.code === 200 && res.data?.items) {
      return res.data.items.map((item: any) => ({
        id: item.house_id || item.id.toString(),
        name: item.title,
        priceTotal: item.total_price,
        priceUnit: item.unit_price,
        layout: item.layout || `${item.rooms}室`,
        area: `${item.area}㎡`,
        location: item.region_name || '未知区域',
        analysis: item.bargain_reason || '暂无详细分析',
        isBargain: item.is_bargain,
        discountRate: item.discount_rate
      }))
    }
  } catch (err) {
    // ignore
  }
  return []
}

export async function sendChatMessage(message: string, sessionId: string | null) {
  const body = { message, ...(sessionId ? { session_id: sessionId } : {}) }
  return apiClient<any>(`${BASE}/chat`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(body)
  }))
}
