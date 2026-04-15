import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/utils/cn'
import * as api from './services/api'
import type {
  ChatMessage,
  PageState,
  LearningSession,
  TutorResponse,
  StartSessionResponse,
  ScenarioTheme,
} from './types'
import { ChatBubble } from './components/ChatBubble'
import { ClozeInput } from './components/ClozeInput'
import { ReorderCards } from './components/ReorderCards'
import { ThinkingIndicator } from './components/ThinkingIndicator'
import { ChallengeDialog } from './components/ChallengeDialog'
import { GoalSettingView } from './components/GoalSettingView'
import { SessionListView } from './components/SessionListView'

// uid() 在非安全上下文（http://IP:port）下不可用，提供 fallback
let _uid = 0
function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${++_uid}-${Math.random().toString(36).slice(2, 9)}`
}

// ────────────────────────────────────────────────
// 主页面组件
// ────────────────────────────────────────────────
export function ProjectSisyphusPage() {
  // ── 全局状态 ──
  const [pageState, setPageState] = useState<PageState>('loading')
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [nodesTotal, setNodesTotal] = useState(0)
  const [activeSessions, setActiveSessions] = useState<LearningSession[]>([])
  const [scenarioDescription, setScenarioDescription] = useState('')
  const [theme, setTheme] = useState<ScenarioTheme | null>(null)

  // ── 输入区状态 ──
  const [inputText, setInputText] = useState('')
  const [currentInteraction, setCurrentInteraction] = useState<'chat' | 'cloze' | 'reorder'>('chat')
  const [componentData, setComponentData] = useState<Record<string, unknown> | null>(null)
  const [inputDisabled, setInputDisabled] = useState(false)

  // ── 挑战弹窗 ──
  const [challengeOpen, setChallengeOpen] = useState(false)
  const [challengeLoading, setChallengeLoading] = useState(false)

  // ── 活跃耗时打点 ──
  const activeMsRef = useRef<number>(0)
  const activeSinceRef = useRef<number>(0)
  const timerRef = useRef<number>(0)
  const idleTimerRef = useRef<number>(0)

  const resetActiveTimer = useCallback(() => {
    activeMsRef.current = 0
    activeSinceRef.current = Date.now()
  }, [])

  const consumeActiveMs = useCallback(() => {
    const ms = activeMsRef.current
    activeMsRef.current = 0
    activeSinceRef.current = Date.now()
    return ms
  }, [])

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (activeSinceRef.current > 0) {
        activeMsRef.current += 200
      }
    }, 200)

    const markActive = () => { activeSinceRef.current = Date.now() }
    const markInactive = () => { activeSinceRef.current = 0 }

    const resetIdle = () => {
      if (!document.hidden) markActive()
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = window.setTimeout(markInactive, 5000)
    }

    const onVisChange = () => { document.hidden ? markInactive() : resetIdle() }

    document.addEventListener('visibilitychange', onVisChange)
    window.addEventListener('pointerdown', resetIdle)
    window.addEventListener('keydown', resetIdle)
    window.addEventListener('touchstart', resetIdle)

    return () => {
      window.clearInterval(timerRef.current)
      window.clearTimeout(idleTimerRef.current)
      document.removeEventListener('visibilitychange', onVisChange)
      window.removeEventListener('pointerdown', resetIdle)
      window.removeEventListener('keydown', resetIdle)
      window.removeEventListener('touchstart', resetIdle)
    }
  }, [])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // ── 初始化：查活跃会话 + 知识节点，决定走哪条路 ──
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        // 并行拉取活跃会话和知识节点
        const [sessionsRes, nodesRes] = await Promise.all([
          api.listActiveSessions(),
          api.listNodes(),
        ])
        if (cancelled) return

        // 存节点
        if (nodesRes.code === 200 && nodesRes.data) {
          setNodesTotal(nodesRes.data.total)
        }

        // 存活跃会话
        const sessions = sessionsRes.code === 200 && sessionsRes.data ? sessionsRes.data : []
        setActiveSessions(sessions)

        if (sessions.length > 0) {
          // 有活跃会话 → 让用户选择
          setPageState('session-list')
        } else if (nodesTotal > 0 || (nodesRes.code === 200 && nodesRes.data && nodesRes.data.total > 0)) {
          // 有节点但无活跃会话 → 创建新会话
          await createNewSession(cancelled)
        } else {
          // 纯新用户 → 设定目标
          setPageState('goal-setting')
        }
      } catch {
        if (!cancelled) setPageState('goal-setting')
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  // ── 创建新会话 ──
  const createNewSession = async (cancelled?: boolean) => {
    try {
      const sessionRes = await api.startSession()
      if (cancelled) return
      if (sessionRes.code === 200 && sessionRes.data) {
        handleSessionStarted(sessionRes.data)
      } else {
        setPageState('goal-setting')
      }
    } catch {
      if (!cancelled) setPageState('goal-setting')
    }
  }

  // ── 会话开始后的处理 ──
  const handleSessionStarted = (data: StartSessionResponse) => {
    setSessionId(data.session_id || '')
    setScenarioDescription(data.scenario_description)
    setCurrentInteraction(data.interaction_type)
    setComponentData(data.component_data)
    setTheme(data.theme || null)

    const initialMessage: ChatMessage = {
      id: uid(),
      role: 'ai',
      content: data.ai_initial_speech || `今日场景：${data.scenario_description}`,
      interaction_type: data.interaction_type,
      component_data: data.component_data,
      timestamp: Date.now(),
    }
    setMessages([initialMessage])
    resetActiveTimer()
    setPageState('session')
  }

  // ── 恢复会话 ──
  const handleResumeSession = async (session: LearningSession) => {
    setIsThinking(true)
    try {
      const detail = await api.getSessionDetail(session.id)
      if (detail.code === 200 && detail.data) {
        const d = detail.data
        setSessionId(d.id)
        setScenarioDescription(d.scenario_description)
        setTheme(null)

        // 从交互日志重建消息
        const rebuiltMessages: ChatMessage[] = []
        for (const log of d.interaction_logs) {
          // 用户消息
          rebuiltMessages.push({
            id: log.id,
            role: 'user',
            content: log.user_input,
            timestamp: new Date(log.created_at).getTime(),
          })
          // AI 回复（如果有）
          if (log.ai_json_response) {
            try {
              const tutor = JSON.parse(log.ai_json_response)
              rebuiltMessages.push({
                id: `${log.id}-ai`,
                role: 'ai',
                content: tutor.ai_speech || '',
                emotional_support: tutor.emotional_support || undefined,
                is_deadlock_triggered: log.is_deadlock_triggered,
                timestamp: new Date(log.created_at).getTime(),
              })
            } catch {
              // JSON 解析失败则跳过
            }
          }
        }

        setMessages(rebuiltMessages)
        setCurrentInteraction('chat')
        setComponentData(null)
        resetActiveTimer()
        setPageState('session')
      }
    } catch (err) {
      console.error('恢复会话失败', err)
    } finally {
      setIsThinking(false)
    }
  }

  // ── 放弃会话 ──
  const handleAbandonSession = async (session: LearningSession) => {
    try {
      await api.abandonSession(session.id)
      setActiveSessions((prev) => prev.filter((s) => s.id !== session.id))
    } catch (err) {
      console.error('放弃会话失败', err)
    }
  }

  // ── 设定目标 ──
  const handleSetGoal = async (goal: string) => {
    setIsThinking(true)
    try {
      await api.setGoal({ goal })

      // 刷新节点列表
      const nodesRes = await api.listNodes()
      if (nodesRes.code === 200 && nodesRes.data) {
        setNodesTotal(nodesRes.data.total)
      }

      // 创建新会话
      await createNewSession()
    } catch (err) {
      console.error('设定目标失败', err)
    } finally {
      setIsThinking(false)
    }
  }

  // ── 处理 AI 响应 ──
  const processTutorResponse = (tutor: TutorResponse, chatData: {
    session_id: string
    turn_number: number
    is_deadlock_triggered: boolean
    deadlock_warning: boolean
    session_completed: boolean
    mastery_snapshot: Record<string, number> | null
  }) => {
    const aiMessage: ChatMessage = {
      id: uid(),
      role: 'ai',
      content: tutor.ai_speech,
      emotional_support: tutor.emotional_support || undefined,
      interaction_type: tutor.interaction_type,
      component_data: tutor.component_data,
      is_target_met: tutor.is_target_met,
      visual_elements: tutor.visual_elements || undefined,
      is_deadlock_triggered: chatData.is_deadlock_triggered,
      deadlock_warning: chatData.deadlock_warning,
      session_completed: chatData.session_completed,
      mastery_snapshot: chatData.mastery_snapshot,
      turn_number: chatData.turn_number,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, aiMessage])
    setCurrentInteraction(tutor.interaction_type)
    setComponentData(tutor.component_data)
    resetActiveTimer()

    if (chatData.session_completed) {
      setInputDisabled(true)
      setTimeout(() => setPageState('completed'), 2000)
    }
  }

  // ── 发送消息 ──
  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if (!text || isThinking || !sessionId) return

    const timeTaken = consumeActiveMs()

    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsThinking(true)

    try {
      const res = await api.chat({
        session_id: sessionId,
        user_input: text,
        time_taken_ms: timeTaken,
      })
      if (res.code === 200 && res.data) {
        processTutorResponse(res.data.tutor, res.data)
      }
    } catch (err) {
      console.error('对话失败', err)
    } finally {
      setIsThinking(false)
    }
  }, [inputText, isThinking, sessionId])

  // ── 组件提交 ──
  const handleComponentSubmit = useCallback(async (answer: string) => {
    if (isThinking || !sessionId) return

    const timeTaken = consumeActiveMs()

    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      content: answer,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsThinking(true)

    try {
      const res = await api.chat({
        session_id: sessionId,
        user_input: answer,
        time_taken_ms: timeTaken,
      })
      if (res.code === 200 && res.data) {
        processTutorResponse(res.data.tutor, res.data)
      }
    } catch (err) {
      console.error('对话失败', err)
    } finally {
      setIsThinking(false)
    }
  }, [isThinking, sessionId])

  // ── 挑战 ──
  const handleChallenge = (_message: ChatMessage) => {
    setChallengeOpen(true)
  }

  const handleChallengeSubmit = async (reason: string) => {
    if (!sessionId) return
    setChallengeLoading(true)
    try {
      const res = await api.challenge({
        session_id: sessionId,
        challenge_reason: reason,
      })
      if (res.code === 200 && res.data) {
        const arbiterMsg: ChatMessage = {
          id: uid(),
          role: 'ai',
          content: res.data.arbiter_explanation + (res.data.next_action ? `\n\n${res.data.next_action}` : ''),
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, arbiterMsg])
      }
    } catch (err) {
      console.error('挑战失败', err)
    } finally {
      setChallengeLoading(false)
      setChallengeOpen(false)
    }
  }

  // ── 完成后：回到会话列表 ──
  const handleGoToSessionList = async () => {
    setIsThinking(true)
    try {
      const res = await api.listActiveSessions()
      if (res.code === 200 && res.data) {
        setActiveSessions(res.data)
      }
      if (activeSessions.length > 0 || (res.code === 200 && res.data && res.data.length > 0)) {
        setMessages([])
        setInputText('')
        setInputDisabled(false)
        setScenarioDescription('')
        setTheme(null)
        setPageState('session-list')
      } else {
        // 没有活跃会话了，直接创建新的
        handleStartNewFromList()
      }
    } catch {
      handleStartNewFromList()
    } finally {
      setIsThinking(false)
    }
  }

  // ── 从会话列表创建新会话 ──
  const handleStartNewFromList = async () => {
    setIsThinking(true)
    try {
      const nodesRes = await api.listNodes()
      if (nodesRes.code === 200 && nodesRes.data) {
        setNodesTotal(nodesRes.data.total)
      }

      if (nodesTotal > 0 || (nodesRes.code === 200 && nodesRes.data && nodesRes.data.total > 0)) {
        await createNewSession()
      } else {
        setPageState('goal-setting')
      }
    } catch {
      setPageState('goal-setting')
    } finally {
      setIsThinking(false)
    }
  }

  // ── 主题色变量 ──
  const themeVars = theme ? {
    '--sisyphus-primary': theme.primary_color,
    '--sisyphus-secondary': theme.secondary_color,
    '--sisyphus-accent': theme.accent_color,
    '--sisyphus-text': theme.text_color,
  } as React.CSSProperties : {}

  // ── 渲染 ──
  if (pageState === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">正在加载认知引擎...</span>
        </div>
      </div>
    )
  }

  if (pageState === 'goal-setting') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <GoalSettingView onSubmit={handleSetGoal} loading={isThinking} nodesTotal={nodesTotal} />
      </div>
    )
  }

  if (pageState === 'session-list') {
    return (
      <SessionListView
        sessions={activeSessions}
        onResume={handleResumeSession}
        onAbandon={handleAbandonSession}
        onStartNew={handleStartNewFromList}
        loading={isThinking}
      />
    )
  }

  if (pageState === 'completed') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">&#x1F3C6;</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">场景完成！</h2>
          <p className="text-sm text-gray-500 mb-6">知识已在你的大脑中扎根</p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={handleGoToSessionList}
              disabled={isThinking}
              className="px-8 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2"
            >
              {isThinking && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              继续学习
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── 主对话界面 ──
  const showTextInput = currentInteraction === 'chat'
  const showCloze = currentInteraction === 'cloze' && componentData
  const showReorder = currentInteraction === 'reorder' && componentData
  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'ai')
  const accentColor = theme?.accent_color || '#4f46e5'

  return (
    <div
      className="h-screen flex flex-col bg-gray-50"
      style={{
        ...themeVars,
        ...(theme?.background_image ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${theme.background_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}),
      }}
    >
      {/* 顶部场景描述 */}
      <div
        className="shrink-0 backdrop-blur border-b px-4 py-2.5 flex items-center justify-between"
        style={{
          backgroundColor: theme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
          borderColor: theme ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
        }}
      >
        <p className="text-xs leading-relaxed flex-1" style={{ color: theme ? theme.text_color : undefined }}>
          <span className={cn('font-medium', theme ? '' : 'text-gray-600')} style={{ color: theme ? theme.text_color : undefined }}>
            今日场景：
          </span>
          <span style={{ color: theme ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}>
            {scenarioDescription}
          </span>
        </p>
        {/* 返回会话列表 */}
        <button
          onClick={async () => {
            const res = await api.listActiveSessions()
            if (res.code === 200 && res.data) setActiveSessions(res.data)
            setMessages([])
            setInputText('')
            setInputDisabled(false)
            setScenarioDescription('')
            setTheme(null)
            setPageState('session-list')
          }}
          className="shrink-0 ml-3 text-xs text-gray-400 hover:text-gray-600 transition"
        >
          会话列表
        </button>
      </div>

      {/* 消息滚动区 */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            theme={theme}
            onChallenge={
              msg.role === 'ai' && msg.is_target_met === false && !inputDisabled
                ? handleChallenge
                : undefined
            }
          />
        ))}

        {!isThinking && !inputDisabled && showCloze && lastAiMessage?.id === messages[messages.length - 1]?.id && (
          <ClozeInput
            template={((componentData as Record<string, unknown>)?.template as string) || ''}
            onSubmit={handleComponentSubmit}
          />
        )}
        {!isThinking && !inputDisabled && showReorder && lastAiMessage?.id === messages[messages.length - 1]?.id && (
          <ReorderCards
            words={((componentData as Record<string, unknown>)?.words as string[]) || []}
            onSubmit={handleComponentSubmit}
          />
        )}

        {isThinking && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区 */}
      {showTextInput && !inputDisabled && (
        <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="输入你的回答..."
            rows={1}
            disabled={isThinking}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-sm outline-none',
              'focus:ring-2 resize-none border border-transparent',
              'max-h-28 overflow-y-auto',
              isThinking && 'opacity-50',
            )}
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={isThinking || !inputText.trim()}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white active:scale-95 transition disabled:bg-gray-200 disabled:text-gray-400"
            style={{ backgroundColor: accentColor }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 3.29a.75.75 0 0 1 .814-.106l13 6.5a.75.75 0 0 1 0 1.342l-13 6.5a.75.75 0 0 1-1.048-.85l1.988-6.076-1.988-6.076a.75.75 0 0 1 .234-.834Z" />
            </svg>
          </button>
        </div>
      )}

      {/* 死锁 / 会话完成时的提示 */}
      {inputDisabled && pageState === 'session' && (
        <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3 text-center"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <p className="text-xs text-gray-400">场景即将结束...</p>
        </div>
      )}

      {/* 挑战弹窗 */}
      <ChallengeDialog
        open={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        onSubmit={handleChallengeSubmit}
        loading={challengeLoading}
      />
    </div>
  )
}

export default ProjectSisyphusPage
