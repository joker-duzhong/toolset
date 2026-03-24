import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  className?: string
  rightSlot?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  showBack = true,
  className,
  rightSlot,
}: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur border-b border-gray-100',
        className,
      )}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 transition text-gray-600 active:scale-90"
          aria-label="返回"
        >
          <ArrowLeft className="size-5" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
      </div>

      {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
    </header>
  )
}
