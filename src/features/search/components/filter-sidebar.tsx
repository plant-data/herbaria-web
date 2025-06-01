import SelectMonth from '@/components/select/select-month'
import { FilterSwitch } from '@/components/filters/filter-switch'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import AutocompleteGenericBox from '@/components/autocomplete/autocomplete-generic-box'
import { FilterAutocomplete } from '@/components/filters/filter-autocomplete'
import { FilterMonths } from '@/components/filters/filter-months'
import FilterTree from '@/components/filters/filter-tree'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DoubleSlider from '@/components/slider/double-slider'
import useSearchOccurrences from '@/components/search/useSearchOccurrences'
import { useFilterStore } from '@/store/use-filter-store'

import { FilterTrashButton } from '@/components/filters/filter-trash-button'

export function FilterSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <Tabs defaultValue="filters">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-2 mx-6">
              <TabsTrigger className="text-xs font-semibold" value="filters">
                Filters
              </TabsTrigger>
              <TabsTrigger
                className="text-xs font-semibold"
                value="see-filters"
              >
                See filters
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="filters">
            <div className="ml-1 flex flex-col justify-start gap-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className='overflow-visible'> 
                  <AccordionTrigger>Scientific Name</AccordionTrigger>
                  <AccordionContent className='overflow-visible'>
                    <FilterAutocomplete
                      label="Plant:"
                      placeholder="Search name"
                      selectedValues={scientificNames}
                      onSelectedValuesChange={setScientificNames}
                      queryKey="plantscientificnamesearch"
                      query="http://localhost:8000/api/v1/autocomplete?field=scientificName&value="
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Country</AccordionTrigger>
                  <AccordionContent>
                    <FilterAutocomplete
                      label="Country:"
                      placeholder="Search country"
                      selectedValues={countries}
                      onSelectedValuesChange={setCountries}
                      queryKey="countrysearch"
                      query="http://localhost:8000/api/v1/autocomplete?field=scientificName&value="
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
              <DoubleSlider
                initialValue={years} // Pass AppSidebar's years as initialValue
                onYearChange={handleSetYears}
              />
              <FilterMonths
                label="Select Months"
                placeholder="Choose months..."
                selectedValues={months}
                onSelectedValuesChange={setMonths}
              />
              <FilterSwitch
                field="hasCoordinates"
                label="Show only records with coordinates"
                checked={hasCoordinates}
                onCheckedChange={setHasCoordinates}
              />
            </div>
          </TabsContent>
          <TabsContent value="see-filters">
            <FilterTree
              scientificNames={scientificNames}
              countries={countries}
            />
          </TabsContent>
        </Tabs>
      </SidebarContent>
      <SidebarFooter>{''}</SidebarFooter>
    </Sidebar>
  )
}
