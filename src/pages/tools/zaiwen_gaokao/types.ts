import React from 'react';

export type LucideIcon = React.ForwardRefExoticComponent<any & React.RefAttributes<SVGSVGElement>>;

// --- Common Types ---
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// --- Treehole Types ---
export type PostType = 'emo' | 'help';

export interface AiReply {
  id: string;
  content: string;
  is_ai_reply: boolean;
  persona_id: string | null;
  created_at: string;
}

export interface TreeholePost {
  id: string;
  persona_id: string;
  content: string;
  type: PostType;
  hug_count: number;
  has_ai_reply: boolean;
  created_at: string;
  author: {
    nickname: string;
    avatar_url: string;
    status_emoji: string;
  };
  ai_reply?: AiReply | null;
}

export interface CreateTreeholePostRequest {
  content: string;
  type: PostType;
}

// --- Board (Red/Green Board) Types ---
export interface BoardPost {
  id: string;
  school_name: string;
  major_name: string;
  content: string;
  vote_count: number;
  red_count: number;
  green_count: number;
  ai_summary?: string | null;
  has_ai_summary: boolean;
  created_at: string;
}

export interface BoardVote {
  id: string;
  post_id: string;
  option: 'red' | 'green';
  comment?: string;
  persona_id: string;
  created_at: string;
}

export interface BoardDetailRead extends BoardPost {
  votes: BoardVote[];
}

export interface CreateBoardPostRequest {
  school_name: string;
  major_name: string;
  content: string;
}

export interface BoardVoteRequest {
  post_id: string;
  option: 'red' | 'green';
  comment?: string;
}

export interface ProfileMeData {
  persona: Persona;
  received_hugs: number;
  sent_hugs: number;
}

export interface UpdateProfileRequest {
  nickname?: string;
  avatar_url?: string;
  status_emoji?: string;
  ai_collection_enabled?: boolean;
  burn_after_reading_hours?: number;
}

// --- Rooms Types ---
export interface Room {
  id: string;
  title: string;
  description: string;
  member_count: number;
  max_members: number;
  status: string;
  created_at: string;
}

export interface CreateRoomRequest {
  title: string;
  description?: string;
}

// --- Profile & Persona Types ---
export interface Persona {
  id: string;
  nickname: string;
  avatar_url: string;
  status_emoji: string;
  ai_collection_enabled: boolean;
  burn_after_reading_hours: number;
}

export interface UpdateProfileRequest {
  nickname?: string;
  avatar_url?: string;
  status_emoji?: string;
  ai_collection_enabled?: boolean;
  burn_after_reading_hours?: number;
}

export interface ProfileMeData {
  persona: Persona;
  received_hugs: number;
  sent_hugs: number;
}

export interface UpdateProfileRequest {
  nickname?: string;
  avatar_url?: string;
  status_emoji?: string;
  ai_collection_enabled?: boolean;
  burn_after_reading_hours?: number;
}

// --- UI Types ---
export type GkTabKey = 'treehole' | 'board' | 'rooms' | 'user';

export interface GkTab {
  key: GkTabKey;
  label: string;
  icon: string | LucideIcon;
}
