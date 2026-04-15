import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatMessage } from './ChatMessage'
import { sendChatMessage } from '../services/api'
import { X } from 'lucide-react'
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

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMsg[]>(() => loadMessages() || [WELCOME_MSG])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [readyToTask, setReadyToTask] = useState(false)
  const [requirementsSummary, setRequirementsSummary] = useState('')
  const [displayedMessages, setDisplayedMessages] = useState<ChatMsg[]>([])

  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string | null>(loadSessionId())

  // Initialize displayed messages when modal opens
  useEffect(() => {
    if (isOpen) {
      setDisplayedMessages([])
      // Stagger the initial messages
      messages.forEach((msg, idx) => {
        setTimeout(() => {
          setDisplayedMessages(prev => [...prev, msg])
        }, idx * 300)
      })
    }
  }, [isOpen])

  // persist messages whenever they change
  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  const handleClose = () => {
    onClose()
  }

  const handleSend = async () => {
    if (!inputVal.trim() || loading) return
    const msg = inputVal.trim()
    setInputVal('')

    const userMsg = { id: Date.now(), text: msg, isBot: false }
    setMessages(prev => [...prev, userMsg])
    setDisplayedMessages(prev => [...prev, userMsg])

    setLoading(true)
    try {
      const res = await sendChatMessage(msg, sessionIdRef.current)

      if (res.code === 200 && res.data) {
        const d = res.data
        if (d.session_id) {
          sessionIdRef.current = d.session_id
          saveSessionId(d.session_id)
        }

        const botMsg = { id: Date.now() + 1, text: d.message || '明白，正在继续分析。', isBot: true }
        setMessages(prev => [...prev, botMsg])

        // Stagger the bot message appearance
        setTimeout(() => {
          setDisplayedMessages(prev => [...prev, botMsg])
        }, 300)

        if (d.response_type === 'results' && d.requirements) {
          const req = d.requirements
          setRequirementsSummary(`${req.regions?.join('、') || '任意区域'} · ${req.budget_max ? req.budget_max + '万内' : '不限预算'}`)
          setReadyToTask(true)
        }
      } else {
        const errMsg = { id: Date.now() + 1, text: res.message || '网络连接异常，请稍后再试。', isBot: true }
        setMessages(prev => [...prev, errMsg])
        setTimeout(() => {
          setDisplayedMessages(prev => [...prev, errMsg])
        }, 300)
      }
    } catch (err) {
      const errMsg = { id: Date.now() + 1, text: '服务不可用，请检查网络。', isBot: true }
      setMessages(prev => [...prev, errMsg])
      setTimeout(() => {
        setDisplayedMessages(prev => [...prev, errMsg])
      }, 300)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayedMessages])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col h-3/4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-t-3xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/60">
              <h2 className="text-lg font-bold text-gray-900">唤醒语筑</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="p-2 hover:bg-white/40 rounded-full transition"
              >
                <X className="size-5 text-gray-600" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {displayedMessages.map(msg => (
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
                      onClick={handleClose}
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
              <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input */}
            <div className="p-4 bg-white/40 backdrop-blur-xl border-t border-white/60 flex gap-3">
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
