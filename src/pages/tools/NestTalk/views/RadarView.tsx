import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPropertyRadar } from '../services/api'
import { PropertyCard } from '../components/PropertyCard'
import type { Property } from '../types'
import { Radar } from 'lucide-react'

export function RadarView() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPropertyRadar().then(res => {
      setProperties(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-4 flex justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 pb-24">
      {properties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg mt-16"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Radar className="size-16 text-indigo-400/60 mb-4" />
          </motion.div>
          <div className="text-gray-700 mb-2 font-semibold">暂无捡漏房源</div>
          <div className="text-sm text-gray-600 text-center">创建监控后，系统会自动为您筛选优质房源</div>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold text-gray-800 mb-4 px-2"
          >
            已为您监控到以下房源：
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-4 auto-rows-max"
          >
            {properties.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}