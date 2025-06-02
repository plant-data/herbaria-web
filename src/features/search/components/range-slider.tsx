import { useEffect, useState } from 'react' // Add useEffect
import { DualSlider } from '@/components/ui/dual-slider'

interface RangeSliderProps {
  label: string
  initialValues: Array<number>
  onValuesChange?: (values: Array<number>) => void
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
  const [currentSliderValues, setCurrentSliderValues] =
    useState<Array<number>>(initialValues)

  useEffect(() => {
    setCurrentSliderValues(initialValues)
  }, [initialValues])

  function handleSliderInteraction(newValues: Array<number>): void {
    setCurrentSliderValues(newValues)
  }
  function handleSliderInteraction2(newValues: Array<number>): void {
    if (onValuesChange) {
      onValuesChange(newValues)
    }
  }

  return (
    <div className="max-w-full">
      <div className="text-sm font-bold pl-1 pb-3">{label}</div>
      <DualSlider
        className="bg-background"
        value={currentSliderValues} // Use local state for the slider's value
        onValueChange={handleSliderInteraction} // Local handler for immediate update + parent notification
        onValueCommit={handleSliderInteraction2}
        min={min}
        max={max}
        step={step}
      />
      <div
        id="year-range-values"
        className="flex justify-between mt-2 font-semibold text-sm"
      >
        {/* Display values from local state for immediate feedback */}
        <div>{currentSliderValues[0]}</div>
        <div>{currentSliderValues[1]}</div>
      </div>
    </div>
  )
}
