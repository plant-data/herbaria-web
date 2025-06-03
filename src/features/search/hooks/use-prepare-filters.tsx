import { useEffect, useState } from 'react'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

export function usePrepareFilters() {
  const [skip, setSkip] = useState(0)
  const {
    scientificName,
    floritalyName,
    country,
    locality,
    year,
    month,
    hasCoordinates
  } = useFilterStore()

  // reset pagination when filters change
  useEffect(() => {
    setSkip(0)
  }, [scientificName, country, locality, year, month, floritalyName, hasCoordinates])

  // uniform to API format
  const filters = {
    scientificName: scientificName,
    floritalyName: floritalyName,
    country: country,
    locality: locality,
    year: (year[0] === 1800 && year[1] === 2025) ? [] : year,
    month: month,
    hasCoordinates
  }

  return {
    filters,
    skip,
    setSkip
  }
}