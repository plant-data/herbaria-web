// src/hooks/useEchartsMap.ts (or .js)
import * as echarts from 'echarts/core'
import { useQuery } from '@tanstack/react-query'
import { COMMON_QUERY_OPTIONS } from '@/features/search/constants/constants'

// Define a type for the GeoJSON structure for better safety
interface GeoJson {
  type: string
  features: Array<{
    type: string
    properties: Record<string, any>
    geometry: any
  }>
}

// Keep track of which maps are already registered globally to avoid re-registering.
// This is still necessary because echarts.registerMap is a global, one-time operation.
const registeredMaps = new Set<string>()

/**
 * Fetches and registers a GeoJSON map for use with ECharts using React Query.
 * @param mapName The name to register the map under (e.g., 'countries').
 * @param geoJsonUrl The public URL to the GeoJSON file.
 * @returns A React Query result object with the map data.
 */
export function useEchartsMap(mapName: string, geoJsonUrl: string) {
  // The fetcher function
  const fetchGeoJson = async (): Promise<GeoJson> => {
    const response = await fetch(geoJsonUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch map data: ${response.statusText}`)
    }
    const data = await response.json()
    if (!registeredMaps.has(mapName)) {
      echarts.registerMap(mapName, data)
      registeredMaps.add(mapName)
      console.log(`ECharts map '${mapName}' registered successfully.`)
    }
    return data
  }

  const queryResult = useQuery({
    queryKey: ['countryMap', mapName],
    queryFn: fetchGeoJson,

    ...COMMON_QUERY_OPTIONS,
  })

  // Return the query result, renaming 'data' to 'geoJson' for clarity.
  return {
    geoJson: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
  }
}
