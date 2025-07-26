import * as React from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

interface DualSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  labelPosition?: 'top' | 'bottom'
  label?: (value: number | undefined) => React.ReactNode
}

function DualSlider({ className, label, labelPosition = 'top', ...props }: DualSliderProps) {
  const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max]

  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none items-center select-none', className)}
      {...props}
    >
      <SliderPrimitive.Track className="bg-background border-input relative h-1.5 w-full grow overflow-hidden rounded-full border shadow-xs">
        <SliderPrimitive.Range className="bg-primary absolute h-full" />
      </SliderPrimitive.Track>
      {initialValue.map((value, index) => (
        <React.Fragment key={index}>
          <SliderPrimitive.Thumb className="border-primary bg-background ring-offset-background focus-visible:ring-ring/50 relative block h-4 w-4 rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
            {label && (
              <span
                className={cn(
                  'absolute flex w-full justify-center',
                  labelPosition === 'top' && '-top-7',
                  labelPosition === 'bottom' && 'top-4',
                )}
              >
                {label(value)}
              </span>
            )}
          </SliderPrimitive.Thumb>
        </React.Fragment>
      ))}
    </SliderPrimitive.Root>
  )
}
DualSlider.displayName = 'DualSlider'

export { DualSlider }
