
import { FilterAutocomplete } from '@/components/filters/filter-autocomplete'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { useFilterStore } from '@/features/search/stores/use-filters-store'

import { FilterTrashButton } from '@/components/filters/filter-trash-button'

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
              <FilterTrashButton
                itemCount={activeFiltersCount}
                onTrashClick={resetFilters}
                size="sm"
              />
            </span>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <FilterAutocomplete
          label="Plant:"
          placeholder="Search name"
          selectedValues={scientificNames}
          onSelectedValuesChange={setScientificNames}
          queryKey="plantscientificnamesearch"
          query="http://localhost:8000/api/v1/autocomplete?field=scientificName&value="
        />

        <FilterAutocomplete
          label="Country:"
          placeholder="Search country"
          selectedValues={countries}
          onSelectedValuesChange={setCountries}
          queryKey="countrysearch"
          query="http://localhost:8000/api/v1/autocomplete?field=scientificName&value="
        />

        <FilterAutocomplete
          label="Locality:"
          placeholder="Search a locality"
          selectedValues={locality}
          onSelectedValuesChange={setLocality}
          queryKey="localitysearch"
          query="http://localhost:8000/api/v1/autocomplete?field=locality&value="
          minLenght={4}
        />
        <FilterAutocomplete
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
