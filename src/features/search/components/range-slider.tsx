import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { DualSlider } from '@/components/ui/dual-slider'

interface RangeSliderProps {
  label: string
  value: [number, number]
  onValueCommit?: (values: [number, number]) => void
  min?: number
  max?: number
  step?: number
}

export function RangeSlider({ label, value, onValueCommit, min = 1800, max = 2025, step = 1 }: RangeSliderProps) {
  const { t } = useTranslation()
  // Local state for smooth dragging, synced from parent value
  const [localValue, setLocalValue] = useState<[number, number]>(value)
  // Track if dragging to show local value vs parent value
  const [isDragging, setIsDragging] = useState(false)

  const displayValue = isDragging ? localValue : value
  const isChanged = displayValue[0] !== min || displayValue[1] !== max

  function handleReset() {
    const resetValue: [number, number] = [min, max]
    setLocalValue(resetValue)
    onValueCommit?.(resetValue)
  }

  return (
    <div className="max-w-full">
      <div className="flex min-h-9 items-center justify-between pb-3 pl-1">
        <div className="text-sm font-semibold">{label}</div>
        {isChanged && (
          <Badge
            variant="destructive"
            onClick={handleReset}
            className="focus-visible:border-destructive focus:ring-destructive cursor-pointer border-red-600/60 bg-red-600/10 text-xs font-normal text-red-500 shadow-none transition-colors hover:bg-red-600/5 focus:ring-2 focus:outline-none dark:bg-red-600/20"
            tabIndex={0}
            role="button"
            aria-label="Reset range filter"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleReset()
              }
            }}
          >
            {t('search.filters.clear')}
          </Badge>
        )}
      </div>
      <DualSlider
        className="bg-background"
        value={displayValue}
        onValueChange={(v) => {
          setIsDragging(true)
          setLocalValue(v as [number, number])
        }}
        onValueCommit={(v) => {
          setIsDragging(false)
          onValueCommit?.(v as [number, number])
        }}
        min={min}
        max={max}
        step={step}
      />
      <div id="year-range-values" className="mt-2 flex justify-between text-sm font-semibold">
        <div>{displayValue[0]}</div>
        <div>{displayValue[1]}</div>
      </div>
    </div>
  )
}
