import { LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface LoadingBadgeProps {
  className?: string
}

export function LoadingBadge({ className }: LoadingBadgeProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'border-border bg-background text-muted-foreground flex items-center gap-2 rounded-full border px-2 py-1 text-xs shadow-sm',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="text-primary h-3 w-3 animate-spin" />
      <span>{t('search.filters.loading-data')}</span>
    </div>
  )
}
