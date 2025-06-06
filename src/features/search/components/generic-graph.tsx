// features/search/components/GenericChart.jsx
import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSpecimensGraph } from '@/features/search/api/get-occurrences'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MAX_YEAR,
  MIN_YEAR,
  MONTHS,
} from '@/features/search/constants/constants'


// Helper function to fill missing intervals for line charts
function fillMissingIntervals(data: Array<any>, groupBy: string) {
  if (!data.length) return []

  // The API returns data where the groupBy field name is the key
  // For example: { year: "2020", count: 5 } or { month: "3", count: 8 }
  const dataMap = new Map()
  data.forEach((item) => {
    // Use the groupBy field as the key
    const key = item[groupBy]
    if (key !== undefined && key !== null) {
      dataMap.set(key.toString(), item.count)
    }
  })

  if (groupBy === 'year') {
    const filledData = []

    // Use constants for full year range from 1800 to current year
    for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
      const yearKey = year.toString()
      filledData.push({
        [groupBy]: yearKey,
        count: dataMap.get(yearKey) || 0,
      })
    }

    return filledData
  }

  if (groupBy === 'month') {
    const filledData = []
    for (let month = 1; month <= 12; month++) {
      const monthKey = month.toString()
      filledData.push({
        [groupBy]: monthKey, // Use groupBy as the field name
        count: dataMap.get(monthKey) || 0,
      })
    }
    return filledData
  }

  return data
}

function ChartSkeleton() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  )
}

function ChartError({ error }: { error: Error }) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle className="h-6">Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="h-[400px] w-full flex justify-center items-center">
          {error.message}
        </p>
      </CardContent>
    </Card>
  )
}

interface GenericGraphProps {
  title: string
  groupBy: string
  xAxisKey: string
  chartType?: 'bar' | 'line'
  color: string
  topN?: number | null
}

export function GenericGraph({
  title,
  groupBy,
  xAxisKey,
  chartType = 'bar',
  color,
  topN = null,
}: GenericGraphProps) {
  const { t } = useTranslation()

  const { data, isPending } = useSpecimensGraph({
    customGroupBy: groupBy as any,
  })

  const chartOptions = useMemo(() => {
    if (!data?.occurrences || data.occurrences.length === 0) {
      return null
    }

    let chartData = topN ? data.occurrences.slice(0, topN) : data.occurrences

    // For line charts with year or month data, fill in missing intervals with count 0
    if (chartType === 'line' && (groupBy === 'year' || groupBy === 'month')) {
      chartData = fillMissingIntervals(chartData, groupBy)
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: chartType === 'line' ? 'line' : 'shadow' },
        formatter: (params: any) => {
          const value = params[0].value
          let label = params[0].axisValue

          // For months, use translated month names
          if (groupBy === 'month') {
            const monthIndex = parseInt(params[0].axisValue) - 1
            const monthKey = MONTHS[monthIndex]?.value
            label = monthKey ? t(monthKey) : params[0].axisValue
          }

          return `${label}<br/>${t('search.results.specimens')}: ${value}`
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: chartData.map((item: any) => item[xAxisKey]),
        axisLabel:
          chartType === 'bar'
            ? { rotate: 70, fontSize: 8 }
            : groupBy === 'year'
              ? {
                  formatter: (value: string) => {
                    // Show every 20th year for better readability (1800, 1820, 1840, etc.)
                    const year = parseInt(value)
                    return year % 20 === 0 ? value : ''
                  },
                  fontSize: 10,
                  interval: 19, // Show every 20th label (0-based, so 19 means every 20th)
                }
              : groupBy === 'month'
                ? {
                    formatter: (value: string) => {
                      // Use translated month names from i18next
                      const monthIndex = parseInt(value) - 1
                      const monthKey = MONTHS[monthIndex]?.value
                      return monthKey ? t(monthKey) : value
                    },
                    fontSize: 10,
                    rotate: 90, // Display month labels vertically
                  }
                : undefined,
        axisTick:
          groupBy === 'year'
            ? {
                interval: 19, // Show tick marks every 20th position to match labels
              }
            : undefined,
      },
      yAxis: { type: 'value', name: 'Count' },
      series: [
        {
          name: 'Occurrences',
          type: chartType,
          smooth: chartType === 'line',
          data: chartData.map((item: any) => item.count),
          itemStyle: { color },
          ...(chartType === 'line' && {
            lineStyle: { width: 2 },
            symbol: 'circle',
            symbolSize: 4,
          }),
        },
      ],
    }
  }, [data, xAxisKey, chartType, color, topN, groupBy, t])

  if (!chartOptions && !isPending) {
    return <ChartError error={new Error('No data available')} />
  }

  return isPending ? (
    <ChartSkeleton />
  ) : (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts
          option={chartOptions}
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </CardContent>
    </Card>
  )
}
