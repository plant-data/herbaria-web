import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSpecimensGraph } from '@/features/search/api/get-occurrences'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from '@/components/theme-provider'
import { MONTHS } from '@/features/search/constants/constants'
import { LoadingBadge } from '@/features/search/components/loading-badge'
import { useInView } from '@/hooks/use-in-view'

// Types
interface HistogramGraphProps {
  title: string
  groupBy: string
  yAxisKey: string
  color: string
  topN?: number | null
}

interface LineGraphProps {
  title: string
  groupBy: string
  xAxisKey: string
  color: string
}

interface ChartData {
  [key: string]: any
  count: number
}

// Helper functions
function fillMissingIntervals(data: Array<ChartData>, groupBy: string): Array<ChartData> {
  if (!data.length) return []

  const dataMap = new Map<string, number>()
  data.forEach((item) => {
    const key = item[groupBy]
    if (key !== undefined && key !== null) {
      dataMap.set(key.toString(), item.count)
    }
  })

  if (groupBy === 'year') {
    const years = data.map((item) => parseInt(item[groupBy])).filter((y) => !isNaN(y))
    const minYear = years.length > 0 ? Math.max(1800, Math.min(...years)) : 1800
    const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear()

    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
      const year = (minYear + i).toString()
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

function createLineXAxisConfig(groupBy: string, t: any, textColor: string, chartData?: Array<ChartData>) {
  const baseConfig = {
    type: 'category' as const,
    axisLabel: {
      color: textColor,
      overflow: 'truncate',
      width: 170,
      ellipsis: '...',
    },
    axisLine: { lineStyle: { color: textColor } },
    axisTick: { lineStyle: { color: textColor } },
  }

  if (groupBy === 'year') {
    // Find indices of years divisible by 20 to show as labels
    const labelIndices = new Set<number>()
    chartData?.forEach((item, index) => {
      const year = parseInt(item.year)
      if (year % 20 === 0) {
        labelIndices.add(index)
      }
    })

    return {
      ...baseConfig,
      axisLabel: {
        ...baseConfig.axisLabel,
        formatter: (value: string) => {
          const year = parseInt(value)
          return year % 20 === 0 ? value : ''
        },
        fontSize: 11,
        rotate: 0,
        interval: (index: number) => labelIndices.has(index),
      },
      axisTick: {
        interval: (index: number) => labelIndices.has(index),
        lineStyle: { color: textColor },
      },
    }
  }

  if (groupBy === 'month') {
    return {
      ...baseConfig,
      axisLabel: {
        ...baseConfig.axisLabel,
        formatter: (value: string) => {
          const monthIndex = parseInt(value) - 1
          const monthKey = MONTHS[monthIndex]?.value
          return monthKey ? t(monthKey) : value
        },
        fontSize: 10,
        rotate: 70,
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

// Histogram Graph Component (Horizontal Bars)
export function HistogramGraph({ title, groupBy, yAxisKey, color, topN = null }: HistogramGraphProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin: '50px' })
  const { data, isPending, isFetching } = useSpecimensGraph({
    customGroupBy: groupBy as any,
    enabled: inView,
  })
  const isFetchingNewData = isFetching && !isPending

  const chartOptions = useMemo(() => {
    if (!data?.occurrences || data.occurrences.length === 0) {
      return null
    }

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const textColor = isDark ? '#ffffff' : '#000000'

    const chartData = topN ? data.occurrences.slice(0, topN) : data.occurrences
    // Reverse data for horizontal bar chart (top items at top)
    const reversedData = [...chartData].reverse()

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const value = params[0].value
          const label = params[0].axisValue
          return `${label}<br/>${t('search.results.specimens')}: ${value}`
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        name: t('search.results.count'),
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: textColor } },
        axisTick: { lineStyle: { color: textColor } },
        splitLine: { lineStyle: { color: isDark ? '#333' : '#e0e0e0' } },
        minInterval: 1,
      },
      yAxis: {
        type: 'category',
        data: reversedData.map((item: any) => item[yAxisKey]),
        axisLabel: {
          color: textColor,
          overflow: 'truncate',
          width: 170,
          ellipsis: '...',
          fontSize: 10,
        },
        axisLine: { lineStyle: { color: textColor } },
        axisTick: { lineStyle: { color: textColor } },
      },
      series: [
        {
          name: t('search.results.specimens'),
          type: 'bar',
          data: reversedData.map((item: any) => item.count),
          itemStyle: { color },
        },
      ],
    }
  }, [data, yAxisKey, color, topN, t, theme])

  if (!chartOptions && !isPending) {
    return (
      <Card ref={ref} className="relative gap-0 pb-1 shadow-xs">
        {isFetchingNewData && <LoadingBadge className="absolute top-3 right-3" />}
        <CardHeader>
          <CardTitle className="h-6">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-1">
          <p className="flex h-[400px] w-full items-center justify-center">{t('search.results.error-no-data')}</p>
        </CardContent>
      </Card>
    )
  }
  if (isPending) {
    return (
      <Card ref={ref} className="gap-0 pb-1 shadow-xs">
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
    <Card ref={ref} className="relative gap-0 pb-1 shadow-xs">
      {isFetchingNewData && <LoadingBadge className="absolute top-3 right-3" />}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <ReactECharts option={chartOptions} style={{ height: '400px', width: '100%' }} opts={{ renderer: 'svg' }} />
      </CardContent>
    </Card>
  )
}

// Line Graph Component
export function LineGraph({ title, groupBy, xAxisKey, color }: LineGraphProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin: '50px' })
  const { data, isPending, isFetching } = useSpecimensGraph({
    customGroupBy: groupBy as any,
    enabled: inView,
  })
  const isFetchingNewData = isFetching && !isPending

  const chartOptions = useMemo(() => {
    if (!data?.occurrences || data.occurrences.length === 0) {
      return null
    }

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const textColor = isDark ? '#ffffff' : '#000000'

    let chartData = data.occurrences

    if (groupBy === 'year' || groupBy === 'month') {
      chartData = fillMissingIntervals(chartData, groupBy)
    }

    const xAxisConfig = createLineXAxisConfig(groupBy, t, textColor, chartData)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
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
      series: [
        {
          name: t('search.results.specimens'),
          type: 'line',
          data: chartData.map((item: any) => item.count),
          itemStyle: { color },
          smooth: true,
          lineStyle: { width: 2 },
          symbol: 'circle',
          symbolSize: 4,
        },
      ],
    }
  }, [data, xAxisKey, color, groupBy, t, theme])

  if (!chartOptions && !isPending) {
    return (
      <Card ref={ref} className="relative gap-0 pb-1 shadow-xs">
        {isFetchingNewData && <LoadingBadge className="absolute top-3 right-3" />}
        <CardHeader>
          <CardTitle className="h-6">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-1">
          <p className="flex h-[400px] w-full items-center justify-center">{t('search.results.error-no-data')}</p>
        </CardContent>
      </Card>
    )
  }
  if (isPending) {
    return (
      <Card ref={ref} className="gap-0 pb-1 shadow-xs">
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
    <Card ref={ref} className="relative gap-0 pb-1 shadow-xs">
      {isFetchingNewData && <LoadingBadge className="absolute top-3 right-3" />}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <ReactECharts option={chartOptions} style={{ height: '400px', width: '100%' }} opts={{ renderer: 'svg' }} />
      </CardContent>
    </Card>
  )
}
