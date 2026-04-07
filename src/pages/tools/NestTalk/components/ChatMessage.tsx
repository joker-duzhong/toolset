import { motion } from 'framer-motion'
import { User, Bot } from 'lucide-react'

export function ChatMessage({ text, isBot }: { text: string; isBot: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex gap-3 w-full items-end ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-indigo-600" />
        </div>
      )}
      
      <div 
        className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow-sm ${
          isBot 
            ? 'bg-white text-gray-800 border-gray-100 border rounded-bl-sm' 
            : 'bg-indigo-600 text-white rounded-br-sm'
        }`}
      >
        {text}
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-blue-600" />
        </div>
      )}
    </motion.div>
  )
}