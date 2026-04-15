import type { Property } from '../types'
import { motion } from 'framer-motion'
import { ChevronRight, BadgePercent } from 'lucide-react'

export function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -4 }}
      className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg overflow-hidden relative hover:shadow-xl transition-shadow"
    >
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-0 right-0 p-3 text-rose-600 font-bold text-xs bg-rose-500/20 backdrop-blur-sm rounded-bl-3xl px-4 border-l border-b border-rose-200/50 flex items-center gap-1.5"
      >
        <BadgePercent size={14} /> 低于均价15%
      </motion.div>
      <div className="p-6 pt-8">
        <div className="font-bold text-gray-900 text-lg mb-2">{property.name}</div>
        <div className="text-sm text-gray-600 mb-4">{property.layout} / {property.area} / {property.location}</div>

        <div className="flex justify-between items-end border-b border-white/40 pb-4 mb-4">
          <div className="text-2xl font-bold bg-linear-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {property.priceTotal} <span className="text-xs font-normal text-gray-500">万</span>
          </div>
          <div className="text-xs text-gray-600 font-medium">{property.priceUnit} 元/平</div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-500/15 backdrop-blur-sm rounded-2xl p-4 border border-indigo-200/50 text-sm hover:bg-indigo-500/20 transition"
        >
           <div className="flex font-semibold text-indigo-900 mb-3 gap-2 text-xs items-center">
             <span>🤖 AI 深度分析</span>
             <ChevronRight size={14} className="text-indigo-600" />
           </div>
           <div className="text-indigo-800 text-xs leading-relaxed space-y-1">
             <p>{property.analysis}</p>
           </div>
        </motion.div>
      </div>
    </motion.div>
  )
}