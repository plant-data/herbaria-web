import { useTranslation } from 'react-i18next'
import { baseApiUrl } from '@/config'
import { Autocomplete } from '@/features/search/components/autocomplete'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { RangeSlider } from '@/features/search/components/range-slider'
import { SelectItems } from '@/features/search/components/select-items'
import { MONTHS } from '@/features/search/constants/months'
import { SwitchOption } from '@/features/search/components/switch-option'

export function SearchFilters() {
  const {
    scientificNames,
    floritalyNames,
    countries,
    locality,
    years,
    months,
    hasCoordinates,
    setScientificNames,
    setFloritalyNames,
    setCountries,
    setLocality,
    setYears,
    setMonths,
    setHasCoordinates,
  } = useFilterStore()
  const { t } = useTranslation()

  const handleSetYears = useDebouncedCallback((value: [number, number]) => {
    console.log('SearchFilters: Debounced setYears called with:', value)
    setYears(value)
  }, 500)

  console.log(`${baseApiUrl}autocomplete?field=scientificName&value=`)

  return (
    <>
      <div className="pt-1"></div>
      <Autocomplete
        label={t('search.filters.scientific-name-label')}
        placeholder={t('search.filters.scientific-name-placeholder')}
        selectedValues={scientificNames}
        onSelectedValuesChange={setScientificNames}
        queryKey="plantscientificnamesearch"
        query={`${baseApiUrl}autocomplete?field=scientificName&value=`}
      />
      <Autocomplete
        label={t('search.filters.country-label')}
        placeholder={t('search.filters.country-placeholder')}
        selectedValues={countries}
        onSelectedValuesChange={setCountries}
        queryKey="countrysearch"
        query={`${baseApiUrl}autocomplete?field=scientificName&value=`}
      />
      <Autocomplete
        label={t('search.filters.locality-label')}
        placeholder={t('search.filters.locality-placeholder')}
        selectedValues={locality}
        onSelectedValuesChange={setLocality}
        queryKey="localitysearch"
        query={`${baseApiUrl}autocomplete?field=locality&value=`}
        minLength={4}
      />
      <Autocomplete
        label={t('search.filters.floritaly-name-label')}
        placeholder={t('search.filters.floritaly-name-placeholder')}
        selectedValues={floritalyNames}
        onSelectedValuesChange={setFloritalyNames}
        queryKey="floritalysearch"
        query={`${baseApiUrl}autocomplete?field=floritalyName&value=`}
      />
      <RangeSlider
        label={t('search.filters.year-label')}
        initialValues={years}
        onValuesChange={handleSetYears}
        min={1800}
        max={new Date().getFullYear()}
        step={1}
      />
      <SelectItems
        label={t('search.filters.month-label')}
        placeholder={t('search.filters.month-placeholder')}
        allSelectedMessage={t('search.filters.month-all-selected')}
        items={MONTHS}
        selectedValues={months}
        onSelectedValuesChange={setMonths}
      />
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
