import { useEffect, useState } from 'react'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

export function usePrepareFilters() {

  const {
    scientificName,
    floritalyName,
    country,
    locality,
    year,
    month,
    hasCoordinates,
    skip,
    setSkip
  } = useFilterStore()

  // reset pagination when filters change

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