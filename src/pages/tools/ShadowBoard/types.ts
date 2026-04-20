export interface RoleScore {
  score: number;
  reason: string;
}

export interface MessageMetaData {
  turn?: number;
  scores?: Record<string, RoleScore>;
}

export interface BoardMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  is_finalized: boolean;
  created_at: string;
  meta_data?: MessageMetaData;
}

export interface BoardSession {
  id: string;
  topic: string;
  status: 'idle' | 'scoring' | 'speaking' | 'paused' | 'done' | 'error';
  current_turn: number;
  max_turns: number;
  roles_config: string[];
  created_at: string;
  updated_at?: string;
}

export interface SessionListResponse {
  sessions: BoardSession[];
}

export interface SessionMessagesResponse {
  messages: BoardMessage[];
}

export interface ChatRequest {
  text: string;
  topic?: string;
  session_id?: string;
}

export interface ChatResponse {
  session_id: string;
  status: string;
  message: string;
}
