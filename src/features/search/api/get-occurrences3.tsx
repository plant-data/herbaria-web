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

type SearchType = 'data' | 'map' | 'graph'

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
  const { searchType, customFilters = {}, customSort = {}, customGroupBy = {} } = options
  const { ...baseFiltersFromStore } = storeState

  // costruiamo il filter
  const filters: CustomFilters = {
    ...baseFiltersFromStore,
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
        groupBy: customGroupBy
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
    queryKey: [config.key, payload.filters, payload.sort, payload.limit, payload.skip],
    queryFn: ({ signal }) => postApiClient(config.url, payload, signal),
    ...COMMON_QUERY_OPTIONS,
  })
}

// ============================================================================
// 4. Specific, Public-Facing Hooks (The API for our components)
// ============================================================================

export function useSpecimensMap(customFilters: CustomFilters = {}) {
  return useSpecimensQuery({ searchType: 'map', customFilters })
}

export function useSpecimensData(customFilters: CustomFilters = {}) {
  return useSpecimensQuery({
    searchType: 'data',
    customFilters,
    customSort: { scientificName: 'asc' },
  })
}

export function useSpecimensGraph(customFilters: CustomFilters = {}) {
  return useSpecimensQuery({ searchType: 'graph', customFilters })
}
