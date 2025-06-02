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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { ResetFilterButton } from '@/features/search/components/reset-filter-button'
import { RangeSlider } from '@/features/search/components/range-slider'
import { SelectItems } from '@/features/search/components/select-items'
import { MONTHS } from '@/features/search/constants/months'
import { SwitchOption } from './switch-option'

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
    <Tabs defaultValue="filters" asChild>
      <Sidebar
        className="top-[var(--header-height)] !h-[calc(100svh-var(--header-height))]"
        {...props}
      >
        <SidebarHeader>
          <SidebarMenu className="relative">
            <SidebarMenuItem className='flex items-center justify-center'>
      
              <TabsList className="p-0.5 h-auto bg-background border border-input gap-1">
                <TabsTrigger
                  key="filters"
                  value="filters"
                  className="data-[state=active]:bg-ring data-[state=active]:text-primary-foreground"
                >
                  <span className="text-[13px]">Filters</span>
                </TabsTrigger>
                <TabsTrigger
                  key="see filters"
                  value="selected-filters"
                  className="data-[state=active]:bg-ring data-[state=active]:text-primary-foreground"
                >
                  <span className="text-[13px]">Selected filters</span>
                </TabsTrigger>
              </TabsList>
            </SidebarMenuItem>
            {activeFiltersCount > 0 && (
              <span className="absolute right-2 top-0.5">
                <ResetFilterButton
                  itemCount={activeFiltersCount}
                  onResetClick={resetFilters}
                  size="sm"
                />
              </span>
            )}
          </SidebarMenu>
        </SidebarHeader>
        <hr className="text-input mx-2" />
        <SidebarContent className="gap-4">
          <TabsContent
            key="filters"
            value="filters"
            className="flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden px-3 gap-4"
          >
            <div className='pt-1'></div>
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
              sortBy="id"
            />
            <SwitchOption
              label={t('search.filters.has-coordinates-label')}
              field="coordinates"
              checked={hasCoordinates}
              onCheckedChange={setHasCoordinates}
            />
            <div className="min-h-60 w-full"></div>
          </TabsContent>
          <TabsContent key="selected-filters" value="selected-filters">
            topo
          </TabsContent>
        </SidebarContent>
        <hr className="text-input mx-2" />
        <SidebarFooter className="h-[58px] pt-0">
          <SidebarTrigger
            className="z-[51] fixed left-3 bottom-3 text-transparent bg-transparent border-transparent hover:bg-transparent"
            textShow=""
            textHide=""
          ></SidebarTrigger>
        </SidebarFooter>
      </Sidebar>
    </Tabs>
  )
}
