import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface AutocompleteItem {
  id: number
  value: string
}

interface FilterStateData {
  scientificNames: Array<AutocompleteItem>
  floritalyNames: Array<AutocompleteItem>
  countries: Array<AutocompleteItem>
  locality: Array<AutocompleteItem>
  years: [number, number]
  months: Array<number>
  hasCoordinates: boolean
  activeFiltersCount: number
}
interface FilterActions {
  setScientificNames: (
    scientificNames:
      | Array<AutocompleteItem>
      | ((prev: Array<AutocompleteItem>) => Array<AutocompleteItem>),
  ) => void
  setFloritalyNames: (
    floritalyNames:
      | Array<AutocompleteItem>
      | ((prev: Array<AutocompleteItem>) => Array<AutocompleteItem>),
  ) => void
  setCountries: (
    countries:
      | Array<AutocompleteItem>
      | ((prev: Array<AutocompleteItem>) => Array<AutocompleteItem>),
  ) => void
  setLocality: (
    locality:
      | Array<AutocompleteItem>
      | ((prev: Array<AutocompleteItem>) => Array<AutocompleteItem>),
  ) => void
  setYears: (
    years: [number, number] | ((prev: [number, number]) => [number, number]),
  ) => void
  setMonths: (
    months: Array<number> | ((prev: Array<number>) => Array<number>),
  ) => void
  setHasCoordinates: (hasCoordinates: boolean) => void
  resetFilters: () => void
}

interface FilterState extends FilterStateData, FilterActions {}

// Initial state values
const initialState: FilterStateData = {
  scientificNames: [],
  floritalyNames: [],
  countries: [],
  locality: [],
  years: [1800, 2025],
  months: [],
  hasCoordinates: false,
  activeFiltersCount: 0,
}

// helper function to calculate active filters count
function calculateActiveFiltersCount(state: FilterStateData) {
  let count = 0

  count += state.scientificNames.length
  count += state.floritalyNames.length
  count += state.countries.length
  count += state.locality.length
  count += state.months.length
  if (state.years[0] !== initialState.years[0]) count += 1
  if (state.years[1] !== initialState.years[1]) count += 1
  if (state.hasCoordinates !== initialState.hasCoordinates) count += 1

  return count
}

// function for creating setters is style of react useState
function createSetter<TKey extends keyof FilterStateData>(
  key: TKey,
  actionName: string,
  set: any,
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

        const newState = { [key]: newValue } as Partial<FilterStateData>
        const updatedState = { ...state, ...newState }

        return {
          ...newState,
          activeFiltersCount: calculateActiveFiltersCount(updatedState),
        }
      },
      false,
      actionName,
    )
}

export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions using the helper
      setScientificNames: createSetter(
        'scientificNames',
        'setScientificNames',
        set,
      ),
      setFloritalyNames: createSetter(
        'floritalyNames',
        'setFloritalyNames',
        set,
      ),
      setCountries: createSetter('countries', 'setCountries', set),
      setLocality: createSetter('locality', 'setLocality', set),
      setYears: createSetter('years', 'setYears', set),
      setMonths: createSetter('months', 'setMonths', set),
      setHasCoordinates: createSetter(
        'hasCoordinates',
        'setHasCoordinates',
        set,
      ),

      // Reset all filters to initial values
      resetFilters: () => set(initialState, false, 'resetFilters'),
    }),
    {
      name: 'filter-store',
    },
  ),
)
