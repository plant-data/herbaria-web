import { useQuery } from '@tanstack/react-query'
import type {
  FilterMapData,
  FilterStateData,
} from '@/features/search/stores/use-filters-store'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { BASE_API_URL, ITEMS_PER_PAGE } from '@/config'

type CustomFilters = Partial<
  FilterStateData & FilterMapData & { sortby: string }
>

const searchConfig = {
  data: {
    url: `${BASE_API_URL}occurrences/search`,
    key: 'specimens-data',
  },
  map: {
    url: `${BASE_API_URL}occurrences/map/search`,
    key: 'specimens-map',
  },
  graph: {
    url: `${BASE_API_URL}occurrences/graph/search`,
    key: 'specimens-graph',
  },
}

function usePrepareFilters(searchType, customFilters = {}, customSort = {}) {
  const {
    scientificName,
    floritalyName,
    country,
    locality,
    year,
    month,
    hasCoordinates,
    skip,
    zoom,
    bbox,
  } = useFilterStore()

  const filters = {
    scientificName: scientificName,
    floritalyName: floritalyName,
    country: country,
    locality: locality,
    year: year[0] === 1800 && year[1] === 2025 ? [] : year,
    month: month,
    hasCoordinates,
  }
  if (searchType === 'map') {
    filters.hasCoordinates = true
    filters.zoom = zoom
    filters.bbox = bbox
  }
  // is customfilters not empty graph sicuro
  if (Object.keys(customFilters).length > 0) {
    Object.assign(filters, customFilters)
  }
  // is customSort not empty
  const sort = Object.keys(customSort).length > 0 ? customSort : {}
  const limit = ITEMS_PER_PAGE

  return { filters, sort, limit, skip }
}

function useSpecimensMap(customFilters: CustomFilters) {
  const { filters } = usePrepareFilters('map', customFilters)
  return useQuery({
    queryKey: [searchConfig.map.key, filters],
    queryFn: async ({ signal }) => {
      const res = await fetch(searchConfig.map.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: filters }),
        signal: signal,
      })
      if (!res.ok) {
        throw new Error('Response not ok')
      }
      return res.json()
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 24 * 60 * 60,
    gcTime: 24 * 60 * 60,
    placeholderData: (prev) => prev,
  })
}

function useSpecimensData(customFilters: CustomFilters) {
  const { filters, sort, limit, skip } = usePrepareFilters(
    'data',
    customFilters,
    { scientificName: 'asc' },
  )
  return useQuery({
    queryKey: [searchConfig.data.key, filters],
    queryFn: async ({ signal }) => {
      const res = await fetch(searchConfig.data.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: filters,
          sort: sort,
          limit: limit,
          skip: skip,
        }),
        signal: signal,
      })
      if (!res.ok) {
        throw new Error('Response not ok')
      }
      return res.json()
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 24 * 60 * 60,
    gcTime: 24 * 60 * 60,
    placeholderData: (prev) => prev,
  })
}

function useSpecimensGraph(customFilters: CustomFilters) {
  const { filters } = usePrepareFilters({
    searchType: 'graph',
    customFilters,
  })
  return useQuery({
    queryKey: [searchConfig.graph.key, filters],
    queryFn: async ({ signal }) => {
      const res = await fetch(searchConfig.graph.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters }),
        signal: signal,
      })
      if (!res.ok) {
        throw new Error('Response not ok')
      }
      return res.json()
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 24 * 60 * 60,
    gcTime: 24 * 60 * 60,
    placeholderData: (prev) => prev,
  })
}
