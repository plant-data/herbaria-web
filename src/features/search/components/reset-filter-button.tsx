import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ResetFilterButtonProps {
  itemCount?: number
  onResetClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ResetFilterButton({
  itemCount = 0,
  onResetClick,
  disabled = false,
  size = 'md',
}: ResetFilterButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const badgeSizes = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-xs',
    lg: 'h-6 w-6 text-sm',
  }

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="icon"
        className={cn(
          sizeClasses[size],
          'peer',
          'rounded-full border-1 transition-all duration-200',
          'hover:border-destructive hover:text-destructive',
          'focus:border-destructive focus:text-destructive',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isHovered ? 'shadow-sm' : 'shadow-xs',
        )}
        onClick={onResetClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Delete ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      >
        <Trash2 className={`${iconSizes[size]}`} />
      </Button>

      {itemCount > 0 && (
        <div
          className={cn(
            'absolute -top-1 -right-1',
            badgeSizes[size],
            'peer-hover:bg-destructive',
            'bg-primary text-secondary rounded-full',
            'flex items-center justify-center text-[10px] font-semibold',
            'border-background border-1 p-1 shadow-md',
            'animate-in zoom-in-50 duration-200',
          )}
          aria-label={`${itemCount} items selected`}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </div>
      )}
    </div>
  )
}
