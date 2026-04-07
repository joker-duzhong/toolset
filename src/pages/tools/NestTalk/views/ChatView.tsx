import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatMessage } from '../components/ChatMessage'
import { sendChatMessage } from '../services/api'

export function ChatView({ onNavigate }: { onNavigate: () => void }) {
  const [messages, setMessages] = useState([{ id: 1, text: '你好！我是语筑房产助手。请告诉我你想在哪个区域买房？预算多少？', isBot: true }])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [readyToTask, setReadyToTask] = useState(false)
  const [requirementsSummary, setRequirementsSummary] = useState('')
  
  const bottomRef = useRef<HTMLDivElement>(null)
  
  // store session_id
  const sessionIdRef = useRef<string | null>(null)

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
    <div className="flex flex-col h-full bg-gray-50 pb-20 overflow-y-auto w-full max-w-md mx-auto relative px-4 pt-10">
      <div className="flex-1 space-y-4">
        <AnimatePresence>
          {messages.map(msg => (
            <ChatMessage key={msg.id} text={msg.text} isBot={msg.isBot} />
          ))}
          {readyToTask && requirementsSummary && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm flex flex-col items-center gap-3">
               <div className="text-sm font-medium text-indigo-900">需求已收集完整，即将创建监控：</div>
               <div className="text-xs text-indigo-700 bg-white/60 p-2 rounded-lg">{requirementsSummary}</div>
               <button onClick={onNavigate} className="px-4 py-2 w-full rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm active:scale-95 transition">确认并开启监控</button>
             </motion.div>
          )}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 p-3 bg-white border border-gray-100 rounded-2xl max-w-[60%] self-start rounded-tl-none text-sm text-gray-500 shadow-sm">
               正在思考...
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-8" />
      </div>

      <div className="fixed bottom-14 inset-x-0 p-3 bg-white/95 backdrop-blur border-t border-gray-100 z-10 flex gap-2 w-full max-w-md mx-auto">
        <input 
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="输入您的买房需求..."
          className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition disabled:opacity-50"
          type="text"
          disabled={loading}
        />
        <button 
          onClick={handleSend}
          disabled={!inputVal.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition disabled:opacity-50 disabled:bg-gray-400 flex items-center justify-center shrink-0"
        >
          发送
        </button>
      </div>
    </div>
  )
}