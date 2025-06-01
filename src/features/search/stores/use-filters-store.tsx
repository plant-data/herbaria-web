import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AutocompleteItem } from '@/components/autocomplete/autocomplete-generic-box'

// Define the state interface for clear typing
interface FilterState {
  // State properties
  scientificNames: Array<AutocompleteItem>
  floritalyNames: Array<AutocompleteItem>
  countries: Array<AutocompleteItem>
  locality: Array<AutocompleteItem>
  years: [number, number]
  months: Array<number>
  hasCoordinates: boolean
  activeFiltersCount: number

  // Actions
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

// Initial state values
const initialState = {
  scientificNames: [],
  floritalyNames: [],
  countries: [],
  locality: [],
  years: [1800, 2025],
  months: [],
  hasCoordinates: false,
  activeFiltersCount: 0,
}

// Helper function to calculate active filters count
const calculateActiveFiltersCount = (state: Omit<FilterState, 'activeFiltersCount' | 'setScientificNames' | 'setFloritalyNames' | 'setCountries' | 'setLocality' | 'setYears' | 'setMonths' | 'setHasCoordinates' | 'resetFilters'>) => {
  let count = 0
  
  // Count array filters
  count += state.scientificNames.length
  count += state.floritalyNames.length
  count += state.countries.length
  count += state.locality.length
  count += state.months.length
  
  // Count years - +1 if first value changed, +1 if second value changed
  if (state.years[0] !== initialState.years[0]) count += 1
  if (state.years[1] !== initialState.years[1]) count += 1
  
  // Count boolean - +1 if changed from initial state
  if (state.hasCoordinates !== initialState.hasCoordinates) count += 1
  
  return count
}

// Create the store with devtools middleware for better debugging
export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      setScientificNames: (scientificNames) =>
        set(
          (state) => {
            const newValue =
              typeof scientificNames === 'function'
                ? scientificNames(state.scientificNames)
                : scientificNames
            const newState = { scientificNames: newValue }
            return { 
              ...newState, 
              activeFiltersCount: calculateActiveFiltersCount({ ...state, ...newState })
            }
          },
          false,
          'setScientificNames',
        ),

      setFloritalyNames: (floritalyNames) =>
        set(
          (state) => {
            const newValue =
              typeof floritalyNames === 'function'
                ? floritalyNames(state.floritalyNames)
                : floritalyNames
            const newState = { floritalyNames: newValue }
            return { 
              ...newState, 
              activeFiltersCount: calculateActiveFiltersCount({ ...state, ...newState })
            }
          },
          false,
          'setFloritalyNames',
        ),

      setCountries: (countries) =>
        set(
          (state) => {
            const newValue =
              typeof countries === 'function'
                ? countries(state.countries)
                : countries
            const newState = { countries: newValue }
            return { 
              ...newState, 
              activeFiltersCount: calculateActiveFiltersCount({ ...state, ...newState })
            }
          },
          false,
          'setCountries',
        ),

      setLocality: (locality) =>
        set(
          (state) => {
            const newValue =
              typeof locality === 'function'
                ? locality(state.locality)
                : locality
            const newState = { locality: newValue }
            return { 
              ...newState, 
              activeFiltersCount: calculateActiveFiltersCount({ ...state, ...newState })
            }
          },
          false,
          'setLocality',
        ),
      setYears: (years) =>
        set(
          (state) => {
            const newValue =
              typeof years === 'function' ? years(state.years) : years
            const newState = { years: newValue }
            return { 
              ...newState, 
              activeFiltersCount: calculateActiveFiltersCount({ ...state, ...newState })
            }
          },
          false,
          'setYears',
        ),

      setMonths: (months) =>
        set(
          (state) => {
            const newValue =
              typeof months === 'function' ? months(state.months) : months
            const newState = { months: newValue }
            return { 
              ...newState, 
              activeFiltersCount: calculateActiveFiltersCount({ ...state, ...newState })
            }
          },
          false,
          'setMonths',
        ),
      setHasCoordinates: (hasCoordinates) =>
        set(
          (state) => {
            const newState = { hasCoordinates }
            return { 
              ...newState, 
              activeFiltersCount: calculateActiveFiltersCount({ ...state, ...newState })
            }
          }, 
          false, 
          'setHasCoordinates'
        ),

      // Reset all filters to initial values
      resetFilters: () => set(initialState, false, 'resetFilters'),
    }),
    {
      name: 'filter-store',
    },
  ),
)
