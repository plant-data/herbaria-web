import { useEffect, useState } from 'react'
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
  const [currentSliderValues, setCurrentSliderValues] = useState<[number, number]>(initialValues) // Change to tuple type

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
      <div className="pb-2 pl-1 text-sm font-semibold">{label}</div>
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
