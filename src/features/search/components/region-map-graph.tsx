import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTranslation } from 'react-i18next'
import { useSpecimensGraph } from '@/features/search/api/get-occurrences'
import { Skeleton } from '@/components/ui/skeleton'
import { useEchartsMap } from '@/features/search/api/get-echart-map'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { BASE_PATH } from '@/config'
import { LoadingBadge } from '@/features/search/components/loading-badge'

interface RegionMapGraphProps {
  className?: string
  inView: boolean
}

export function RegionMapGraph({ className = '', inView }: RegionMapGraphProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    data,
    isPending,
    isFetching,
    error: dataError,
  } = useSpecimensGraph({
    customGroupBy: 'stateProvince',
    enabled: inView,
  })
  const isFetchingNewData = isFetching && !isPending

  const {
    geoJson,
    isLoading: isLoadingGeo,
    error: geoError,
  } = useEchartsMap('regions', `${BASE_PATH}/maps/regions.json`)

  const regionCountMap = useMemo(() => {
    const map = new Map<string, number>()
    data?.occurrences?.forEach((item: { region: string; count: number }) => {
      map.set(item.region, item.count)
    })
    return map
  }, [data])

  const { seriesData, minValue, maxValue } = useMemo(() => {
    if (!geoJson) return { seriesData: [], minValue: 0, maxValue: 1 }

    let min = Infinity
    let max = -Infinity

    const featureData = geoJson.features.map((feature: any) => {
      const regionName = feature.properties.den_reg
      const count = regionCountMap.get(regionName) || 0
      const logValue = Math.log10(count + 1)

      min = Math.min(min, logValue)
      max = Math.max(max, logValue)

      return {
        name: regionName,
        value: logValue,
        originalValue: count,
        displayName: regionName,
      }
    })

    return {
      seriesData: featureData,
      minValue: min === Infinity ? 0 : min,
      maxValue: max === -Infinity ? 1 : max,
    }
  }, [geoJson, regionCountMap])

  const regionOptions = useMemo(() => {
    if (seriesData.length === 0) return null

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const textColor = isDark ? '#ffffff' : '#000000'

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const itemData = params.data
          if (!itemData) return params.name
          return `${itemData.displayName || params.name}<br/>${itemData.originalValue} ${t('search.results.specimens')}`
        },
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        text: [t('search.results.map-max'), t('search.results.map-min')],
        textStyle: { color: textColor },
        realtime: false,
        calculable: true,
        formatter: (value: number) => Math.round(Math.pow(10, value) - 1).toLocaleString(),
        inRange: {
          color: ['#ffffff', '#e0f3ff', '#5470c6'],
        },
        left: 'left',
        bottom: 20,
      },
      series: [
        {
          name: 'Occurrences',
          type: 'map',
          map: 'regions',
          roam: false,
          layoutCenter: ['50%', '50%'],
          layoutSize: '100%',
          data: seriesData,
          emphasis: {
            label: { show: false },
            itemStyle: { areaColor: '#ffdb58' },
          },
        },
      ],
      media: [
        {
          query: {
            minWidth: 550,
          },
          option: {
            series: [
              {
                layoutSize: '155%',
              },
            ],
          },
        },
      ],
    }
  }, [seriesData, minValue, maxValue, theme, t])

  const isLoading = isPending || isLoadingGeo
  const hasError = !!(dataError || geoError)

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (hasError || !regionOptions) {
    return (
      <div className={cn('relative', className)}>
        {isFetchingNewData && <LoadingBadge className="absolute top-3 right-3" />}
        <div className="flex h-[400px] items-center justify-center">
          <p>{hasError ? t('search.results.error-graph') : t('search.results.error-no-data')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {isFetchingNewData && <LoadingBadge className="absolute top-3 right-3" />}
      <div className="h-[400px] w-full">
        <ReactECharts
          option={regionOptions}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
          notMerge={true}
        />
      </div>
    </div>
  )
}
