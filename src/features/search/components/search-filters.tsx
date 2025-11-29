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
import {
  MAX_YEAR,
  MIN_YEAR,
  MONTHS
} from '@/features/search/constants/constants'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { COUNTRIES } from '@/features/search/constants/countries'
import { SwitchOption } from '@/features/search/components/switch-option'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const HERBARIA_FOR_FILTER = HERBARIA_CONFIG.map((herbarium) => ({
  id: herbarium.id,
  value: herbarium.translationKey,
}))

export function SearchFilters({ lockedFilters }: { lockedFilters?: LockedFilters }) {
  const {
    scientificName,
    floritalyName,
    genus,

    countryCode,
    locality,

    year,
    month,
    institutionCode,
    hasCoordinates,
    setScientificName,
    setFloritalyName,
    setGenus,

    setCountryCode,
    setLocality,

    setYear,
    setMonth,
    setInstitutionCode,
    setHasCoordinates,
  } = useFilterStore(
    useShallow((state) => ({
      scientificName: state.scientificName,
      floritalyName: state.floritalyName,
      genus: state.genus,

      countryCode: state.countryCode,
      locality: state.locality,

      year: state.year,
      month: state.month,
      institutionCode: state.institutionCode,
      hasCoordinates: state.hasCoordinates,
      setScientificName: state.setScientificName,
      setFloritalyName: state.setFloritalyName,
      setGenus: state.setGenus,

      setCountryCode: state.setCountryCode,
      setLocality: state.setLocality,

      setYear: state.setYear,
      setMonth: state.setMonth,
      setInstitutionCode: state.setInstitutionCode,
      setHasCoordinates: state.setHasCoordinates,
    })),
  )
  const { t } = useTranslation()
  let { herbariaId } = useParams({ strict: false })

  // necessario per le query di autocomplete
  if (herbariaId === 'all') {
    herbariaId = ''
  }

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
          items={HERBARIA_FOR_FILTER}
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
      <Accordion type="multiple">
        <AccordionItem value="area">
          {/* <AccordionTrigger className='hover:cursor-pointer'>{t('search.filters.geometry-label')}</AccordionTrigger> */}
          <AccordionTrigger className="hover:cursor-pointer">Test</AccordionTrigger>
          <AccordionContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="min-h-60 w-full"></div>
    </>
  )
}
