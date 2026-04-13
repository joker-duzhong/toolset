import { apiClient } from '@/utils/apiClient';
import type { 
  ProfileMeData, 
  Persona, 
  UpdateProfileRequest,
  TreeholePost,
  BoardPost,
  BoardDetailRead
} from '../types';

const BASE = '/zaiwen-gaokao'; 
const APP_KEY = 'hope_zaiwen_gaokao';

/** 统一注入 app header */
function withAppHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set('app', APP_KEY);
  return { ...init, headers };
}

/** 2.0 社区个人中心 (Profile & Persona) */

/** [GET] /profile/me - 个人面板数据 */
export async function getProfileMe() {
  return apiClient<ProfileMeData>(`${BASE}/profile/me`, withAppHeader());
}

/** [POST] /profile/randomize - 随机马甲生成 */
export async function randomizeProfile() {
  return apiClient<Persona>(`${BASE}/profile/randomize`, withAppHeader({
    method: 'POST',
  }));
}

/** [PUT] /profile/settings - 隐私与信息更新 */
export async function updateProfileSettings(data: UpdateProfileRequest) {
  return apiClient<Persona>(`${BASE}/profile/settings`, withAppHeader({
    method: 'PUT',
    body: JSON.stringify(data),
  }));
}

/** [DELETE] /profile/wipe - 抹除痕迹 (斩断前缘) */
export async function wipeProfile() {
  return apiClient<null>(`${BASE}/profile/wipe`, withAppHeader({
    method: 'DELETE',
  }));
}

/** [GET] /profile/my-treeholes - 获取我的树洞记录 */
export async function getMyTreeholes(limit = 20, offset = 0) {
  return apiClient<TreeholePost[]>(`${BASE}/profile/my-treeholes?limit=${limit}&offset=${offset}`, withAppHeader());
}

/** [GET] /profile/my-audits - 获取我的质询（投票）记录 */
export async function getMyAudits(limit = 20, offset = 0) {
  return apiClient<any[]>(`${BASE}/profile/my-audits?limit=${limit}&offset=${offset}`, withAppHeader());
}

// ============ Treehole API ============
export const treeholeApi = {
  /** [POST] /treehole/post - 树洞发帖 */
  createPost: async (data: { content: string, type: 'emo' | 'help' }) => 
    apiClient<TreeholePost>(`${BASE}/treehole/post`, withAppHeader({
      method: 'POST',
      body: JSON.stringify(data),
    })),
  
  /** [GET] /treehole/feed - 树洞信息流 */
  getFeed: async (cursor?: string) => 
    apiClient<TreeholePost[]>(`${BASE}/treehole/feed${cursor ? `?cursor=${cursor}` : ''}`, withAppHeader()),

  /** [POST] /treehole/hug/{post_id} - 树洞抱抱 */
  hugPost: async (postId: string) => 
    apiClient<null>(`${BASE}/treehole/hug/${postId}`, withAppHeader({ method: 'POST' })),

  /** [DELETE] /treehole/post/{post_id} - 销毁单条树洞 */
  deletePost: async (postId: string) =>
    apiClient<null>(`${BASE}/treehole/post/${postId}`, withAppHeader({ method: 'DELETE' })),
};

// ============ Board API ============
export const boardApi = {
  /** [POST] /board/post - 红黑榜发帖 */
  createPost: async (data: { school_name: string, major_name: string, content: string }) => 
    apiClient<BoardPost>(`${BASE}/board/post`, withAppHeader({
      method: 'POST',
      body: JSON.stringify(data),
    })),
  
  /** [GET] /board/feed - 红黑榜信息流/搜索 */
  getList: async (params: { school_name?: string, sort_by?: 'new'|'hot', limit?: number, offset?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.school_name) query.append('school_name', params.school_name);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    return apiClient<BoardPost[]>(`${BASE}/board/feed?${query.toString()}`, withAppHeader());
  },

  /** [GET] /board/{post_id} - 红黑榜详情页 */
  getDetail: async (postId: string) =>
    apiClient<BoardDetailRead>(`${BASE}/board/${postId}`, withAppHeader()),

  /** [POST] /board/vote - 红黑榜投票 */
  vote: async (data: { post_id: string, option: 'red' | 'green', comment?: string }) => 
    apiClient<null>(`${BASE}/board/vote`, withAppHeader({
      method: 'POST',
      body: JSON.stringify(data),
    })),
};

// ============ Rooms API ============
export const roomsApi = {
  /** [POST] /rooms - 创建战友房间 */
  create: async (data: any) => 
    apiClient<any>(`${BASE}/rooms`, withAppHeader({
      method: 'POST',
      body: JSON.stringify(data),
    })),
  
  /** [POST] /rooms/join/{room_id} - 加入战友房间 */
  join: async (roomId: string) => 
    apiClient<any>(`${BASE}/rooms/join/${roomId}`, withAppHeader({ method: 'POST' })),

  /** [GET] /rooms - 获取房间列表 */
  getList: async () => 
    apiClient<any[]>(`${BASE}/rooms`, withAppHeader()),
};
