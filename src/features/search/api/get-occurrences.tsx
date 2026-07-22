import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import type { FilterMapData, FilterStateData } from '@/features/search/stores/use-filters-store'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { ITEMS_PER_PAGE } from '@/config'
import { COMMON_QUERY_OPTIONS } from '@/features/search/constants/constants'
import type { LocalFilterSource, SortClause } from '@/features/search/api/local-backend'
import {
  fetchGroupAs,
  fetchMapCells,
  fetchSpecimens,
  fetchSpecimensCount,
  fetchSpecimensInCell,
} from '@/features/search/api/local-backend'

export type CustomFilters = Partial<FilterStateData & FilterMapData & { sortBy: string }>

// Online sort keys -> the backend's sortable fields (HerbariaSearchSchema::SORT_FIELDS).
const SORT_FIELD_MAP: Record<string, string> = {
  scientificName: 'scientificName',
  family: 'family',
  year: 'eventYear',
  eventYear: 'eventYear',
  month: 'eventMonth',
  eventMonth: 'eventMonth',
}

function toSortClauses(sort: Record<string, 'asc' | 'desc'>): Array<SortClause> {
  return Object.entries(sort)
    .map(([field, direction]) => ({ field: SORT_FIELD_MAP[field], direction }))
    .filter((clause): clause is SortClause => Boolean(clause.field))
}

// The slice of the store the local API reads. Zustand keeps array references
// stable until a setter changes them, so useShallow avoids needless refetches.
function useLocalSource(): LocalFilterSource {
  return useFilterStore(
    useShallow((state) => ({
      scientificName: state.scientificName,
      genus: state.genus,
      countryCode: state.countryCode,
      locality: state.locality,
      recordedBy: state.recordedBy,
      year: state.year,
      altitude: state.altitude,
      onlyMultisheet: state.onlyMultisheet,
      month: state.month,
      institutionCode: state.institutionCode,
      geometry: state.geometry,
    })),
  )
}

// ============================================================================
// Public hooks — same return shapes the components already read
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
  customGroupBy?: string
  enabled?: boolean
}

interface UseSpecimensPointOptions {
  customFilters?: CustomFilters & { decimalLatitude?: number; decimalLongitude?: number }
  customSkip?: number
}

interface UseSpecimensClusterOptions {
  // The map cell to drill into: its centre + size (older gridCode/clusterCode
  // kept optional so callers compile during the migration).
  customFilters?: CustomFilters & {
    lat?: number
    lng?: number
    cellKm?: number
    gridCode?: string
    clusterCode?: string
  }
  customSkip?: number
}

interface UseSpecimensCountOptions {
  customFilters?: CustomFilters
}

export function useSpecimensData(options: UseSpecimensDataOptions = {}) {
  const { customFilters, customSort = { scientificName: 'asc' } } = options
  const source = useLocalSource()
  const skip = useFilterStore((state) => state.skip)
  const merged = { ...source, ...customFilters }
  const sort = toSortClauses(customSort)

  return useQuery({
    queryKey: ['local-data', JSON.stringify(merged), JSON.stringify(sort), skip],
    queryFn: ({ signal }) => fetchSpecimens(merged, { skip, perPage: ITEMS_PER_PAGE, sort }, signal),
    ...COMMON_QUERY_OPTIONS,
  })
}

export function useSpecimensCount(options: UseSpecimensCountOptions = {}) {
  const { customFilters } = options
  const source = useLocalSource()
  const merged = { ...source, ...customFilters }

  return useQuery({
    queryKey: ['local-count', JSON.stringify(merged)],
    queryFn: ({ signal }) => fetchSpecimensCount(merged, signal),
    ...COMMON_QUERY_OPTIONS,
  })
}

export function useSpecimensMap(options: UseSpecimensMapOptions = {}) {
  const { customFilters } = options
  const source = useLocalSource()
  const { zoom, bbox } = useFilterStore(useShallow((state) => ({ zoom: state.zoom, bbox: state.bbox })))
  const merged = { ...source, ...customFilters }

  return useQuery({
    queryKey: ['local-map', JSON.stringify(merged), Math.round(zoom), JSON.stringify(bbox)],
    queryFn: ({ signal }) => fetchMapCells(merged, { zoom, bbox }, signal),
    ...COMMON_QUERY_OPTIONS,
  })
}

export function useSpecimensGraph(options: UseSpecimensGraphOptions = {}) {
  const { customFilters, customGroupBy, enabled = true } = options
  const source = useLocalSource()
  const merged = { ...source, ...customFilters }
  const groupBy = String(customGroupBy ?? '')

  return useQuery({
    queryKey: ['local-graph', groupBy, JSON.stringify(merged)],
    queryFn: ({ signal }) => fetchGroupAs(merged, groupBy, signal),
    ...COMMON_QUERY_OPTIONS,
    enabled,
  })
}

export function useSpecimensPoint(options: UseSpecimensPointOptions = {}) {
  const { customFilters, customSkip = 0 } = options
  const source = useLocalSource()
  const lat = customFilters?.decimalLatitude ?? 0
  const lng = customFilters?.decimalLongitude ?? 0

  return useQuery({
    queryKey: ['local-point', lat, lng, customSkip, JSON.stringify(source)],
    // A single map point is a tiny cell (~1 km) around the coordinate.
    queryFn: ({ signal }) => fetchSpecimensInCell(source, { lat, lng, cellKm: 1, skip: customSkip }, signal),
    ...COMMON_QUERY_OPTIONS,
  })
}

export function useSpecimensCluster(options: UseSpecimensClusterOptions = {}) {
  const { customFilters, customSkip = 0 } = options
  const source = useLocalSource()
  const lat = customFilters?.lat ?? 0
  const lng = customFilters?.lng ?? 0
  const cellKm = customFilters?.cellKm ?? 0

  return useQuery({
    queryKey: ['local-cluster', lat, lng, cellKm, customSkip, JSON.stringify(source)],
    queryFn: ({ signal }) => fetchSpecimensInCell(source, { lat, lng, cellKm, skip: customSkip }, signal),
    ...COMMON_QUERY_OPTIONS,
    enabled: cellKm > 0,
  })
}
