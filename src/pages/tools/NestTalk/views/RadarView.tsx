import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPropertyRadar } from '../services/api'
import { PropertyCard } from '../components/PropertyCard'
import type { Property } from '../types'

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
    <div className="p-4 space-y-4 pb-20 bg-gray-50 min-h-full">
      <div className="text-sm font-semibold text-gray-800 mb-2">已为您监控到以下房源：</div>
      {properties.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <PropertyCard property={p} />
        </motion.div>
      ))}
    </div>
  )
}