import { useTranslation } from 'react-i18next'
import { useParams } from '@tanstack/react-router'
import { useShallow } from 'zustand/react/shallow'
import type { LockedFilters } from '@/features/search/stores/use-filters-store'
import { BASE_API_URL } from '@/config'
import { Autocomplete } from '@/features/search/components/autocomplete'
import { AutocompletePrefetch } from '@/features/search/components/autocomplete-prefetch'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { RangeSlider } from '@/features/search/components/range-slider'
import { SelectItems } from '@/features/search/components/select-items'
import { HERBARIA, MAX_YEAR, MIN_YEAR, MONTHS } from '@/features/search/constants/constants'
import { COUNTRIES } from '@/features/search/constants/countries'
import { SwitchOption } from '@/features/search/components/switch-option'
import { AreaMapFilter } from '@/features/search/components/area-map-filter'

export function SearchFilters({ lockedFilters }: { lockedFilters?: LockedFilters }) {
  const {
    scientificName,
    floritalyName,
    genus,
    country,
    countryCode,
    locality,
    geometry,
    year,
    month,
    institutionCode,
    hasCoordinates,
    setScientificName,
    setFloritalyName,
    setGenus,
    setCountry,
    setCountryCode,
    setLocality,
    setGeometry,
    setYear,
    setMonth,
    setInstitutionCode,
    setHasCoordinates,
  } = useFilterStore(
    useShallow((state) => ({
      scientificName: state.scientificName,
      floritalyName: state.floritalyName,
      genus: state.genus,
      country: state.country,
      countryCode: state.countryCode,
      locality: state.locality,
      geometry: state.geometry,
      year: state.year,
      month: state.month,
      institutionCode: state.institutionCode,
      hasCoordinates: state.hasCoordinates,
      setScientificName: state.setScientificName,
      setFloritalyName: state.setFloritalyName,
      setGenus: state.setGenus,
      setCountry: state.setCountry,
      setCountryCode: state.setCountryCode,
      setLocality: state.setLocality,
      setGeometry: state.setGeometry,
      setYear: state.setYear,
      setMonth: state.setMonth,
      setInstitutionCode: state.setInstitutionCode,
      setHasCoordinates: state.setHasCoordinates,
    })),
  )
  const { t } = useTranslation()
  const { herbariaId } = useParams({ strict: false })

  const handleSetYear = useDebouncedCallback((value: [number, number]) => {
    console.log('SearchFilters: Debounced setYears called with:', value)
    setYear(value)
  }, 500)
  return (
    <>
      <div className="pt-1"></div>
      <Autocomplete
        label={t('search.filters.scientific-name-label')}
        placeholder={t('search.filters.scientific-name-placeholder')}
        selectedValues={scientificName}
        onSelectedValuesChange={setScientificName}
        queryKey={['plantscientificnamesearch', herbariaId ?? '']}
        query={
          `${BASE_API_URL}autocomplete?` +
          (herbariaId ? `institutionCode=${herbariaId}&` : '') +
          `field=scientificName&value=`
        }
      />
      <Autocomplete
        label={t('search.filters.genus-label')}
        placeholder={t('search.filters.genus-placeholder')}
        selectedValues={genus}
        onSelectedValuesChange={setGenus}
        queryKey={['genussearch', herbariaId ?? '']}
        query={
          `${BASE_API_URL}autocomplete?` + (herbariaId ? `institutionCode=${herbariaId}&` : '') + `field=genus&value=`
        }
      />
      <AutocompletePrefetch
        label={t('search.filters.country-code-label')}
        placeholder={t('search.filters.country-code-placeholder')}
        translationArray={COUNTRIES}
        selectedValues={countryCode}
        onSelectedValuesChange={setCountryCode}
        queryKeys={['countryCode', herbariaId ?? '']}
        query={
          `${BASE_API_URL}autocomplete?` +
          (herbariaId ? `institutionCode=${herbariaId}&` : '') +
          `limit=999&field=countryCode&value=`
        }
      />
      <Autocomplete
        label={t('search.filters.locality-label')}
        placeholder={t('search.filters.locality-placeholder')}
        selectedValues={locality}
        onSelectedValuesChange={setLocality}
        queryKey={['localitysearch', herbariaId ?? '']}
        query={
          `${BASE_API_URL}autocomplete?` +
          (herbariaId ? `institutionCode=${herbariaId}&` : '') +
          `field=locality&value=`
        }
        minLength={4}
      />
      <Autocomplete
        label={t('search.filters.floritaly-name-label')}
        placeholder={t('search.filters.floritaly-name-placeholder')}
        selectedValues={floritalyName}
        onSelectedValuesChange={setFloritalyName}
        queryKey={['floritalysearch', herbariaId ?? '']}
        query={
          `${BASE_API_URL}autocomplete?` +
          (herbariaId ? `institutionCode=${herbariaId}&` : '') +
          `field=floritalyName&value=`
        }
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
      <AreaMapFilter
        label={t('search.filters.geometry-label')}
        mapHeight="h-[300px]"
        geometry={geometry}
        setGeometry={setGeometry}
      />
      <div className="min-h-60 w-full"></div>
    </>
  )
}
