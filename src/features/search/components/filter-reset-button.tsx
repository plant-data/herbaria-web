import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FilterResetButtonProps {
  itemCount?: number
  onResetClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function FilterResetButton({
  itemCount = 0,
  onResetClick,
  disabled = false,
  size = 'md',
}: FilterResetButtonProps) {
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
          'rounded-full border-1 transition-all duration-200',
          'hover:border-destructive hover:bg-destructive hover:text-destructive',
          'focus:border-destructive focus:bg-destructive focus:text-destructive',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isHovered ? 'shadow-sm' : 'shadow-xs',
        )}
        onClick={onResetClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Delete ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      >
        <Trash2
          className={`${iconSizes[size]} transition-transform duration-200 ${isHovered ? 'scale-110' : ''}`}
        />
      </Button>

      {itemCount > 0 && (
        <div
          className={cn(
            'absolute -top-1 -right-1',
            badgeSizes[size],
            'bg-primary text-secondary rounded-full',
            'flex items-center justify-center font-semibold',
            'shadow-lg border-2 border-white',
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
