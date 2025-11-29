import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { DualSlider } from '@/components/ui/dual-slider'

interface RangeSliderProps {
  label: string
  initialValues: [number, number] // Change to tuple type
  onValuesChange?: (values: [number, number]) => void // Change to tuple type
  min?: number
  max?: number
  step?: number
}

export function RangeSlider({
  label,
  initialValues,
  onValuesChange,
  min = 1800,
  max = 2025,
  step = 1,
}: RangeSliderProps) {
  const { t } = useTranslation()
  const [currentSliderValues, setCurrentSliderValues] = useState<[number, number]>(initialValues) // Change to tuple type
  // Track if user is currently interacting with the slider
  const isInteractingRef = useRef(false)
  // Store the latest onValuesChange callback to avoid stale closures
  const onValuesChangeRef = useRef(onValuesChange)
  onValuesChangeRef.current = onValuesChange

  const isChanged = currentSliderValues[0] !== min || currentSliderValues[1] !== max

  function handleReset() {
    const newValues: [number, number] = [min, max]
    setCurrentSliderValues(newValues)
    if (onValuesChangeRef.current) {
      onValuesChangeRef.current(newValues)
    }
  }

  // Sync from parent state only when not interacting
  useEffect(() => {
    if (!isInteractingRef.current) {
      setCurrentSliderValues(initialValues)
    }
  }, [initialValues])

  function handleSliderInteraction(newValues: Array<number>): void {
    isInteractingRef.current = true
    setCurrentSliderValues(newValues as [number, number]) // Cast to tuple
  }

  function handleSliderInteractionCommit(newValues: Array<number>): void {
    // Mark interaction as complete after a short delay to prevent race conditions
    // with the useEffect that syncs from initialValues
    setTimeout(() => {
      isInteractingRef.current = false
    }, 100)

    if (onValuesChangeRef.current) {
      onValuesChangeRef.current(newValues as [number, number]) // Cast to tuple
    }
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
        value={currentSliderValues}
        onValueChange={handleSliderInteraction}
        onValueCommit={handleSliderInteractionCommit}
        min={min}
        max={max}
        step={step}
      />
      <div id="year-range-values" className="mt-2 flex justify-between text-sm font-semibold">
        <div>{currentSliderValues[0]}</div>
        <div>{currentSliderValues[1]}</div>
      </div>
    </div>
  )
}
