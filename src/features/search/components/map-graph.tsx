import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTranslation } from 'react-i18next'
import { useSpecimensGraph } from '@/features/search/api/get-occurrences'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEchartsMap } from '@/features/search/api/get-echart-map'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { BASE_PATH } from '@/config'
import { LoadingBadge } from '@/features/search/components/loading-badge'
import { useInView } from '@/hooks/use-in-view'

export function MapGraph({ className = '' }) {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin: '200px' })
  const {
    data,
    isPending,
    isFetching,
    error: dataError,
  } = useSpecimensGraph({
    customGroupBy: 'country',
    enabled: inView,
  })
  const isFetchingNewData = isFetching && !isPending

  const {
    geoJson,
    isLoading: isLoadingGeo,
    error: geoError,
  } = useEchartsMap('countries', `${BASE_PATH}/maps/countries.json`)

  const countryCountMap = useMemo(() => {
    const map = new Map<string, number>()
    data?.occurrences?.forEach((item: { countryCode: string; count: number }) => {
      map.set(item.countryCode, item.count)
    })
    return map
  }, [data])

  const { seriesData, minValue, maxValue } = useMemo(() => {
    if (!geoJson) return { seriesData: [], minValue: 0, maxValue: 1 }

    let min = Infinity
    let max = -Infinity

    const featureData = geoJson.features.map((feature: any) => {
      const fipsCode = feature.properties.iso_a2_eh
      const count = countryCountMap.get(fipsCode) || 0
      const logValue = Math.log10(count + 1)

      min = Math.min(min, logValue)
      max = Math.max(max, logValue)

      return {
        name: feature.properties.name,
        value: logValue,
        originalValue: count,
        displayName:
          i18n.language === 'it' && feature.properties.name_it ? feature.properties.name_it : feature.properties.name,
      }
    })

    return {
      seriesData: featureData,
      minValue: min === Infinity ? 0 : min,
      maxValue: max === -Infinity ? 1 : max,
    }
  }, [geoJson, countryCountMap, i18n.language])

  const countryOptions = useMemo(() => {
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
      // 1. DEFAULT CONFIG (Mobile First)
      // layoutSize: '100%' ensures it fits perfectly on narrow screens where Width is the limiting factor
      series: [
        {
          name: 'Occurrences',
          type: 'map',
          map: 'countries',
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
      // 2. MEDIA QUERY
      // When width > 600px, the Height (400px) becomes the limiting factor.
      // We increase layoutSize to >100% (relative to height) to fill the width.
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
      <Card ref={ref} className={cn('gap-0 overflow-hidden shadow-xs', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (hasError || !countryOptions) {
    return (
      <Card ref={ref} className={cn('relative gap-0 overflow-hidden shadow-xs', className)}>
        {isFetchingNewData && <LoadingBadge className="absolute top-3 right-3" />}
        <CardHeader>
          <CardTitle>{t('search.results.specimens-country')}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[400px] items-center justify-center">
          <p>{hasError ? t('search.results.error-graph') : t('search.results.error-no-data')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card ref={ref} className={cn('relative gap-0 overflow-hidden shadow-xs', className)}>
      {isFetchingNewData && <LoadingBadge className="absolute top-3 right-3" />}
      <CardHeader>
        <CardTitle>{t('search.results.specimens-country')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-2 md:p-4">
        <div className="h-[400px] w-full">
          <ReactECharts
            option={countryOptions}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'svg' }}
            notMerge={true}
          />
        </div>
      </CardContent>
    </Card>
  )
}
