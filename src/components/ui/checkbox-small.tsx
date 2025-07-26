import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { CheckIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  variant?: 'default' | 'delete'
}
function CheckboxSmall({ className, variant = 'default', ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-3 shrink-0 rounded-[3px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'delete'
          ? 'data-[state=checked]:bg-destructive/80 data-[state=checked]:text-background dark:data-[state=checked]:bg-destructive data-[state=checked]:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50'
          : 'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary',

        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        {variant === 'delete' ? <XIcon className="size-3.5 pb-1" /> : <CheckIcon className="size-3.5 pb-1" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { CheckboxSmall }
