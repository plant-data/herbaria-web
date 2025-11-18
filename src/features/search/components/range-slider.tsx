import { useEffect, useState } from 'react'
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

  const isChanged = currentSliderValues[0] !== min || currentSliderValues[1] !== max

  function handleReset() {
    const newValues: [number, number] = [min, max]
    setCurrentSliderValues(newValues)
    if (onValuesChange) {
      onValuesChange(newValues)
    }
  }

  useEffect(() => {
    setCurrentSliderValues(initialValues)
  }, [initialValues])

  function handleSliderInteraction(newValues: Array<number>): void {
    setCurrentSliderValues(newValues as [number, number]) // Cast to tuple
  }
  function handleSliderInteraction2(newValues: Array<number>): void {
    if (onValuesChange) {
      onValuesChange(newValues as [number, number]) // Cast to tuple
    }
  }

  return (
    <div className="max-w-full">
      <div className="min-h-9 flex items-center justify-between pb-3 pl-1">
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
        onValueCommit={handleSliderInteraction2}
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
