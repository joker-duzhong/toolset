import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TaskCard } from '../components/TaskCard'
import { getMockTasks } from '../services/api'
import type { Task } from '../types'
import { PlusCircle } from 'lucide-react'

export function HomeView({ onNavigate }: { onNavigate: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMockTasks().then(res => {
      setTasks(res)
      setLoading(false)
    })
  }, [])

  const handleBindWechat = () => {
    alert('微信绑定功能即将上线，敬请期待！')
  }

  if (loading) {
    return <div className="p-4 flex justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 pb-24">
      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg mt-16"
        >
          <div className="text-gray-400 mb-4 text-lg">暂无房产监控</div>
          <button
            onClick={onNavigate}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold active:scale-95 transition shadow-lg hover:shadow-xl"
          >
            <PlusCircle className="size-5" />
            唤醒语筑，创建监控
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-4 auto-rows-max"
        >
          {tasks.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={idx === 0 ? 'col-span-1 row-span-2' : 'col-span-1'}
            >
              <TaskCard task={t} onBindWechat={handleBindWechat} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {tasks.length > 0 && (
        <motion.button
          onClick={onNavigate}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-4 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <PlusCircle className="size-6" />
        </motion.button>
      )}
    </div>
  )
}