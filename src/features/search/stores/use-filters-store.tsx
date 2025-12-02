import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { BBOX, MAP_CENTER, MAX_YEAR, MIN_YEAR, SKIP, ZOOM } from '@/features/search/constants/constants'

// skip zoom and bb aren't considered visible filters
export interface FilterStateData {
  scientificName: Array<string>

  genus: Array<string>
  country: Array<string>
  countryCode: Array<string>
  locality: Array<string>
  geometry: Array<[number, number]>
  year: [number, number]
  month: Array<number>
  institutionCode: Array<string>
  hasCoordinates: boolean
  floritalyName: Array<string>
  stateProvince: Array<string>
  activeFiltersCount: number
  skip: number
}

// used for pages of custom herbaria
export type LockedFilters = Array<keyof Omit<FilterStateData, 'skip' | 'activeFiltersCount'>>

export interface FilterMapData {
  zoom: number
  bbox: [number, number, number, number]
  mapCenter: [number, number]
}

interface FilterActions {
  setScientificName: (scientificName: Array<string> | ((prev: Array<string>) => Array<string>)) => void
  setGenus: (genus: Array<string> | ((prev: Array<string>) => Array<string>)) => void
  setCountry: (country: Array<string> | ((prev: Array<string>) => Array<string>)) => void
  setCountryCode: (countryCode: Array<string> | ((prev: Array<string>) => Array<string>)) => void
  setLocality: (locality: Array<string> | ((prev: Array<string>) => Array<string>)) => void
  setGeometry: (
    geometry: Array<[number, number]> | ((prev: Array<[number, number]>) => Array<[number, number]>),
  ) => void
  setYear: (year: [number, number] | ((prev: [number, number]) => [number, number])) => void
  setMonth: (month: Array<number> | ((prev: Array<number>) => Array<number>)) => void
  setInstitutionCode: (institutionCode: Array<string> | ((prev: Array<string>) => Array<string>)) => void
  setInstitutionCodeNoResetSkip: (institutionCode: Array<string> | ((prev: Array<string>) => Array<string>)) => void
  setHasCoordinates: (hasCoordinates: boolean) => void
  setStateProvince: (stateProvinces: Array<string> | ((prev: Array<string>) => Array<string>)) => void
  setFloritalyName: (floritalyName: Array<string> | ((prev: Array<string>) => Array<string>)) => void

  resetFilters: (lockedFilters?: LockedFilters) => void
  setSkip: (skip: number) => void
  setZoom: (zoom: number) => void
  setBbox: (bbox: [number, number, number, number]) => void
  setMapCenter: (mapCenter: [number, number]) => void
  resetMap: () => void
}

export interface FilterState extends FilterStateData, FilterMapData, FilterActions {}

// Initial state values
const initialState: FilterStateData = {
  scientificName: [],

  genus: [],
  country: [],
  countryCode: [],
  locality: [],
  geometry: [],
  year: [MIN_YEAR, MAX_YEAR],
  month: [],
  institutionCode: [],
  hasCoordinates: false,
  floritalyName: [],
  stateProvince: [],
  activeFiltersCount: 0,
  skip: SKIP,
}
const initialMapState: FilterMapData = {
  zoom: ZOOM,
  bbox: BBOX,
  mapCenter: MAP_CENTER,
}

// helper function to calculate active filters count
function calculateActiveFiltersCount(state: FilterStateData) {
  let count = 0

  count += state.scientificName.length
  count += state.genus.length
  count += state.country.length
  count += state.countryCode.length
  count += state.locality.length
  if (state.geometry.length > 0) count += 1
  count += state.month.length
  count += state.institutionCode.length
  if (state.year[0] !== initialState.year[0]) count += 1
  if (state.year[1] !== initialState.year[1]) count += 1
  if (state.hasCoordinates !== initialState.hasCoordinates) count += 1
  count += state.stateProvince.length
  count += state.floritalyName.length

  return count
}

// function for creating setters is style of react useState
function createSetter<TKey extends keyof FilterStateData>(
  key: TKey,
  actionName: string,
  set: any,
  shouldOrder: boolean = false,
  shouldResetSkip: boolean = true,
) {
  return (value: FilterStateData[TKey] | ((prev: FilterStateData[TKey]) => FilterStateData[TKey])) =>
    set(
      (state: FilterState) => {
        const newValue =
          typeof value === 'function'
            ? (value as (prev: FilterStateData[TKey]) => FilterStateData[TKey])(state[key])
            : value

        // Order the value if it's an array and shouldOrder is true
        const orderedValue =
          shouldOrder && Array.isArray(newValue)
            ? [...newValue].sort((a, b) => {
                // Sort numbers numerically, strings alphabetically
                if (typeof a === 'number' && typeof b === 'number') {
                  return a - b
                }
                return String(a).localeCompare(String(b))
              })
            : newValue

        const newState = { [key]: orderedValue } as Partial<FilterStateData>
        const updatedState = { ...state, ...newState }

        return {
          ...newState,
          activeFiltersCount: calculateActiveFiltersCount(updatedState),
          skip: shouldResetSkip ? SKIP : state.skip,
        }
      },
      false,
      actionName,
    )
}

export const useFilterStore = create<FilterState>()(
  devtools(
    (set) => ({
      // Initial state
      ...initialState,
      ...initialMapState,

      // Actions using the helper
      setScientificName: createSetter('scientificName', 'setScientificName', set, true),
      setGenus: createSetter('genus', 'setGenus', set, true),
      setCountry: createSetter('country', 'setCountry', set, true),
      setCountryCode: createSetter('countryCode', 'setCountryCode', set, true),
      setLocality: createSetter('locality', 'setLocality', set, true),
      setGeometry: createSetter('geometry', 'setGeometry', set, false),
      setYear: createSetter('year', 'setYear', set),
      setMonth: createSetter('month', 'setMonth', set, true),
      setInstitutionCode: createSetter('institutionCode', 'setInstitutionCode', set, true),
      setInstitutionCodeNoResetSkip: createSetter('institutionCode', 'setInstitutionCodeNoResetSkip', set, true, false),
      setHasCoordinates: createSetter('hasCoordinates', 'setHasCoordinates', set),
      setFloritalyName: createSetter('floritalyName', 'setFloritalyName', set, true),
      setStateProvince: createSetter('stateProvince', 'setStateProvince', set, true),
      // Reset all filters to initial values, preserving locked filters
      resetFilters: (lockedFilters?: LockedFilters) =>
        set(
          (state) => {
            const resetState = { ...initialState }

            // If there are locked filters, preserve their current values
            if (lockedFilters && lockedFilters.length > 0) {
              lockedFilters.forEach((filterKey) => {
                if (filterKey in state) {
                  ;(resetState as any)[filterKey] = state[filterKey]
                }
              })

              // Recalculate active filters count with locked filters preserved
              resetState.activeFiltersCount = calculateActiveFiltersCount(resetState)
            }

            return resetState
          },
          false,
          'resetFilters',
        ),

      // map setters
      setSkip: (newSkip: number) => set({ skip: newSkip }, false, 'setSkip'),
      setZoom: (newZoom: number) => set({ zoom: newZoom }, false, 'setZoom'),
      setBbox: (newBbox: [number, number, number, number]) => set({ bbox: newBbox }, false, 'setBbox'),
      setMapCenter: (newMapCenter: [number, number]) => set({ mapCenter: newMapCenter }, false, 'setMapCenter'),
      resetMap: () => set(initialMapState, false, 'resetMap'),
    }),
    {
      name: 'filter-store',
    },
  ),
)
