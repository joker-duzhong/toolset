import { cn } from '@/utils/cn'
import type { ChatMessage, ScenarioTheme } from '../types'

interface ChatBubbleProps {
  message: ChatMessage
  theme?: ScenarioTheme | null
  onChallenge?: (message: ChatMessage) => void
}

export function ChatBubble({ message, theme, onChallenge }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const showChallenge = !isUser && onChallenge && message.is_target_met === false

  const accentColor = theme?.accent_color || '#4f46e5'

  return (
    <div className={cn('flex gap-2 px-4 py-1.5', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        {/* 情绪安抚（淡色区分） */}
        {message.emotional_support && (
          <div className="text-xs text-gray-400 italic px-1">
            {message.emotional_support}
          </div>
        )}

        {/* 死锁警告 */}
        {message.deadlock_warning && (
          <div className="text-xs text-amber-500 font-medium px-1">
            ⚠️ 你似乎遇到困难了，再试一次吧
          </div>
        )}

        {/* 主气泡 */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
            isUser
              ? 'text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100',
          )}
          style={isUser ? { backgroundColor: accentColor } : undefined}
        >
          {message.content}
        </div>

        {/* 视觉元素 */}
        {message.visual_elements && message.visual_elements.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            {message.visual_elements.map((el, i) => {
              if (el.type === 'image' && el.url) {
                return (
                  <img
                    key={i}
                    src={el.url}
                    alt={el.alt_text || ''}
                    className="rounded-xl max-w-full max-h-48 object-cover"
                  />
                )
              }
              if (el.html_content) {
                return (
                  <div
                    key={i}
                    className="rounded-xl bg-gray-50 p-2 text-xs"
                    dangerouslySetInnerHTML={{ __html: el.html_content }}
                  />
                )
              }
              return null
            })}
          </div>
        )}

        {/* 掌握度快照 */}
        {message.mastery_snapshot && Object.keys(message.mastery_snapshot).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {Object.entries(message.mastery_snapshot).map(([nodeId, score]) => (
              <span
                key={nodeId}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-medium',
                  score >= 0.8
                    ? 'bg-green-100 text-green-700'
                    : score >= 0.5
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700',
                )}
              >
                掌握度 {Math.round(score * 100)}%
              </span>
            ))}
          </div>
        )}

        {/* 挑战按钮 */}
        {showChallenge && (
          <button
            onClick={() => onChallenge(message)}
            className="text-[10px] text-gray-400 hover:text-amber-500 transition mt-0.5 px-1 flex items-center gap-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v3.5c0 .199.079.39.22.53l2 2a.75.75 0 1 0 1.06-1.06L8.75 7.94V4.75Z" clipRule="evenodd" />
            </svg>
            我不服
          </button>
        )}
      </div>
    </div>
  )
}
