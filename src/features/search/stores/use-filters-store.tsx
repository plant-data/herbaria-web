import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { BBOX, MAX_YEAR, MIN_YEAR, SKIP, ZOOM } from '@/features/search/constants/constants'

// skip zoom and bb aren't considered visible filters
export interface FilterStateData {
  scientificName: Array<string>
  floritalyName: Array<string>
  country: Array<string>
  locality: Array<string>
  year: [number, number]
  month: Array<number>
  hasCoordinates: boolean
  activeFiltersCount: number
  skip: number
}

export interface FilterMapData {
  zoom: number
  bbox: [number, number, number, number]
}




interface FilterActions {
  setScientificName: (
    scientificName: Array<string> | ((prev: Array<string>) => Array<string>),
  ) => void
  setFloritalyName: (
    floritalyName: Array<string> | ((prev: Array<string>) => Array<string>),
  ) => void
  setCountry: (
    country: Array<string> | ((prev: Array<string>) => Array<string>),
  ) => void
  setLocality: (
    locality: Array<string> | ((prev: Array<string>) => Array<string>),
  ) => void
  setYear: (
    year: [number, number] | ((prev: [number, number]) => [number, number]),
  ) => void
  setMonth: (
    month: Array<number> | ((prev: Array<number>) => Array<number>),
  ) => void
  setHasCoordinates: (hasCoordinates: boolean) => void
  resetFilters: () => void
  setSkip: (skip: number) => void
  setZoom: (zoom: number) => void
  setBbox: (bbox: [number, number, number, number]) => void
  resetMap: () => void
}

interface FilterState extends FilterStateData, FilterMapData, FilterActions {}

// Initial state values
const initialState: FilterStateData = {
  scientificName: [],
  floritalyName: [],
  country: [],
  locality: [],
  year: [MIN_YEAR, MAX_YEAR],
  month: [],
  hasCoordinates: false,
  activeFiltersCount: 0,
  skip: SKIP,
}
const initialMapState: FilterMapData = {
  zoom: ZOOM,
  bbox: BBOX,
}

// helper function to calculate active filters count
function calculateActiveFiltersCount(state: FilterStateData) {
  let count = 0

  count += state.scientificName.length
  count += state.floritalyName.length
  count += state.country.length
  count += state.locality.length
  count += state.month.length
  if (state.year[0] !== initialState.year[0]) count += 1
  if (state.year[1] !== initialState.year[1]) count += 1
  if (state.hasCoordinates !== initialState.hasCoordinates) count += 1

  return count
}

// function for creating setters is style of react useState
function createSetter<TKey extends keyof FilterStateData>(
  key: TKey,
  actionName: string,
  set: any,
  shouldOrder: boolean = false,
) {
  return (
    value:
      | FilterStateData[TKey]
      | ((prev: FilterStateData[TKey]) => FilterStateData[TKey]),
  ) =>
    set(
      (state: FilterState) => {
        const newValue =
          typeof value === 'function'
            ? (value as (prev: FilterStateData[TKey]) => FilterStateData[TKey])(
                state[key],
              )
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
          skip: SKIP,
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
      setScientificName: createSetter(
        'scientificName',
        'setScientificName',
        set,
        true,
      ),
      setFloritalyName: createSetter(
        'floritalyName',
        'setFloritalyName',
        set,
        true,
      ),
      setCountry: createSetter('country', 'setCountry', set, true),
      setLocality: createSetter('locality', 'setLocality', set, true),
      setYear: createSetter('year', 'setYear', set),
      setMonth: createSetter('month', 'setMonth', set, true),
      setHasCoordinates: createSetter(
        'hasCoordinates',
        'setHasCoordinates',
        set,
      ),

      // Reset all filters to initial values
      resetFilters: () => set(initialState, false, 'resetFilters'),
      // replace skip with number
      setSkip: (newSkip: number) => set({ skip: newSkip }, false, 'setSkip'),
      setZoom: (newZoom: number) => set({ zoom: newZoom }, false, 'setZoom'),
      setBbox: (newBbox: [number, number, number, number]) => set({ bbox: newBbox }, false, 'setBbox'),
      resetMap: () => set(initialMapState, false, 'resetMap'),
    }),
    {
      name: 'filter-store',
    },
  ),
)
