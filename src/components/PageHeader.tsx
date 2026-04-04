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
        'sticky top-0 z-10 flex items-center gap-3 px-4 py-3',
        className,
      )}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-border-light)',
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center size-8 transition active:scale-90"
          style={{
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-text-primary)',
          }}
          aria-label="返回"
        >
          <ArrowLeft className="size-5" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h1
          className="text-base font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-xs truncate"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </header>
  )
}
