import { motion } from 'framer-motion'
import type { Task } from '../types'

export function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 w-full text-left"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{task.title}</h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked={task.active} />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
        </label>
      </div>
      <div className="text-sm text-gray-500 mb-4">{task.description}</div>
      
      <div className="flex justify-between items-center text-xs border-t border-gray-50 pt-3">
        {task.wechatBind ? (
           <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md bg-opacity-70 font-medium">
             ✓ 微信推送已开启
           </span>
        ) : (
           <button className="text-indigo-500 font-medium underline-offset-2 hover:underline">
             + 绑定微信推送
           </button>
        )}
      </div>
    </motion.div>
  )
}