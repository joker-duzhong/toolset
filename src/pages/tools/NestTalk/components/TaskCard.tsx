import { motion } from 'framer-motion'
import type { Task } from '../types'

export function TaskCard({ task, onBindWechat }: { task: Task; onBindWechat?: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -4 }}
      className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg p-6 w-full text-left hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
          <input type="checkbox" className="sr-only peer" defaultChecked={task.active} />
          <div className="w-11 h-6 bg-gray-200/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 shadow-inner"></div>
        </label>
      </div>

      <div className="flex justify-between items-center text-xs border-t border-white/40 pt-4 mt-4">
        {task.wechatBind ? (
           <span className="flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm text-emerald-700 px-3 py-1.5 rounded-full font-semibold border border-emerald-200/50">
             <span className="text-sm">✓</span> 微信推送已开启
           </span>
        ) : (
           <button onClick={onBindWechat} className="text-indigo-600 font-semibold hover:text-indigo-700 transition flex items-center gap-1">
             <span>+</span> 绑定微信推送
           </button>
        )}
      </div>
    </motion.div>
  )
}