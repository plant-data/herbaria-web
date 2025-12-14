import { useTranslation } from 'react-i18next'
import { useParams } from '@tanstack/react-router'
import { useShallow } from 'zustand/react/shallow'
import type { LockedFilters } from '@/features/search/stores/use-filters-store'
import { BASE_API_URL } from '@/config'
import { Autocomplete } from '@/features/search/components/autocomplete'
import { AutocompletePrefetch } from '@/features/search/components/autocomplete-prefetch'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { RangeSlider } from '@/features/search/components/range-slider'
import { SelectItems } from '@/features/search/components/select-items'
import { MAX_YEAR, MIN_YEAR, MONTHS } from '@/features/search/constants/constants'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { COUNTRIES } from '@/features/search/constants/countries'
import { REGIONS } from '@/features/search/constants/regions'
import { SwitchOption } from '@/features/search/components/switch-option'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const HERBARIA_FOR_FILTER = HERBARIA_CONFIG.map((herbarium) => ({
  id: herbarium.id,
  value: herbarium.translationKey,
}))

export function SearchFilters({ lockedFilters }: { lockedFilters?: LockedFilters }) {
  const {
    scientificName,

    genus,

    countryCode,
    locality,

    year,
    month,
    institutionCode,
    hasCoordinates,
    floritalyName,
    stateProvince,
    setScientificName,

    setGenus,

    setCountryCode,
    setLocality,

    setYear,
    setMonth,
    setInstitutionCode,
    setHasCoordinates,

    setFloritalyName,
    setStateProvince,
  } = useFilterStore(
    useShallow((state) => ({
      scientificName: state.scientificName,

      genus: state.genus,

      countryCode: state.countryCode,
      locality: state.locality,

      year: state.year,
      month: state.month,
      institutionCode: state.institutionCode,
      hasCoordinates: state.hasCoordinates,

      floritalyName: state.floritalyName,
      stateProvince: state.stateProvince,
      setScientificName: state.setScientificName,

      setGenus: state.setGenus,

      setCountryCode: state.setCountryCode,
      setLocality: state.setLocality,

      setYear: state.setYear,
      setMonth: state.setMonth,
      setInstitutionCode: state.setInstitutionCode,
      setHasCoordinates: state.setHasCoordinates,

      setFloritalyName: state.setFloritalyName,
      setStateProvince: state.setStateProvince,
    })),
  )
  const { t } = useTranslation()
  let { herbariaId } = useParams({ strict: false })

  // necessario per le query di autocomplete
  if (herbariaId === 'all') {
    herbariaId = ''
  }

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
          `${BASE_API_URL}specimens/suggestions?` +
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
          `${BASE_API_URL}specimens/suggestions?` + (herbariaId ? `institutionCode=${herbariaId}&` : '') + `field=genus&value=`
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
          `${BASE_API_URL}specimens/suggestions?` +
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
          `${BASE_API_URL}specimens/suggestions?` +
          (herbariaId ? `institutionCode=${herbariaId}&` : '') +
          `field=locality&value=`
        }
        minLength={4}
      />
      <RangeSlider
        label={t('search.filters.year-label')}
        value={year}
        onValueCommit={setYear}
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
      {/* qua metto i filtry x l'italia */}
      <hr className="text-input mx-2 mt-3 mb-2" />
      <span className='ml-1 mb-1 text-sm font-semibold'>{t('search.filters.filters-for-italy')}</span>
      <Autocomplete
        label={t('search.filters.floritaly-name-label')}
        placeholder={t('search.filters.floritaly-name-placeholder')}
        selectedValues={floritalyName}
        onSelectedValuesChange={setFloritalyName}
        queryKey={['floritalysearch', herbariaId ?? '']}
        query={
          `${BASE_API_URL}specimens/suggestions?` +
          (herbariaId ? `institutionCode=${herbariaId}&` : '') +
          `field=floritalyName&value=`
        }
      />
      <SelectItems
        label={t('search.filters.region-label')}
        placeholder={t('search.filters.region-placeholder')}
        allSelectedMessage={t('search.filters.region-all-selected')}
        items={REGIONS}
        selectedValues={stateProvince}
        onSelectedValuesChange={setStateProvince}
      />
      {/* <Accordion type="multiple">
        <AccordionItem value="area">

          <AccordionTrigger className="hover:cursor-pointer">Filters for Italy</AccordionTrigger>
          <AccordionContent></AccordionContent>
        </AccordionItem>
      </Accordion> */}

      <div className="min-h-60 w-full"></div>
    </>
  )
}
