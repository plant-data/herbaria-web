import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import type { LockedFilters } from '@/features/search/stores/use-filters-store'
import { BASE_API_URL } from '@/config'
import { Autocomplete } from '@/features/search/components/autocomplete'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { RangeSlider } from '@/features/search/components/range-slider'
import { SelectItems } from '@/features/search/components/select-items'
import {
  HERBARIA,
  MAX_YEAR,
  MIN_YEAR,
  MONTHS,
} from '@/features/search/constants/constants'
import { SwitchOption } from '@/features/search/components/switch-option'

export function SearchFilters({
  lockedFilters,
}: {
  lockedFilters?: LockedFilters
}) {
  const {
    scientificName,
    floritalyName,
    country,
    locality,
    year,
    month,
    institutionCode,
    hasCoordinates,
    setScientificName,
    setFloritalyName,
    setCountry,
    setLocality,
    setYear,
    setMonth,
    setInstitutionCode,
    setHasCoordinates,
  } = useFilterStore(
    useShallow((state) => ({
      scientificName: state.scientificName,
      floritalyName: state.floritalyName,
      country: state.country,
      locality: state.locality,
      year: state.year,
      month: state.month,
      institutionCode: state.institutionCode,
      hasCoordinates: state.hasCoordinates,
      setScientificName: state.setScientificName,
      setFloritalyName: state.setFloritalyName,
      setCountry: state.setCountry,
      setLocality: state.setLocality,
      setYear: state.setYear,
      setMonth: state.setMonth,
      setInstitutionCode: state.setInstitutionCode,
      setHasCoordinates: state.setHasCoordinates,
    })),
  )
  const { t } = useTranslation()

  const handleSetYear = useDebouncedCallback((value: [number, number]) => {
    console.log('SearchFilters: Debounced setYears called with:', value)
    setYear(value)
  }, 500)

  console.log(`${BASE_API_URL}autocomplete?field=scientificName&value=`)

  return (
    <>
      <div className="pt-1"></div>
      <Autocomplete
        label={t('search.filters.scientific-name-label')}
        placeholder={t('search.filters.scientific-name-placeholder')}
        selectedValues={scientificName}
        onSelectedValuesChange={setScientificName}
        queryKey="plantscientificnamesearch"
        query={`${BASE_API_URL}autocomplete?field=scientificName&value=`}
      />
      <Autocomplete
        label={t('search.filters.country-label')}
        placeholder={t('search.filters.country-placeholder')}
        selectedValues={country}
        onSelectedValuesChange={setCountry}
        queryKey="countrysearch"
        query={`${BASE_API_URL}autocomplete?field=scientificName&value=`}
      />
      <Autocomplete
        label={t('search.filters.locality-label')}
        placeholder={t('search.filters.locality-placeholder')}
        selectedValues={locality}
        onSelectedValuesChange={setLocality}
        queryKey="localitysearch"
        query={`${BASE_API_URL}autocomplete?field=locality&value=`}
        minLength={4}
      />
      <Autocomplete
        label={t('search.filters.floritaly-name-label')}
        placeholder={t('search.filters.floritaly-name-placeholder')}
        selectedValues={floritalyName}
        onSelectedValuesChange={setFloritalyName}
        queryKey="floritalysearch"
        query={`${BASE_API_URL}autocomplete?field=floritalyName&value=`}
      />
      <RangeSlider
        label={t('search.filters.year-label')}
        initialValues={year}
        onValuesChange={handleSetYear}
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
      />
      <SelectItems
        label={t('search.filters.month-label')}
        placeholder={t('search.filters.month-placeholder')}
        allSelectedMessage={t('search.filters.month-all-selected')}
        items={MONTHS}
        selectedValues={month}
        onSelectedValuesChange={setMonth}
      />
      {lockedFilters && lockedFilters.includes('institutionCode') ? null : (
        <SelectItems
          label={t('search.filters.institution-code-label')}
          placeholder={t('search.filters.institution-code-placeholder')}
          allSelectedMessage={t('search.filters.institution-code-all-selected')}
          items={HERBARIA}
          selectedValues={institutionCode}
          onSelectedValuesChange={setInstitutionCode}
        />
      )}
      <SwitchOption
        label={t('search.filters.has-coordinates-label')}
        field="coordinates"
        checked={hasCoordinates}
        onCheckedChange={setHasCoordinates}
      />
      <div className="min-h-60 w-full"></div>
    </>
  )
}
