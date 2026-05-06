// ────────────────────────────────────────────────
// JustRight - API 服务层
// ────────────────────────────────────────────────
// 所有请求统一携带 app 标识符 (app header)
// ────────────────────────────────────────────────

import { apiClient } from "@/utils/apiClient";
import type {
  TodoItem,
  Memo,
  UserManual,
  RouletteOption,
  WishlistItem,
  WishlistFulfillPayload,
  WishlistItemPayload,
  WishlistItemUpdatePayload,
  WishlistStatus,
  Anniversary,
  AnniversaryPayload,
  UpcomingAnniversary,
  CoupleState,
  HomeData,
  Couple,
  PaginatedResponse,
  UserState,
} from "../types";

const BASE = "/just-right";
export const APP_KEY = "hope_just_right";

/** 统一注入 app header */
function withAppHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set("app", APP_KEY);
  return { ...init, headers };
}

// ============ 情侣关系 API ============
export const coupleApi = {
  create: () => apiClient<Couple>(`${BASE}/couples`, withAppHeader({ method: "POST" })),

  join: (inviteCode: string) => apiClient<Couple>(`${BASE}/couples/join`, withAppHeader({ method: "POST", body: JSON.stringify({ invite_code: inviteCode }) })),

  get: () => apiClient<Couple>(`${BASE}/couples/me`, withAppHeader()),

  update: (data: { anniversary_date?: string }) =>
    apiClient<Couple>(
      `${BASE}/couples/me`,
      withAppHeader({
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ),

  leave: () => apiClient<boolean>(`${BASE}/couples/me/dissolve`, withAppHeader({ method: "POST" })),
};

// ============ 首页数据 ============
export const homeApi = {
  get: () => apiClient<HomeData>(`${BASE}/home`, withAppHeader()),
};

// ============ TODO API ============
export const todoApi = {
  list: (status?: "pending" | "completed") => apiClient<TodoItem[]>(`${BASE}/todos${status ? `?status=${status}` : ""}`, withAppHeader()),

  create: (content: string) =>
    apiClient<TodoItem>(
      `${BASE}/todos`,
      withAppHeader({
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    ),

  updateStatus: (id: string, status: "pending" | "completed") =>
    apiClient<TodoItem>(
      `${BASE}/todos/${id}`,
      withAppHeader({
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    ),

  delete: (id: string) => apiClient<void>(`${BASE}/todos/${id}`, withAppHeader({ method: "DELETE" })),
};

// ============ 备忘录 API ============
export const memoApi = {
  list: (page = 1, pageSize = 20) => apiClient<PaginatedResponse<Memo>>(`${BASE}/memos?page=${page}&page_size=${pageSize}`, withAppHeader()),

  create: (content: string, imageIds: string[] = []) =>
    apiClient<Memo>(
      `${BASE}/memos`,
      withAppHeader({
        method: "POST",
        body: JSON.stringify({ content, resource_ids: imageIds }),
      }),
    ),

  update: (id: string, data: { content?: string | null; resource_ids?: string[] | null; is_pinned?: boolean | null }) =>
    apiClient<Memo>(
      `${BASE}/memos/${id}`,
      withAppHeader({
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ),

  delete: (id: string) => apiClient<boolean>(`${BASE}/memos/${id}`, withAppHeader({ method: "DELETE" })),

  toggleLike: (id: string) => apiClient<Memo>(`${BASE}/memos/${id}/like`, withAppHeader({ method: "POST" })),

  comment: (id: string, content: string) =>
    apiClient<Memo>(
      `${BASE}/memos/${id}/comment`,
      withAppHeader({
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    ),

  togglePin: (id: string) => apiClient<Memo>(`${BASE}/memos/${id}/pin`, withAppHeader({ method: "POST" })),

  updateComment: (memoId: string, commentId: string, content: string) =>
    apiClient<Memo>(
      `${BASE}/memos/${memoId}/comments/${commentId}`,
      withAppHeader({
        method: "PUT",
        body: JSON.stringify({ content }),
      }),
    ),

  deleteComment: (memoId: string, commentId: string) =>
    apiClient<Memo>(
      `${BASE}/memos/${memoId}/comments/${commentId}`,
      withAppHeader({
        method: "DELETE",
      }),
    ),

  search: (params?: { keyword?: string; start_date?: string; end_date?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams()
    if (params?.keyword) query.set("keyword", params.keyword)
    if (params?.start_date) query.set("start_date", params.start_date)
    if (params?.end_date) query.set("end_date", params.end_date)
    if (params?.page) query.set("page", String(params.page))
    if (params?.page_size) query.set("page_size", String(params.page_size))

    return apiClient<PaginatedResponse<Memo>>(
      `${BASE}/memos/search${query.toString() ? `?${query.toString()}` : ""}`,
      withAppHeader(),
    )
  },
};


// ============ 说明书 API ============
export const manualApi = {
  get: () => apiClient<{ mine: UserManual; ta: UserManual }>(`${BASE}/manuals`, withAppHeader()),

  update: (data: Partial<UserManual>) =>
    apiClient<UserManual>(
      `${BASE}/manuals/me`,
      withAppHeader({
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ),
};

// ============ 转盘 API ============
export const rouletteApi = {
  list: (category?: "food" | "place" | "other") => apiClient<RouletteOption[]>(`${BASE}/roulette/options${category ? `?category=${category}` : ""}`, withAppHeader()),

  add: (title: string, category: "food" | "place" | "other", weight = 1, color?: string) =>
    apiClient<RouletteOption>(
      `${BASE}/roulette/options`,
      withAppHeader({
        method: "POST",
        body: JSON.stringify({ title, category, weight, color }),
      }),
    ),

  delete: (id: number) => apiClient<void>(`${BASE}/roulette/options/${id}`, withAppHeader({ method: "DELETE" })),
};

// ============ 心愿单 API ============
export const wishlistApi = {
  list: (status?: WishlistStatus) => apiClient<WishlistItem[]>(`${BASE}/wishlist${status ? `?status=${status}` : ""}`, withAppHeader()),

  add: (item: WishlistItemPayload) =>
    apiClient<WishlistItem>(
      `${BASE}/wishlist`,
      withAppHeader({
        method: "POST",
        body: JSON.stringify(item),
      }),
    ),

  update: (id: string, item: WishlistItemUpdatePayload) =>
    apiClient<WishlistItem>(
      `${BASE}/wishlist/${id}`,
      withAppHeader({
        method: "PUT",
        body: JSON.stringify(item),
      }),
    ),

  claim: (id: string) => apiClient<WishlistItem>(`${BASE}/wishlist/${id}/claim`, withAppHeader({ method: "POST" })),

  unclaim: (id: string) => apiClient<WishlistItem>(`${BASE}/wishlist/${id}/unclaim`, withAppHeader({ method: "POST" })),

  fulfill: (id: string) => apiClient<WishlistItem>(`${BASE}/wishlist/${id}/fulfill`, withAppHeader({ method: "POST" })),

  fulfillWithRecord: (id: string, payload: WishlistFulfillPayload) =>
    apiClient<WishlistItem>(
      `${BASE}/wishlist/${id}/fulfill-with-record`,
      withAppHeader({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    ),

  delete: (id: string) => apiClient<boolean>(`${BASE}/wishlist/${id}`, withAppHeader({ method: "DELETE" })),
};

// ============ 纪念日 API ============
export const anniversaryApi = {
  list: () => apiClient<Anniversary[]>(`${BASE}/anniversaries`, withAppHeader()),

  upcoming: (limit = 5) => apiClient<UpcomingAnniversary[]>(`${BASE}/anniversaries/upcoming?limit=${limit}`, withAppHeader()),

  add: (data: AnniversaryPayload) =>
    apiClient<Anniversary>(
      `${BASE}/anniversaries`,
      withAppHeader({
        method: "POST",
        body: JSON.stringify(data),
      }),
    ),

  update: (id: string, data: Partial<AnniversaryPayload>) =>
    apiClient<Anniversary>(
      `${BASE}/anniversaries/${id}`,
      withAppHeader({
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ),

  delete: (id: string) => apiClient<boolean>(`${BASE}/anniversaries/${id}`, withAppHeader({ method: "DELETE" })),
};

// ============ 情侣状态 API ============
export const coupleStateApi = {
  get: () => apiClient<CoupleState>(`${BASE}/state`, withAppHeader()),

  updateMood: (mood: UserState["mood"], moodNote?: string) =>
    apiClient<CoupleState>(
      `${BASE}/state`,
      withAppHeader({
        method: "PUT",
        body: JSON.stringify({ mood, note: moodNote }),
      }),
    ),

  updateFridgeNote: (note: string) =>
    apiClient<CoupleState>(
      `${BASE}/state/fridge`,
      withAppHeader({
        method: "PUT",
        body: JSON.stringify({ fridge_note: note }),
      }),
    ),

};
