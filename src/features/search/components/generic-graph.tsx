import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSpecimensGraph } from '@/features/search/api/get-occurrences'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from '@/components/theme-provider'
import {
  MAX_YEAR,
  MIN_YEAR,
  MONTHS,
} from '@/features/search/constants/constants'

// Types
interface GenericGraphProps {
  title: string
  groupBy: string
  xAxisKey: string
  chartType?: 'bar' | 'line'
  color: string
  topN?: number | null
}

interface ChartData {
  [key: string]: any
  count: number
}

// Helper functions
function fillMissingIntervals(
  data: Array<ChartData>,
  groupBy: string,
): Array<ChartData> {
  if (!data.length) return []

  const dataMap = new Map<string, number>()
  data.forEach((item) => {
    const key = item[groupBy]
    if (key !== undefined && key !== null) {
      dataMap.set(key.toString(), item.count)
    }
  })

  if (groupBy === 'year') {
    return Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => {
      const year = (MIN_YEAR + i).toString()
      return {
        [groupBy]: year,
        count: dataMap.get(year) || 0,
      }
    })
  }

  if (groupBy === 'month') {
    return Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString()
      return {
        [groupBy]: month,
        count: dataMap.get(month) || 0,
      }
    })
  }

  return data
}

function createXAxisConfig(
  groupBy: string,
  chartType: string,
  t: any,
  textColor: string,
) {
  const baseConfig = {
    type: 'category' as const,
    axisLabel: { color: textColor },
    axisLine: { lineStyle: { color: textColor } },
    axisTick: { lineStyle: { color: textColor } },
  }

  if (chartType === 'bar') {
    return {
      ...baseConfig,
      axisLabel: { rotate: 70, fontSize: 8, color: textColor },
    }
  }

  if (groupBy === 'year') {
    return {
      ...baseConfig,
      axisLabel: {
        formatter: (value: string) => {
          const year = parseInt(value)
          return year % 20 === 0 ? value : ''
        },
        fontSize: 10,
        rotate: 0,
        interval: 19,
        color: textColor,
      },
      axisTick: { interval: 19, lineStyle: { color: textColor } },
    }
  }

  if (groupBy === 'month') {
    return {
      ...baseConfig,
      axisLabel: {
        formatter: (value: string) => {
          const monthIndex = parseInt(value) - 1
          const monthKey = MONTHS[monthIndex]?.value
          return monthKey ? t(monthKey) : value
        },
        fontSize: 10,
        rotate: 70,
        color: textColor,
      },
    }
  }

  return baseConfig
}

function createTooltipFormatter(groupBy: string, t: any) {
  return (params: any) => {
    const value = params[0].value
    let label = params[0].axisValue

    if (groupBy === 'month') {
      const monthIndex = parseInt(params[0].axisValue) - 1
      const monthKey = MONTHS[monthIndex]?.value
      label = monthKey ? t(monthKey) : params[0].axisValue
    }

    return `${label}<br/>${t('search.results.specimens')}: ${value}`
  }
}

function createSeriesConfig(
  chartType: string,
  color: string,
  data: Array<number>,
  t: any,
) {
  const baseConfig = {
    name: t('search.results.specimens'),
    type: chartType,
    data,
    itemStyle: { color },
  }

  if (chartType === 'line') {
    return {
      ...baseConfig,
      smooth: true,
      lineStyle: { width: 2 },
      symbol: 'circle',
      symbolSize: 4,
    }
  }

  return baseConfig
}

// Main component
export function GenericGraph({
  title,
  groupBy,
  xAxisKey,
  chartType = 'bar',
  color,
  topN = null,
}: GenericGraphProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { data, isPending } = useSpecimensGraph({
    customGroupBy: groupBy as any,
  })

  const chartOptions = useMemo(() => {
    if (!data?.occurrences || data.occurrences.length === 0) {
      return null
    }

    // Determine text color based on theme
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    const textColor = isDark ? '#ffffff' : '#000000'

    let chartData = topN ? data.occurrences.slice(0, topN) : data.occurrences

    // Fill missing intervals for line charts with temporal data
    if (chartType === 'line' && (groupBy === 'year' || groupBy === 'month')) {
      chartData = fillMissingIntervals(chartData, groupBy)
    }

    const xAxisConfig = createXAxisConfig(groupBy, chartType, t, textColor)
    const seriesConfig = createSeriesConfig(
      chartType,
      color,
      chartData.map((item: any) => item.count),
      t,
    )

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: chartType === 'line' ? 'line' : 'shadow' },
        formatter: createTooltipFormatter(groupBy, t),
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        ...xAxisConfig,
        data: chartData.map((item: any) => item[xAxisKey]),
      },
      yAxis: {
        type: 'value',
        name: t('search.results.count'),
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: textColor } },
        axisTick: { lineStyle: { color: textColor } },
        splitLine: { lineStyle: { color: isDark ? '#333' : '#e0e0e0' } },
        minInterval: 1,
      },
      series: [seriesConfig],
    }
  }, [data, xAxisKey, chartType, color, topN, groupBy, t, theme])

  if (!chartOptions && !isPending) {
    return (
      <Card className="gap-0 pb-1 shadow-xs">
        <CardHeader>
          <CardTitle className="h-6">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-1">
          <p className="flex h-[400px] w-full items-center justify-center">
            {t('search.results.error-no-data')}
          </p>
        </CardContent>
      </Card>
    )
  }
  if (isPending) {
    return (
      <Card className="gap-0 pb-1 shadow-xs">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-0 pb-1 shadow-xs">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <ReactECharts
          option={chartOptions}
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </CardContent>
    </Card>
  )
}
