import { useTranslation } from 'react-i18next'
import { useParams } from '@tanstack/react-router'
import { useShallow } from 'zustand/react/shallow'
import type { LockedFilters } from '@/features/search/stores/use-filters-store'
import { BASE_API_URL } from '@/config'
import { Autocomplete } from '@/features/search/components/autocomplete'
import { FacetAutocomplete } from '@/features/search/components/facet-autocomplete'
import { CountryFacet } from '@/features/search/components/country-facet'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { HistogramRangeSlider } from '@/features/search/components/histogram-range-slider'
import { SelectItems } from '@/features/search/components/select-items'
import {
  ALTITUDE_MAX,
  ALTITUDE_MIN,
  HISTOGRAM_BARS,
  MAX_YEAR,
  MIN_YEAR,
  MONTHS,
} from '@/features/search/constants/constants'
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
    recordedBy,

    year,
    altitude,
    month,
    institutionCode,
    hasCoordinates,
    onlyMultisheet,
    floritalyName,
    stateProvince,
    setScientificName,

    setGenus,

    setCountryCode,
    setLocality,
    setRecordedBy,

    setYear,
    setAltitude,
    setMonth,
    setInstitutionCode,
    setHasCoordinates,
    setOnlyMultisheet,

    setFloritalyName,
    setStateProvince,
  } = useFilterStore(
    useShallow((state) => ({
      scientificName: state.scientificName,

      genus: state.genus,

      countryCode: state.countryCode,
      locality: state.locality,
      recordedBy: state.recordedBy,

      year: state.year,
      altitude: state.altitude,
      month: state.month,
      institutionCode: state.institutionCode,
      hasCoordinates: state.hasCoordinates,
      onlyMultisheet: state.onlyMultisheet,

      floritalyName: state.floritalyName,
      stateProvince: state.stateProvince,
      setScientificName: state.setScientificName,

      setGenus: state.setGenus,

      setCountryCode: state.setCountryCode,
      setLocality: state.setLocality,
      setRecordedBy: state.setRecordedBy,

      setYear: state.setYear,
      setAltitude: state.setAltitude,
      setMonth: state.setMonth,
      setInstitutionCode: state.setInstitutionCode,
      setHasCoordinates: state.setHasCoordinates,
      setOnlyMultisheet: state.setOnlyMultisheet,

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
      <FacetAutocomplete
        label={t('search.filters.scientific-name-label')}
        placeholder={t('search.filters.scientific-name-placeholder')}
        field="scientificName"
        selectedValues={scientificName}
        onSelectedValuesChange={setScientificName}
      />
      <FacetAutocomplete
        label={t('search.filters.genus-label')}
        placeholder={t('search.filters.genus-placeholder')}
        field="genus"
        selectedValues={genus}
        onSelectedValuesChange={setGenus}
      />
      <CountryFacet
        label={t('search.filters.country-code-label')}
        placeholder={t('search.filters.country-code-placeholder')}
        translationArray={COUNTRIES}
        selectedValues={countryCode}
        onSelectedValuesChange={setCountryCode}
      />
      <FacetAutocomplete
        label={t('search.filters.locality-label')}
        placeholder={t('search.filters.locality-placeholder')}
        field="locality"
        selectedValues={locality}
        onSelectedValuesChange={setLocality}
        minLength={4}
      />
      <FacetAutocomplete
        label={t('search.filters.collected-by-label')}
        placeholder={t('search.filters.collected-by-placeholder')}
        field="recordedBy"
        selectedValues={recordedBy}
        onSelectedValuesChange={setRecordedBy}
      />
      <HistogramRangeSlider
        label={t('search.filters.year-label')}
        field="eventYear"
        value={year}
        onValueCommit={setYear}
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
        bars={HISTOGRAM_BARS}
        excludeKey="year"
      />
      <HistogramRangeSlider
        label={t('search.filters.altitude-label')}
        field="elevation_band"
        value={altitude}
        onValueCommit={setAltitude}
        min={ALTITUDE_MIN}
        max={ALTITUDE_MAX}
        step={10}
        bars={HISTOGRAM_BARS}
        excludeKey="altitude"
        unit="m"
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
      <SwitchOption
        label={t('search.filters.only-multisheet-label')}
        field="only-multisheet"
        checked={onlyMultisheet}
        onCheckedChange={setOnlyMultisheet}
      />
      {/* qua metto i filtry x l'italia */}
      <hr className="text-input mx-2 mt-3 mb-2" />
      <span className="mb-1 ml-1 text-sm font-semibold">{t('search.filters.filters-for-italy')}</span>
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
