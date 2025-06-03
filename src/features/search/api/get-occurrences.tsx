import { useQuery } from '@tanstack/react-query'
import type { FilterStateData } from '@/features/search/stores/use-filters-store'

type SortOptions = 'asc' | 'desc'

type SearchSort = {
  scientificName?: SortOptions
  locality?: SortOptions
}

type SearchFilters = Omit<FilterStateData, 'activeFiltersCount'>

const SEARCH_URL = 'http://localhost:8000/api/v1/occurrences/search'

export default function useSearchOccurrences(
  filters: SearchFilters,
  sort: SearchSort,
  limit: number,
  skip: number,
) {
  return useQuery({
    queryKey: ['search-occurrences', filters, sort, limit, skip],
    queryFn: async ({ signal }) => {
      const searchBody = {
        filters: filters,
        sort: sort,
        skip: skip,
        limit: limit,
      }
      const res = await fetch(SEARCH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchBody),
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
