import { Autocomplete } from '@/features/search/components/autocomplete'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { FilterResetButton } from '@/features/search/components/filter-reset-button'

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

  const handleSetYears = useDebouncedCallback((value: [number, number]) => {
    console.log('AppSidebar: Debounced setYears called with:', value)
    setYears(value)
  }, 500)

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
              <FilterResetButton
                itemCount={activeFiltersCount}
                onResetClick={resetFilters}
                size="sm"
              />
            </span>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <Autocomplete
          label="Plant:"
          placeholder="Search name"
          selectedValues={scientificNames}
          onSelectedValuesChange={setScientificNames}
          queryKey="plantscientificnamesearch"
          query="http://localhost:8000/api/v1/autocomplete?field=scientificName&value="
        />

        <Autocomplete
          label="Country:"
          placeholder="Search country"
          selectedValues={countries}
          onSelectedValuesChange={setCountries}
          queryKey="countrysearch"
          query="http://localhost:8000/api/v1/autocomplete?field=scientificName&value="
        />

        <Autocomplete
          label="Locality:"
          placeholder="Search a locality"
          selectedValues={locality}
          onSelectedValuesChange={setLocality}
          queryKey="localitysearch"
          query="http://localhost:8000/api/v1/autocomplete?field=locality&value="
          minLength={4}
        />
        <Autocomplete
          label="Name in FlorItaly:"
          placeholder="Search a name in checklist"
          selectedValues={floritalyNames}
          onSelectedValuesChange={setFloritalyNames}
          queryKey="floritalysearch"
          query="http://localhost:8000/api/v1/autocomplete?field=floritalyName&value="
        />
      </SidebarContent>
      <SidebarFooter>{''}</SidebarFooter>
    </Sidebar>
  )
}
