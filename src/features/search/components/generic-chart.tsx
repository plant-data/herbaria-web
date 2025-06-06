// features/search/components/GenericChart.jsx
import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSpecimensGraph } from '@/features/search/api/get-occurrences'
import { Skeleton } from '@/components/ui/skeleton'

// NOTE: Assumes useSpecimensGraph is configured for Suspense.
// It will suspend rendering until data is available.

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


export function GenericChart({
  title,
  groupBy,
  xAxisKey,
  chartType = 'bar',
  color,
  topN = null, // Optional limit for the number of data points
}) {
  // This hook will now suspend if data is not ready.
  // It will throw an error if the fetch fails, to be caught by an Error Boundary.
  const { data, isPending, isError } = useSpecimensGraph({ customGroupBy: groupBy })

  const chartOptions = useMemo(() => {
    if (!data?.occurrences || data.occurrences.length === 0) {
      return null
    }

    const chartData = topN ? data.occurrences.slice(0, topN) : data.occurrences

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: chartData.map((item) => item[xAxisKey]),
        axisLabel:
          chartType === 'bar' ? { rotate: 70, fontSize: 8 } : undefined,
      },
      yAxis: { type: 'value', name: 'Count' },
      series: [
        {
          name: 'Occurrences',
          type: chartType,
          smooth: chartType === 'line',
          data: chartData.map((item) => item.count),
          itemStyle: { color },
        },
      ],
    }
  }, [data, xAxisKey, chartType, color, topN])

  if (!chartOptions && !isPending) {
    return (
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No data available for this chart.</p>
        </CardContent>
      </Card>
    )
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
