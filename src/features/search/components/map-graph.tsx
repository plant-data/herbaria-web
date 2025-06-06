// Your CountryMap.tsx component file
import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useSpecimensGraph } from '@/features/search/api/get-occurrences'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEchartsMap } from '@/features/search/hooks/use-echart-map'
import { cn } from '@/lib/utils'

interface CountryMapProps {
  data: Array<{ country: string; count: number }>
  isPending: boolean
  error: Error | null
}

// A dedicated skeleton for this chart
function MapSkeleton() {
  return (
    <>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </>
  )
}

export function MapGraph({className = ''}) {
  const {
    data,
    isPending,
    error: dataError,
  } = useSpecimensGraph({ customGroupBy: 'country' })

  // 1. Use the custom hook to handle all GeoJSON logic. Clean!
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
          name: feature.properties.name,
          value: count,
        }
      })
      .filter((item) => item.value > 0) // Only include countries with data
  }, [geoJson, countryCountMap])

  // 4. Memoize the final chart options. This is now much simpler.
  const countryOptions = useMemo(() => {
    if (seriesData.length === 0) return null

    const values = seriesData.map((item) => item.value)
    // Handle edge case of an empty array to avoid -Infinity/Infinity
    const minValue = values.length > 0 ? Math.min(...values) : 0
    const maxValue = values.length > 0 ? Math.max(...values) : 1

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{c} occurrences',
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        text: ['High', 'Low'],
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
          map: 'countries', // Use the registered map name
          roam: true,
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
  const displayError = dataError || geoError

  if (displayError) {
    return (
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Occurrences by Country</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px] text-red-600">
          <p>Error loading map data: {displayError.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('shadow-xs overflow-hidden', className)}>
      {isLoading ? (
        <MapSkeleton />
      ) : countryOptions ? (
        <>
          <CardHeader>
            <CardTitle>Occurrences by Country</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-2 md:p-4">
            <ReactECharts
              option={countryOptions}
              style={{ height: '400px', width: '100%' }}
              opts={{ renderer: 'svg' }}
              notMerge={true} // Good practice for dynamic data
            />
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Occurrences by Country</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[400px]">
            <p>No country data available for the current selection.</p>
          </CardContent>
        </>
      )}
    </Card>
  )
}
