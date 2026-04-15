import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatMessage } from '../components/ChatMessage'
import { sendChatMessage } from '../services/api'
import { PlusCircle } from 'lucide-react'
import type { ChatMsg } from '../types'

const STORAGE_KEY_SESSION = 'nesttalk_session_id'
const STORAGE_KEY_MESSAGES = 'nesttalk_messages'

const WELCOME_MSG = { id: 1, text: '你好！我是语筑房产助手。请告诉我你想在哪个区域买房？预算多少？', isBot: true }

function loadSessionId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY_SESSION) } catch { return null }
}

function saveSessionId(id: string | null) {
  try { id ? localStorage.setItem(STORAGE_KEY_SESSION, id) : localStorage.removeItem(STORAGE_KEY_SESSION) } catch { /* ignore */ }
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveMessages(msgs: any[]) {
  try { localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgs)) } catch { /* ignore */ }
}

export function ChatView({ onNavigate }: { onNavigate: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>(() => loadMessages() || [WELCOME_MSG])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [readyToTask, setReadyToTask] = useState(false)
  const [requirementsSummary, setRequirementsSummary] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)

  // store session_id
  const sessionIdRef = useRef<string | null>(loadSessionId())

  // persist messages whenever they change
  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  const createNewSession = useCallback(() => {
    sessionIdRef.current = null
    saveSessionId(null)
    setMessages([WELCOME_MSG])
    saveMessages([WELCOME_MSG])
    setReadyToTask(false)
    setRequirementsSummary('')
    setInputVal('')
  }, [])

  const handleSend = async () => {
    if (!inputVal.trim() || loading) return
    const msg = inputVal.trim()
    setInputVal('')
    setMessages(prev => [...prev, { id: Date.now(), text: msg, isBot: false }])
    
    setLoading(true)
    try {
      const res = await sendChatMessage(msg, sessionIdRef.current)
      
      if (res.code === 200 && res.data) {
        const d = res.data
        if (d.session_id) {
           sessionIdRef.current = d.session_id
           saveSessionId(d.session_id)
        }
        
        setMessages(prev => [...prev, { id: Date.now() + 1, text: d.message || '明白，正在继续分析。', isBot: true }])
        
        if (d.response_type === 'results' && d.requirements) {
           const req = d.requirements
           setRequirementsSummary(`${req.regions?.join('、') || '任意区域'} · ${req.budget_max ? req.budget_max + '万内' : '不限预算'}`)
           setReadyToTask(true)
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: res.message || '网络连接异常，请稍后再试。', isBot: true }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: '服务不可用，请检查网络。', isBot: true }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24 overflow-y-auto w-full max-w-md mx-auto relative px-4 pt-6">
      <div className="sticky top-0 z-20 flex justify-end pb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={createNewSession}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 text-xs text-gray-700 shadow-md active:scale-95 transition hover:bg-white/60"
        >
          <PlusCircle className="size-4" />
          新对话
        </motion.button>
      </div>
      <div className="flex-1 space-y-4">
        <AnimatePresence>
          {messages.map(msg => (
            <ChatMessage key={msg.id} text={msg.text} isBot={msg.isBot} />
          ))}
          {readyToTask && requirementsSummary && (
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="mt-4 p-5 bg-indigo-500/20 backdrop-blur-xl rounded-3xl border border-indigo-200/50 shadow-lg flex flex-col items-center gap-3"
             >
               <div className="text-sm font-semibold text-indigo-900">需求已收集完整，即将创建监控：</div>
               <div className="text-xs text-indigo-800 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/40">{requirementsSummary}</div>
               <button
                 onClick={onNavigate}
                 className="px-4 py-3 w-full rounded-2xl bg-linear-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold shadow-lg active:scale-95 transition hover:shadow-xl"
               >
                 确认并开启监控
               </button>
             </motion.div>
          )}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 p-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl max-w-[70%] self-start text-sm text-gray-600 shadow-md"
            >
               <span className="inline-flex gap-1">
                 <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                 <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                 <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
               </span>
               正在思考...
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-8" />
      </div>

      <div className="fixed bottom-14 inset-x-0 p-4 bg-white/40 backdrop-blur-xl border-t border-white/60 z-10 flex gap-3 w-full max-w-md mx-auto">
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="输入您的买房需求..."
          className="flex-1 px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition disabled:opacity-50 border border-white/40"
          type="text"
          disabled={loading}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!inputVal.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold active:scale-95 transition disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center shrink-0 shadow-lg hover:shadow-xl"
        >
          发送
        </motion.button>
      </div>
    </div>
  )
}