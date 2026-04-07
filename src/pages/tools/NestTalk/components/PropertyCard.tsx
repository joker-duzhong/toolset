import type { Property } from '../types'
import { motion } from 'framer-motion'
import { ChevronRight, BadgePercent } from 'lucide-react'

export function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4 relative"
    >
      <div className="absolute top-0 right-0 p-2 text-rose-500 font-bold text-xs bg-rose-50 rounded-bl-2xl px-3 border-l border-b border-rose-100 flex items-center gap-1">
        <BadgePercent size={14} /> 低于均价15%
      </div>
      <div className="p-4 pt-5">
        <div className="font-semibold text-gray-800 text-lg mb-1">{property.name}</div>
        <div className="text-sm text-gray-500 mb-3">{property.layout} / {property.area} / {property.location}</div>
        
        <div className="flex justify-between items-end border-b border-dashed border-gray-100 pb-3 mb-3">
          <div className="text-xl font-bold text-rose-600">
            {property.priceTotal} <span className="text-xs font-normal text-gray-400">万</span>
          </div>
          <div className="text-xs text-gray-400">{property.priceUnit} 元/平</div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-sm mt-3">
           <div className="flex font-semibold text-slate-700 mb-2 gap-2 text-xs items-center">
             <span>🤖 AI 深度分析</span>
             <ChevronRight size={14} />
           </div>
           <div className="text-slate-600 text-xs leading-relaxed space-y-1">
             <p>{property.analysis}</p>
           </div>
        </div>
      </div>
    </motion.div>
  )
}