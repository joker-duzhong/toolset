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

  if (loading) {
    return <div className="p-4 flex justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="p-4 space-y-4 h-full">
      {tasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm mt-10"
        >
          <div className="text-gray-400 mb-4">暂无房产监控</div>
          <button 
            onClick={onNavigate}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition"
          >
            <PlusCircle className="size-5" />
            唤醒语筑，创建监控
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="space-y-3"
        >
          {tasks.map(t => <TaskCard key={t.id} task={t} />)}
          <button 
            onClick={onNavigate} 
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-semibold active:scale-95 transition border border-indigo-100"
          >
            添加新监控
          </button>
        </motion.div>
      )}
    </div>
  )
}