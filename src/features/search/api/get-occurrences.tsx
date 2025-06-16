import { useQuery } from '@tanstack/react-query'
import type {
  FilterMapData,
  FilterStateData,
} from '@/features/search/stores/use-filters-store'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { postApiClient } from '@/api/post-api-client'
import { ITEMS_PER_PAGE } from '@/config'
import {
  COMMON_QUERY_OPTIONS,
  MAX_YEAR,
  MIN_YEAR,
  SEARCH_CONFIG,
} from '@/features/search/constants/constants'

// ============================================================================
// 1. Configuration & Constants
// ============================================================================

type SearchType = 'data' | 'map' | 'graph' | 'point'

export type CustomFilters = Partial<
  FilterStateData & FilterMapData & { sortBy: string }
>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * A pure utility function to prepare the request payload.
 * It's decoupled from React hooks, making it easily testable.
 * @param storeState - The current state from useFilterStore.
 * @param options - Configuration for the payload preparation.
 * @returns The payload for the API request.
 */
const prepareQueryPayload = (
  storeState: FilterStateData & FilterMapData,
  options: {
    searchType: SearchType
    customFilters?: CustomFilters
    customSort?: Record<string, 'asc' | 'desc'>
    customGroupBy?: keyof CustomFilters | 'count'
  },
) => {
  const {
    searchType,
    customFilters = {},
    customSort = {},
    customGroupBy = {},
  } = options

  // costruiamo il filter
  const filters: CustomFilters = {
    ...storeState,
    ...customFilters,
  }

  delete filters.skip
  delete filters.activeFiltersCount

  if (
    filters.year &&
    filters.year[0] === MIN_YEAR &&
    filters.year[1] === MAX_YEAR
  ) {
    delete filters.year
  }

  if (searchType !== 'map') {
    delete filters.zoom
    delete filters.bbox
  } else {
    // Ensure zoom is an integer for the map API
    if (filters.zoom !== undefined) {
      filters.zoom = Math.round(filters.zoom)
    }
  }

  // Construct the final payload based on the search type.
  switch (searchType) {
    case 'data':
      return {
        filters,
        sort: customSort,
        limit: ITEMS_PER_PAGE,
        skip: storeState.skip,
      }
    case 'graph':
      return {
        filters,
        groupBy: customGroupBy,
      }
    default:
      // 'map' and 'graph' only require filters.
      return { filters }
  }
}

// ============================================================================
// 3. Generic Data Fetching Hook
// ============================================================================

interface UseSpecimensQueryOptions {
  searchType: SearchType
  customFilters?: CustomFilters
  customSort?: Record<string, 'asc' | 'desc'>
  customGroupBy?: keyof CustomFilters | 'count'
}

function useSpecimensQuery({
  searchType,
  customFilters,
  customSort,
  customGroupBy,
}: UseSpecimensQueryOptions) {
  const filterStoreState = useFilterStore()

  const payload = prepareQueryPayload(filterStoreState, {
    searchType,
    customFilters,
    customSort,
    customGroupBy,
  })

  const config = SEARCH_CONFIG[searchType]

  return useQuery({
    // The query key should uniquely identify the data being fetched.
    // The payload's filters object is a good candidate for this.
    queryKey: [
      config.key,
      payload.filters,
      payload.sort,
      payload.limit,
      payload.skip,
      payload.groupBy, // Add this for graph queries
    ].filter(Boolean),
    queryFn: ({ signal }) => postApiClient(config.url, payload, signal),
    ...COMMON_QUERY_OPTIONS,
  })
}

// ============================================================================
// 4. Specific, Public-Facing Hooks (The API for our components)
// ============================================================================

interface UseSpecimensMapOptions {
  customFilters?: CustomFilters
}

interface UseSpecimensDataOptions {
  customFilters?: CustomFilters
  customSort?: Record<string, 'asc' | 'desc'>
}

interface UseSpecimensGraphOptions {
  customFilters?: CustomFilters
  customGroupBy?: keyof CustomFilters | 'count'
}

interface UseSpecimensPointOptions {
  customFilters?: CustomFilters & {
    decimalLatitude?: number
    decimalLongitude?: number
  }
}

export function useSpecimensMap(options: UseSpecimensMapOptions = {}) {
  const { customFilters } = options
  return useSpecimensQuery({ searchType: 'map', customFilters })
}

export function useSpecimensData(options: UseSpecimensDataOptions = {}) {
  const { customFilters, customSort = { scientificName: 'asc' } } = options
  return useSpecimensQuery({
    searchType: 'data',
    customFilters,
    customSort,
  })
}

export function useSpecimensPoint(options: UseSpecimensPointOptions = {}) {
  const { customFilters } = options
  return useSpecimensQuery({
    searchType: 'point',
    customFilters,
  })
}

export function useSpecimensGraph(options: UseSpecimensGraphOptions = {}) {
  const { customFilters, customGroupBy } = options
  return useSpecimensQuery({
    searchType: 'graph',
    customFilters,
    customGroupBy,
  })
}
