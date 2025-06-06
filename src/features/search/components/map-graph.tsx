// Your CountryMap.tsx component file
import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTranslation } from 'react-i18next'
import { useSpecimensGraph } from '@/features/search/api/get-occurrences'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEchartsMap } from '@/features/search/api/get-echart-map'
import { cn } from '@/lib/utils'

export function MapGraph({ className = '' }) {
  const { t, i18n } = useTranslation()
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

  // 2. Memoize the transformation of occurrence data into a fast-lookup map.
  const countryCountMap = useMemo(() => {
    const map = new Map<string, number>()
    // Fix: Access the occurrences array from the data object
    if (data && data.occurrences && Array.isArray(data.occurrences)) {
      data.occurrences.forEach((item) => {
        // These are FIPS codes (NH, UZ, NR, etc.)
        map.set(item.country, item.count)
      })
    }
    return map
  }, [data])

  // 3. Memoize the final series data by combining GeoJSON and occurrence counts.
  const seriesData = useMemo(() => {
    if (!geoJson) return []

    return geoJson.features
      .map((feature) => {
        const fipsCode = feature.properties.fips_10 // FIPS code from GeoJSON
        const count = countryCountMap.get(fipsCode) || 0

        return {
          name: feature.properties.name, // Keep original name for ECharts map matching
          value: count,
          // Add localized name for display in tooltips
          displayName:
            i18n.language === 'it' && feature.properties.name_it
              ? feature.properties.name_it
              : feature.properties.name,
        }
      })
      .filter((item) => item.value > 0) // Only include countries with data
  }, [geoJson, countryCountMap, i18n.language])

  // 4. Memoize the final chart options.
  const countryOptions = useMemo(() => {
    if (seriesData.length === 0) return null

    const values = seriesData.map((item) => item.value)
    const minValue = values.length > 0 ? Math.min(...values) : 0
    const maxValue = values.length > 0 ? Math.max(...values) : 1

    return {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          const itemData = params.data
          const displayName = itemData?.displayName || params.name
          return `${displayName}<br/>${params.value} occurrences`
        },
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        text: [t('search.results.map-max'), t('search.results.map-min')],
        realtime: false,
        calculable: true,
        inRange: {
          color: ['#e0f3ff', '#5470c6', '#fac858'], // Adjusted color scheme
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
            itemStyle: { areaColor: '#ffdb58' }, // Add a highlight effect
          },
        },
      ],
    }
  }, [seriesData])

  // 5. Clean, explicit render logic.
  const isLoading = isPending || isLoadingGeo
  const isError = dataError || geoError
  const isNoData = countryOptions === null || seriesData.length === 0

  if (isLoading) {
    return (
      <Card className={cn('shadow-xs overflow-hidden gap-0', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError || isNoData) {
    return (
      <Card className={cn('shadow-xs overflow-hidden gap-0', className)}>
        <CardHeader>
          <CardTitle>{t('search.results.specimens-country')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
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
    <Card className={cn('shadow-xs overflow-hidden gap-0', className)}>
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
