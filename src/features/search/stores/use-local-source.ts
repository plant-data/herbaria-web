import { useShallow } from 'zustand/react/shallow'
import type { LocalFilterSource } from '@/features/search/api/local-backend'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

/**
 * The slice of the filter store the local backend reads, shared by every caller
 * of `buildLocalFilterParams` (the filter panel's counts/histograms and the
 * results/map/graph hooks) so they all send the same conditional filter state.
 * Zustand keeps array references stable until a setter changes them, so
 * `useShallow` avoids needless refetches.
 */
export function useLocalFilterSource(): LocalFilterSource {
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
