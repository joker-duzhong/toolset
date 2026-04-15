// ────────────────────────────────────────────────
// 西西弗斯认知引擎 - 类型定义
// ────────────────────────────────────────────────

/** 知识节点 */
export interface KnowledgeNode {
  id: string
  user_id: string
  domain: string
  concept_description: string
  mastery_score: number
  next_review_at: string | null
  fsrs_state: number
  fsrs_reps: number
  fsrs_lapses: number
  created_at: string
  updated_at: string
}

/** 目标解构出的知识节点 */
export interface GoalNode {
  concept: string
  domain: string
  reason: string
}

/** 场景视觉主题 */
export interface ScenarioTheme {
  primary_color: string
  secondary_color: string
  accent_color: string
  text_color: string
  background_image: string | null
  mood: string
}

/** 随导师响应渲染的视觉元素 */
export interface VisualElement {
  type: string
  url: string | null
  html_content: string | null
  words: string[] | null
  alt_text: string | null
}

/** 设定学习目标请求 */
export interface SetGoalRequest {
  goal: string
}

/** 设定学习目标响应 */
export interface SetGoalResponse {
  goal: string
  generated_nodes: GoalNode[]
  duplicate_warning: KnowledgeNode[] | null
}

/** 开始学习会话响应 */
export interface StartSessionResponse {
  session_id: string | null
  scenario_description: string
  scenario_data: Record<string, unknown> | null
  target_nodes: KnowledgeNode[]
  ai_initial_speech: string
  interaction_type: 'chat' | 'cloze' | 'reorder'
  component_data: Record<string, unknown> | null
  theme: ScenarioTheme | null
}

/** 用户对话请求 */
export interface ChatRequest {
  session_id: string
  user_input: string
  time_taken_ms?: number | null
}

/** 导师 Agent 的结构化响应 */
export interface TutorResponse {
  thought_process: string
  emotional_support: string
  interaction_type: 'chat' | 'cloze' | 'reorder'
  ai_speech: string
  component_data: Record<string, unknown> | null
  is_target_met: boolean
  visual_elements: VisualElement[] | null
}

/** 对话响应 */
export interface ChatResponse {
  session_id: string
  turn_number: number
  is_deadlock_triggered: boolean
  deadlock_warning: boolean
  session_completed: boolean
  tutor: TutorResponse
  mastery_snapshot: Record<string, number> | null
}

/** 挑战请求 */
export interface ChallengeRequest {
  session_id: string
  challenge_reason: string
}

/** 挑战响应 */
export interface ChallengeResponse {
  session_id: string
  original_verdict: boolean
  new_verdict: boolean
  arbiter_explanation: string
  next_action: string | null
}

/** 分页数据 */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/** 会话状态筛选 */
export type SessionStatusFilter = 'active' | 'completed' | 'abandoned'

/** 学习会话摘要 */
export interface LearningSession {
  id: string
  user_id: string
  scenario_description: string
  scenario_data: Record<string, unknown> | null
  target_node_ids: string[] | null
  status: string
  node_fail_counts: Record<string, number> | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

/** 交互日志 */
export interface InteractionLog {
  id: string
  session_id: string
  turn_number: number
  user_input: string
  ai_json_response: string | null
  time_taken_ms: number | null
  is_deadlock_triggered: boolean
  created_at: string
}

/** 会话详情 */
export interface SessionDetailResponse extends LearningSession {
  interaction_logs: InteractionLog[]
  target_nodes: KnowledgeNode[]
}

/** 聊天消息 (前端本地使用) */
export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  emotional_support?: string
  interaction_type?: 'chat' | 'cloze' | 'reorder'
  component_data?: Record<string, unknown> | null
  is_target_met?: boolean
  is_deadlock_triggered?: boolean
  deadlock_warning?: boolean
  session_completed?: boolean
  turn_number?: number
  visual_elements?: VisualElement[] | null
  mastery_snapshot?: Record<string, number> | null
  timestamp: number
}

/** 页面状态 */
export type PageState = 'loading' | 'goal-setting' | 'session-list' | 'session' | 'completed'

/** API 统一响应 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

/** 分页 API 响应 */
export interface PaginatedResponse<T> {
  code: number
  message: string
  data: PaginatedData<T> | null
}
