import { useTranslation } from 'react-i18next'
import { baseApiUrl } from '@/config'
import { Autocomplete } from '@/features/search/components/autocomplete'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { ResetFilterButton } from '@/features/search/components/reset-filter-button'
import { RangeSlider } from '@/features/search/components/range-slider'
import { SelectItems } from '@/features/search/components/select-items'
import {MONTHS} from '@/features/search/constants/months'

export function FilterSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
    activeFiltersCount,
    resetFilters,
  } = useFilterStore()
  const { t } = useTranslation()

  const handleSetYears = useDebouncedCallback((value: [number, number]) => {
    console.log('AppSidebar: Debounced setYears called with:', value)
    setYears(value)
  }, 500)

  console.log(`${baseApiUrl}autocomplete?field=scientificName&value=`)

  return (
    <Sidebar
      className="top-[var(--header-height)] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu className="relative py-2">
          <SidebarMenuItem>
            <h2 className="font-semibold text-center">Herbaria filters</h2>
          </SidebarMenuItem>
          {activeFiltersCount > 0 && (
            <span className="absolute right-2 top-1">
              <ResetFilterButton
                itemCount={activeFiltersCount}
                onResetClick={resetFilters}
                size="sm"
              />
            </span>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 gap-4">
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
        <Autocomplete
          label={t('search.filters.floritaly-name-label')}
          placeholder={t('search.filters.floritaly-name-placeholder')}
          selectedValues={floritalyNames}
          onSelectedValuesChange={setFloritalyNames}
          queryKey="gbifsearch"
          query={`${baseApiUrl}autocomplete?field=gbifName&value=`}
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
          sortBy="id"

        />
        <div className='min-h-60 w-full'></div>
      </SidebarContent>
      <SidebarFooter className="h-[60px] pt-0">
        <hr className="text-input" />
        <SidebarTrigger
          className="z-[51] fixed left-3 bottom-3 text-transparent bg-transparent border-transparent hover:bg-transparent"
          textShow=''
          textHide=''
        ></SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  )
}
