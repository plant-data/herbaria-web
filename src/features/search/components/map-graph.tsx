import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTranslation } from 'react-i18next'
import { useSpecimensGraph } from '@/features/search/api/get-occurrences'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEchartsMap } from '@/features/search/api/get-echart-map'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

export function MapGraph({ className = '' }) {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const {
    data,
    isPending,
    error: dataError,
  } = useSpecimensGraph({ customGroupBy: 'country' })

  const {
    geoJson,
    isLoading: isLoadingGeo,
    error: geoError,
  } = useEchartsMap('countries', '/maps/countries.json')

  const countryCountMap = useMemo(() => {
    const map = new Map<string, number>()
    if (data && data.occurrences && Array.isArray(data.occurrences)) {
      data.occurrences.forEach((item) => {
        map.set(item.countryCode, item.count)
      })
    }
    return map
  }, [data])

  const seriesData = useMemo(() => {
    if (!geoJson) return []

    return geoJson.features.map((feature) => {
      //const fipsCode = feature.properties.fips_10
      //ciao
      const fipsCode = feature.properties.iso_a2_eh
      const count = countryCountMap.get(fipsCode) || 0

      return {
        name: feature.properties.name,
        value: Math.log10(count + 1),
        originalValue: count,
        displayName:
          i18n.language === 'it' && feature.properties.name_it
            ? feature.properties.name_it
            : feature.properties.name,
      }
    })
  }, [geoJson, countryCountMap, i18n.language])

  const countryOptions = useMemo(() => {
    if (seriesData.length === 0) return null

    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    const textColor = isDark ? '#ffffff' : '#000000'

    const values = seriesData.map((item) => item.value)
    const minValue = values.length > 0 ? Math.min(...values) : 0
    const maxValue = values.length > 0 ? Math.max(...values) : 1

    return {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          const itemData = params.data
          if (!itemData) return params.name

          const displayName = itemData.displayName || params.name
          const displayValue = itemData.originalValue

          return `${displayName}<br/>${displayValue} ${t('search.results.specimens')}`
        },
      },
      visualMap: {
  min: minValue,
  max: maxValue,
  text: [t('search.results.map-max'), t('search.results.map-min')],
  textStyle: { color: textColor },
  realtime: false,
  calculable: true,
  formatter: function (value) {
    const originalValue = Math.round(Math.pow(10, value) - 1);
    return originalValue.toLocaleString();
  },
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
          map: 'countries',
          roam: false,
          data: seriesData,
          emphasis: {
            label: { show: false },
            itemStyle: { areaColor: '#ffdb58' },
          },
        },
      ],
    }
  }, [seriesData, theme, t])

  const isLoading = isPending || isLoadingGeo
  const isError = dataError || geoError
  const isNoData = countryOptions === null || seriesData.length === 0

  if (isLoading) {
    return (
      <Card className={cn('gap-0 overflow-hidden shadow-xs', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError || isNoData) {
    return (
      <Card className={cn('gap-0 overflow-hidden shadow-xs', className)}>
        <CardHeader>
          <CardTitle>{t('search.results.specimens-country')}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[400px] items-center justify-center">
          <p className="">
            {isError
              ? t('search.results.error-graph')
              : t('search.results.error-no-data')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('gap-0 overflow-hidden shadow-xs', className)}>
      <CardHeader>
        <CardTitle>{t('search.results.specimens-country')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-2 md:p-4">
        <ReactECharts
          option={countryOptions}
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'svg' }}
          notMerge={true}
        />
      </CardContent>
    </Card>
  )
}