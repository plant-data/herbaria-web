import { postApiClient } from '@/api/post-api-client'
import { BASE_LOCAL_API_URL } from '@/config'
import { ALTITUDE_MAX, ALTITUDE_MIN, MAX_YEAR, MIN_YEAR } from '@/features/search/constants/constants'
import type { FilterState } from '@/features/search/stores/use-filters-store'

/**
 * Client for the local plantdata-resources public API (`/api/v1/herbaria/*`).
 *
 * Only the filter panel talks to it for now: option suggestions with counts
 * (`GET herbaria/facets`) and the year/altitude distributions (`POST herbaria/group`).
 * Every count is conditional on the other applied filters, so both call sites
 * send the same filter state, shaped here once.
 */

// The slice of the filter store the local API understands today. Fields with no
// local equivalent (month, institutionCode, hasCoordinates, floritalyName,
// stateProvince, geometry) are intentionally left out of the mapping.
export type LocalFilterSource = Pick<
  FilterState,
  'scientificName' | 'genus' | 'countryCode' | 'locality' | 'recordedBy' | 'year' | 'altitude' | 'onlyMultisheet'
>

// The shared filter shape accepted by search / facets / group (see
// app/Http/Requests/Search/HerbariaSearchFilters.php). `minimumAltitude` /
// `maximumAltitude` are the deliberate camelCase exception on the backend.
export interface LocalFilterParams {
  filters?: Record<string, Array<string>>
  year_from?: number
  year_to?: number
  minimumAltitude?: number
  maximumAltitude?: number
  only_multisheet?: boolean
}

interface BuildOptions {
  // Omit this field's own selections, so suggesting for it counts values you
  // could still add (mirrors the dashboard).
  excludeField?: string
  // Lift a range so its histogram shows the full distribution under the other
  // filters rather than only the selected span.
  excludeYear?: boolean
  excludeAltitude?: boolean
}

export function buildLocalFilterParams(source: LocalFilterSource, opts: BuildOptions = {}): LocalFilterParams {
  const filters: Record<string, Array<string>> = {}
  const add = (field: string, values: Array<string>) => {
    if (field === opts.excludeField) return
    if (values.length > 0) filters[field] = values
  }

  add('scientificName', source.scientificName)
  add('genus', source.genus)
  add('countryCode', source.countryCode)
  add('locality', source.locality)
  add('recordedBy', source.recordedBy)

  const params: LocalFilterParams = {}
  if (Object.keys(filters).length > 0) params.filters = filters

  // A range equal to its full extent is not a filter — sending the bound would
  // silently drop specimens dated/measured outside the slider's window.
  if (!opts.excludeYear) {
    if (source.year[0] !== MIN_YEAR) params.year_from = source.year[0]
    if (source.year[1] !== MAX_YEAR) params.year_to = source.year[1]
  }
  if (!opts.excludeAltitude) {
    if (source.altitude[0] !== ALTITUDE_MIN) params.minimumAltitude = source.altitude[0]
    if (source.altitude[1] !== ALTITUDE_MAX) params.maximumAltitude = source.altitude[1]
  }
  if (source.onlyMultisheet) params.only_multisheet = true

  return params
}

export interface FacetOption {
  value: string
  count: number
}

interface FacetResponse {
  available: boolean
  field: string
  prefix: string
  options: Array<FacetOption>
}

/**
 * Build the `GET herbaria/facets` URL, encoding the nested filter object as
 * `filters[field][]=value` query parameters.
 */
export function buildFacetUrl(field: string, prefix: string, params: LocalFilterParams, limit = 20): string {
  const search = new URLSearchParams()
  search.set('field', field)
  if (prefix) search.set('prefix', prefix)
  search.set('limit', String(limit))

  if (params.filters) {
    for (const [f, values] of Object.entries(params.filters)) {
      for (const value of values) search.append(`filters[${f}][]`, value)
    }
  }
  if (params.year_from != null) search.set('year_from', String(params.year_from))
  if (params.year_to != null) search.set('year_to', String(params.year_to))
  if (params.minimumAltitude != null) search.set('minimumAltitude', String(params.minimumAltitude))
  if (params.maximumAltitude != null) search.set('maximumAltitude', String(params.maximumAltitude))
  if (params.only_multisheet) search.set('only_multisheet', '1')

  return `${BASE_LOCAL_API_URL}herbaria/facets?${search.toString()}`
}

export async function fetchFacet(
  field: string,
  prefix: string,
  params: LocalFilterParams,
  signal: AbortSignal,
  limit = 20,
): Promise<Array<FacetOption>> {
  const res = await fetch(buildFacetUrl(field, prefix, params, limit), { signal })
  if (!res.ok) {
    throw new Error('Server error')
  }
  const data: FacetResponse = await res.json()
  // `available: false` (index down) surfaces as an empty list, deliberately —
  // the backend keeps a typeahead from reading as broken during an outage.
  return data.available ? data.options : []
}

// A group bucket keeps `value` as a string: it is a year or an elevation band
// for the histograms, but a country code for the country list. Callers coerce.
export interface GroupBucket {
  value: string
  count: number
}

interface GroupResponse {
  data: Array<{ value: string | number; count: number }>
  meta: { field: string; order: string; total_groups: number }
}

export async function fetchGroup(
  field: string,
  order: 'value' | 'count',
  params: LocalFilterParams,
  signal: AbortSignal,
  limit = 800,
): Promise<Array<GroupBucket>> {
  const body = { field, order, limit, ...params }
  const res: GroupResponse = await postApiClient(`${BASE_LOCAL_API_URL}herbaria/group`, body, signal)
  return res.data.map((bucket) => ({ value: String(bucket.value), count: bucket.count }))
}
