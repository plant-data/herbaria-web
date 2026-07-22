import { postApiClient } from '@/api/post-api-client'
import { BASE_LOCAL_API_URL } from '@/config'
import { ALTITUDE_MAX, ALTITUDE_MIN, MAX_YEAR, MIN_YEAR } from '@/features/search/constants/constants'
import { datasetIdForCode } from '@/features/search/constants/herbaria'
import type { FilterState } from '@/features/search/stores/use-filters-store'
import type { SpecimenData } from '@/features/search/types/types'

/**
 * Client for the local plantdata-resources public API (`/api/v1/herbaria/*`).
 *
 * Every specimen view (filters, results, images, map, graphs, detail) talks to
 * it. It shapes the store into the backend's shared filter body once, and maps
 * the backend's `{data, meta}` responses back into the shapes the components
 * already expect (`{occurrences, count}`, `{clusters}`, `{occurrences:[{[key],count}]}`).
 */

// The slice of the filter store the local API understands. `hasCoordinates`,
// `floritalyName` and `stateProvince` have no local equivalent and are left out.
export type LocalFilterSource = Pick<
  FilterState,
  | 'scientificName'
  | 'genus'
  | 'countryCode'
  | 'locality'
  | 'recordedBy'
  | 'year'
  | 'altitude'
  | 'onlyMultisheet'
  | 'month'
  | 'institutionCode'
  | 'geometry'
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
  // Free-text place fragment, matched full-text against the locality field —
  // not a facet value. This is the dashboard's locality behaviour.
  locality?: string
  only_multisheet?: boolean
  // A drawn shape, as a `geo` URL string (polygon from the store geometry, or a
  // rect for a map-cell drill-down).
  geo?: string
}

interface BuildOptions {
  // Omit this field's own selections, so suggesting for it counts values you
  // could still add (mirrors the dashboard).
  excludeField?: string
  // Lift a range so its histogram shows the full distribution under the other
  // filters rather than only the selected span.
  excludeYear?: boolean
  excludeAltitude?: boolean
  // Drop the committed locality, so its own preview count is for the text being
  // typed rather than doubly constrained by what is already committed.
  excludeLocality?: boolean
}

export function buildLocalFilterParams(source: LocalFilterSource, opts: BuildOptions = {}): LocalFilterParams {
  const filters: Record<string, Array<string>> = {}
  const add = (field: string, values: Array<string>) => {
    if (field === opts.excludeField) return
    if (values.length > 0) filters[field] = values
  }

  // Some callers (the filter panel) pass only a subset, so the fields added
  // here are read defensively.
  add('scientificName', source.scientificName)
  add('genus', source.genus)
  add('countryCode', source.countryCode)
  add('recordedBy', source.recordedBy)
  // Month picks map to the `eventMonth` facet (integers as strings).
  add(
    'eventMonth',
    (source.month ?? []).map((m) => String(m)),
  )
  // Collection scope: the institution code (URL segment / filter) resolves to
  // the backend's integer dataset_id.
  add(
    'dataset_id',
    (source.institutionCode ?? [])
      .map(datasetIdForCode)
      .filter((id): id is number => id != null)
      .map(String),
  )

  const params: LocalFilterParams = {}
  if (Object.keys(filters).length > 0) params.filters = filters

  // A drawn polygon becomes a `geo` shape (lat,lng pairs). Needs at least three
  // vertices to enclose anything.
  const geometry = source.geometry ?? []
  if (geometry.length >= 3) {
    params.geo = 'polygon:' + geometry.map(([lat, lng]) => `${lat},${lng}`).join(',')
  }

  // Locality is free text, not a facet: the committed fragments ride on the
  // top-level `locality` param, matched full-text like the dashboard. Several
  // badges are sent together as one space-joined query — the backend's locality
  // search already token-matches, so it needs no schema change to take more
  // than one place.
  if (!opts.excludeLocality && source.locality.length > 0) params.locality = source.locality.join(' ')

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
  if (params.locality) search.set('locality', params.locality)
  if (params.geo) search.set('geo', params.geo)
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

interface SearchMetaResponse {
  meta: { total: number }
}

/**
 * How many specimens match a locality fragment under the other applied filters.
 * The public API has no dedicated count endpoint, so this asks `search` for a
 * single row and reads the total — the cheapest way to get the number the
 * dashboard's locality box shows. Throws on a 503 (index down); the caller
 * treats that as "count unavailable".
 */
export async function fetchLocalityCount(
  query: string,
  params: LocalFilterParams,
  signal: AbortSignal,
): Promise<number> {
  const body = { ...params, locality: query, per_page: 1 }
  const res: SearchMetaResponse = await postApiClient(`${BASE_LOCAL_API_URL}herbaria/search`, body, signal)
  return res.meta.total
}

// ============================================================================
// Specimen results, map cells, graphs, detail — response adapters
// ============================================================================

// A row of POST herbaria/search, from HerbariaSpecimenResource.
interface LocalSpecimenRow {
  occurrenceID: string | null
  catalogNumber: string | null
  scientificName: string | null
  family: string | null
  genus: string | null
  recordedBy: string | null
  identifiedBy: string | null
  eventDate: string | null
  eventYear: number | null
  eventMonth: number | null
  eventDay: number | null
  locality: string | null
  verbatimLocality: string | null
  countryCode: string | null
  location: { lat: number; lng: number } | null
  datasetId: number | null
  sheetImageLink: string | null
  coverImageLink: string | null
  associatedMultisheetImages: Array<string> | null
}

interface SearchResponse {
  data: Array<LocalSpecimenRow>
  meta: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

/**
 * A backend row → the `SpecimenData` shape the views read. `location` becomes
 * decimal lat/lng; the image links become a synthesized `multimedia` array
 * (`imageRole: 'primary'` first, so table/gallery thumbnails and the detail
 * viewer keep working). Italy-only fields (floritaly*) have no source and are
 * null. Extra columns (family, genus, verbatimLocality, datasetId) ride along
 * via SpecimenData's `Record<string, unknown>` escape hatch.
 */
export function mapSpecimen(row: LocalSpecimenRow): SpecimenData {
  const multimedia: SpecimenData['multimedia'] = []
  const primary = row.sheetImageLink || row.coverImageLink
  if (primary) {
    multimedia.push({
      type: 'StillImage',
      identifier: primary,
      imageRole: 'primary',
      thumbnailUrl: primary,
      imageUrl: primary,
    })
  }
  for (const url of row.associatedMultisheetImages ?? []) {
    if (!url) continue
    multimedia.push({ type: 'StillImage', identifier: url, imageRole: 'secondary', thumbnailUrl: url, imageUrl: url })
  }

  return {
    occurrenceID: row.occurrenceID ?? '',
    catalogNumber: row.catalogNumber ?? null,
    otherCatalogNumbers: null,
    basisOfRecord: null,
    verbatimIdentification: null,
    scientificName: row.scientificName ?? null,
    verbatimEventDate: null,
    eventDate: row.eventDate ?? null,
    year: row.eventYear ?? null,
    month: row.eventMonth ?? null,
    locality: row.locality ?? null,
    verbatimElevation: null,
    minimumElevationInMeters: null,
    maximumElevationInMeters: null,
    country: null,
    countryCode: row.countryCode ?? null,
    recordedBy: row.recordedBy ?? null,
    identifiedBy: row.identifiedBy ?? null,
    floritalyName: null,
    floritalyId: null,
    wfoName: null,
    gbifName: null,
    processedLocality: null,
    decimalLatitude: row.location?.lat ?? null,
    decimalLongitude: row.location?.lng ?? null,
    geodeticDatum: null,
    coordinatesUncertaintyInMeters: null,
    georeferenceProtocol: null,
    multimedia,
    // Extras read by table / detail, allowed by the Record<string, unknown> hatch.
    verbatimLocality: row.verbatimLocality ?? null,
    family: row.family ?? null,
    genus: row.genus ?? null,
    datasetId: row.datasetId ?? null,
  }
}

export interface SortClause {
  field: string
  direction: 'asc' | 'desc'
}

export interface SpecimensResult {
  occurrences: Array<SpecimenData>
  count: number
}

/**
 * A page of specimens plus the total. `skip`/`per_page` (the app's convention)
 * become the backend's `page`/`per_page`.
 */
export async function fetchSpecimens(
  source: LocalFilterSource,
  opts: { skip: number; perPage: number; sort?: Array<SortClause> },
  signal: AbortSignal,
): Promise<SpecimensResult> {
  const params = buildLocalFilterParams(source)
  const page = Math.floor(opts.skip / opts.perPage) + 1
  const body = {
    ...params,
    page,
    per_page: opts.perPage,
    ...(opts.sort && opts.sort.length > 0 ? { sort: opts.sort } : {}),
  }
  const res: SearchResponse = await postApiClient(`${BASE_LOCAL_API_URL}herbaria/search`, body, signal)
  return { occurrences: res.data.map(mapSpecimen), count: res.meta.total }
}

/** Just the total matching count (a one-row search — the API has no count endpoint). */
export async function fetchSpecimensCount(source: LocalFilterSource, signal: AbortSignal): Promise<{ count: number }> {
  const params = buildLocalFilterParams(source)
  const res: SearchMetaResponse = await postApiClient(
    `${BASE_LOCAL_API_URL}herbaria/search`,
    { ...params, per_page: 1 },
    signal,
  )
  return { count: res.meta.total }
}

export interface MapCluster {
  coordinates: [number, number] // [lng, lat]
  count: number
  gridCode: string
  cellKm: number
}

interface MapResponse {
  data: Array<{ lat: number; lng: number; count: number }>
  meta: { cell_km: number }
}

/**
 * The density grid for the current viewport, reshaped into the `clusters` the
 * map component already draws. Each cell carries a `gridCode` (so it renders as
 * a density circle, not a pin) and `cellKm` (so a click can search its area).
 */
export async function fetchMapCells(
  source: LocalFilterSource,
  opts: { zoom: number; bbox: [number, number, number, number] },
  signal: AbortSignal,
): Promise<{ clusters: Array<MapCluster> }> {
  const params = buildLocalFilterParams(source)
  const body = { ...params, zoom: Math.round(opts.zoom), bbox: opts.bbox }
  const res: MapResponse = await postApiClient(`${BASE_LOCAL_API_URL}herbaria/map`, body, signal)
  const cellKm = res.meta.cell_km
  return {
    clusters: res.data.map((cell) => ({
      coordinates: [cell.lng, cell.lat],
      count: cell.count,
      gridCode: `${cell.lat},${cell.lng}`,
      cellKm,
    })),
  }
}

/**
 * The specimens inside one density cell, for the drill-down popup. The public
 * API has no cell lookup, so a `geo` rectangle around the cell centre stands in
 * (the map's own `cell_km` sizes it). Overrides any drawn polygon in `geo`.
 */
export async function fetchSpecimensInCell(
  source: LocalFilterSource,
  opts: { lat: number; lng: number; cellKm: number; skip: number },
  signal: AbortSignal,
): Promise<{ occurrences: Array<SpecimenData> }> {
  const params = buildLocalFilterParams(source)
  const dLat = opts.cellKm / 2 / 111
  const dLng = opts.cellKm / 2 / (111 * Math.cos((opts.lat * Math.PI) / 180) || 1)
  const geo = `rect:${opts.lat - dLat},${opts.lng - dLng},${opts.lat + dLat},${opts.lng + dLng}`
  const body = { ...params, geo, per_page: 10, page: Math.floor(opts.skip / 10) + 1 }
  const res: SearchResponse = await postApiClient(`${BASE_LOCAL_API_URL}herbaria/search`, body, signal)
  return { occurrences: res.data.map(mapSpecimen) }
}

// The graph groupBys the UI asks for → the backend group field + the out-key
// the chart reads. `floritalyName`/`stateProvince` have no local field.
const GROUP_FIELD_MAP: Record<string, { field: string; outKey: string; order: 'count' | 'value'; limit: number }> = {
  scientificName: { field: 'scientificName', outKey: 'scientificName', order: 'count', limit: 20 },
  year: { field: 'eventYear', outKey: 'year', order: 'value', limit: 800 },
  month: { field: 'eventMonth', outKey: 'month', order: 'value', limit: 12 },
  country: { field: 'countryCode', outKey: 'countryCode', order: 'count', limit: 300 },
  elevationBand: { field: 'elevation_band', outKey: 'elevationBand', order: 'value', limit: 800 },
}

export interface GraphResult {
  occurrences: Array<Record<string, string | number>>
}

/**
 * Grouped counts for a chart, reshaped to `{occurrences:[{[outKey]:value,count}]}`.
 * Unmapped groupBys (Italy-only) return an empty set so their charts render empty.
 */
export async function fetchGroupAs(
  source: LocalFilterSource,
  groupBy: string,
  signal: AbortSignal,
): Promise<GraphResult> {
  const mapping = GROUP_FIELD_MAP[groupBy]
  if (!mapping) return { occurrences: [] }
  const params = buildLocalFilterParams(source)
  const buckets = await fetchGroup(mapping.field, mapping.order, params, signal, mapping.limit)
  return { occurrences: buckets.map((bucket) => ({ [mapping.outKey]: bucket.value, count: bucket.count })) }
}

/**
 * One specimen by occurrenceID. The public API has no by-id route, so this is a
 * `q` search (occurrenceID is weighted in query_by and returns a single hit).
 */
export async function fetchSpecimenById(occurrenceID: string, signal?: AbortSignal): Promise<SpecimenData | null> {
  const sig = signal ?? new AbortController().signal
  const res: SearchResponse = await postApiClient(
    `${BASE_LOCAL_API_URL}herbaria/search`,
    { q: occurrenceID, per_page: 1 },
    sig,
  )
  const row = res.data.find((r) => r.occurrenceID === occurrenceID) ?? res.data[0]
  return row ? mapSpecimen(row) : null
}
