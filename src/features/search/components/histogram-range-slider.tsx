import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { Badge } from '@/components/ui/badge'
import { DualSlider } from '@/components/ui/dual-slider'
import { Input } from '@/components/ui/input'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { buildLocalFilterParams, fetchGroup } from '@/features/search/api/local-backend'

/** Tallest bar, in pixels. */
const BAR_HEIGHT = 48
/** Floor for a bar that has anything in it, so "present but tiny" stays visible. */
const MIN_BAR = 3

interface Bucket {
  from: number
  to: number
  count: number
}

/**
 * Lay per-value counts out as a contiguous row of bins across the slider span.
 * Works for both the year histogram (one bar per decade, counts binned) and the
 * altitude histogram (one bar per band, values already floored to a multiple of
 * the width) — floor indexing collapses to an exact match in the latter case.
 */
function bucketize(
  data: Array<{ value: number; count: number }>,
  min: number,
  max: number,
  binWidth: number,
): Array<Bucket> {
  const step = Math.max(1, binWidth)
  const start = Math.floor(min / step) * step
  const end = Math.ceil((max + 1) / step) * step
  const total = Math.max(1, Math.round((end - start) / step))

  const buckets: Array<Bucket> = Array.from({ length: total }, (_, index) => ({
    from: start + index * step,
    to: start + index * step + step - 1,
    count: 0,
  }))

  for (const { value, count } of data) {
    const index = Math.floor((value - start) / step)
    // Values outside the window are not folded into the end bars — that would
    // draw an outlier as if it sat at the edge.
    if (index >= 0 && index < total) {
      buckets[index].count += count
    }
  }

  return buckets
}

/**
 * Square-root scaled, so the peak stays dominant and the shape stays truthful
 * while a bin holding a handful is still drawn (linear buries it, log flatters
 * it). The exact number lives in the bar's tooltip.
 */
function barHeight(count: number, peak: number): number {
  if (count === 0) return 0
  return Math.max(MIN_BAR, Math.sqrt(count / peak) * BAR_HEIGHT)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

interface HistogramRangeSliderProps {
  label: string
  // The local backend group field driving the bars.
  field: 'eventYear' | 'elevation_band'
  value: [number, number]
  onValueCommit: (value: [number, number]) => void
  min: number
  max: number
  step: number
  binWidth: number
  // Which range to lift from the histogram query, so the bars show the full
  // distribution under the *other* filters rather than only the selected span.
  excludeKey: 'year' | 'altitude'
  // Optional suffix on the endpoint labels, e.g. "m" for altitude.
  unit?: string
}

/**
 * A range filter with a histogram of what is actually there behind the handles —
 * the reference dashboard's year/altitude control, adapted to this app's store
 * and its DualSlider (commit-on-release). Bars beyond the handles stay drawn but
 * faded, because what widening the range would buy is exactly the thing worth
 * seeing. The numeric boxes reach values outside the slider's window (a mistyped
 * 1231, an 8,480 m outlier) that a curator checking for errors is after.
 */
export function HistogramRangeSlider({
  label,
  field,
  value,
  onValueCommit,
  min,
  max,
  step,
  binWidth,
  excludeKey,
  unit,
}: HistogramRangeSliderProps) {
  const { t } = useTranslation()
  const [localValue, setLocalValue] = useState<[number, number]>(value)
  const [isDragging, setIsDragging] = useState(false)

  // The other applied filters, so the distribution reflects them.
  const source = useFilterStore(
    useShallow((state) => ({
      scientificName: state.scientificName,
      genus: state.genus,
      countryCode: state.countryCode,
      locality: state.locality,
      recordedBy: state.recordedBy,
      year: state.year,
      altitude: state.altitude,
      onlyMultisheet: state.onlyMultisheet,
    })),
  )
  const params = buildLocalFilterParams(source, {
    excludeYear: excludeKey === 'year',
    excludeAltitude: excludeKey === 'altitude',
  })

  const { data } = useQuery({
    queryKey: ['histogram', field, JSON.stringify(params)],
    queryFn: ({ signal }) => fetchGroup(field, 'value', params, signal),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60,
    gcTime: 24 * 60 * 60,
  })

  const buckets = useMemo(() => {
    const numeric = (data ?? []).map((bucket) => ({ value: Number(bucket.value), count: bucket.count }))
    return bucketize(numeric, min, max, binWidth)
  }, [data, min, max, binWidth])

  const peak = useMemo(() => Math.max(1, ...buckets.map((bucket) => bucket.count)), [buckets])

  // What the slider shows: the live drag value, else the committed value clamped
  // into the slider's window (the boxes may hold something further out).
  const sliderValue: [number, number] = isDragging ? localValue : [clamp(value[0], min, max), clamp(value[1], min, max)]

  const active = value[0] !== min || value[1] !== max

  function handleReset() {
    const resetValue: [number, number] = [min, max]
    setLocalValue(resetValue)
    onValueCommit(resetValue)
  }

  const fmt = (n: number) => `${n.toLocaleString()}${unit ? ` ${unit}` : ''}`

  return (
    <div className="max-w-full">
      <div className="flex min-h-9 items-center justify-between pb-1 pl-1">
        <div className="text-sm font-semibold">{label}</div>
        {active && (
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

      {/* Histogram. aria-hidden: the counts are in each bar's tooltip, and a row
          of bars read out would be noise. */}
      <div className="flex items-end gap-px px-1" style={{ height: `${BAR_HEIGHT}px` }} aria-hidden="true">
        {buckets.map((bucket) => {
          const inRange = bucket.to >= sliderValue[0] && bucket.from <= sliderValue[1]
          return (
            <div
              key={bucket.from}
              className="flex h-full flex-1 items-end"
              title={`${fmt(bucket.from)}–${fmt(bucket.to)}: ${bucket.count.toLocaleString()}`}
            >
              <div
                className={`w-full rounded-t-[1px] transition-colors ${inRange ? 'bg-primary/70' : 'bg-muted-foreground/25'}`}
                style={{ height: `${barHeight(bucket.count, peak)}px`, minHeight: '1px' }}
              />
            </div>
          )
        })}
      </div>

      <DualSlider
        className="bg-background mt-1"
        value={sliderValue}
        onValueChange={(v) => {
          setIsDragging(true)
          setLocalValue(v as [number, number])
        }}
        onValueCommit={(v) => {
          setIsDragging(false)
          onValueCommit(v as [number, number])
        }}
        min={min}
        max={max}
        step={step}
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Input
          type="number"
          inputMode="numeric"
          aria-label={`${label} from`}
          className="h-8 text-xs"
          placeholder={String(min)}
          value={value[0] === min ? '' : value[0]}
          onChange={(e) => onValueCommit([e.target.value === '' ? min : Number(e.target.value), value[1]])}
        />
        <Input
          type="number"
          inputMode="numeric"
          aria-label={`${label} to`}
          className="h-8 text-xs"
          placeholder={String(max)}
          value={value[1] === max ? '' : value[1]}
          onChange={(e) => onValueCommit([value[0], e.target.value === '' ? max : Number(e.target.value)])}
        />
      </div>
    </div>
  )
}
