import { motion } from 'framer-motion'
import { User, Bot } from 'lucide-react'

export function ChatMessage({ text, isBot }: { text: string; isBot: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 w-full items-end ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 rounded-full bg-indigo-500/30 backdrop-blur-sm flex items-center justify-center shrink-0 border border-indigo-200/50"
        >
          <Bot className="w-5 h-5 text-indigo-600" />
        </motion.div>
      )}

      <div
        className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow-md backdrop-blur-sm border ${
          isBot
            ? 'bg-white/50 text-gray-800 border-white/60 rounded-bl-none'
            : 'bg-linear-to-r from-indigo-600 to-blue-600 text-white border-white/20 rounded-br-none'
        }`}
      >
        {text}
      </div>

      {!isBot && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 rounded-full bg-blue-500/30 backdrop-blur-sm flex items-center justify-center shrink-0 border border-blue-200/50"
        >
          <User className="w-4 h-4 text-blue-600" />
        </motion.div>
      )}
    </motion.div>
  )
}