import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { LoaderCircle, Search } from 'lucide-react'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { BadgeSelected } from '@/features/search/components/badge-selected'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { buildLocalFilterParams, fetchFacet } from '@/features/search/api/local-backend'

interface FacetAutocompleteProps {
  label: string
  placeholder: string
  // The local backend facet field, e.g. 'scientificName', 'genus', 'recordedBy'.
  field: string
  selectedValues: Array<string>
  onSelectedValuesChange: React.Dispatch<React.SetStateAction<Array<string>>>
  minLength?: number
}

/**
 * A prefix autocomplete over one local-backend facet field, showing the count of
 * matching specimens next to each suggestion. The counts are conditional on the
 * other applied filters (the field's own selections are excluded so a second
 * value can still be added), mirroring the reference dashboard.
 *
 * Modelled on {@link Autocomplete}, which stays on the online suggestions API for
 * the filters not yet converted.
 */
export function FacetAutocomplete({
  label,
  placeholder,
  field,
  selectedValues,
  onSelectedValuesChange,
  minLength = 1,
}: FacetAutocompleteProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // The other applied filters, so the suggestion counts are conditional.
  const source = useFilterStore(
    useShallow((state) => ({
      scientificName: state.scientificName,
      genus: state.genus,
      countryCode: state.countryCode,
      locality: state.locality,
      recordedBy: state.recordedBy,
      year: state.year,
      altitude: state.altitude,
      onlyMultisheet: state.onlyMultisheet,
    })),
  )
  const params = buildLocalFilterParams(source, { excludeField: field })

  const { data, error, isFetching } = useQuery({
    queryKey: ['facet', field, JSON.stringify(params), debouncedSearch],
    queryFn: ({ signal }) => fetchFacet(field, debouncedSearch, params, signal),
    placeholderData: (prev) => prev,
    retry: false,
    enabled: debouncedSearch.length >= minLength,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60,
    gcTime: 24 * 60 * 60,
  })

  const isGettingData = (search !== '' && isFetching) || (search !== debouncedSearch && search !== '')

  const handleUnselect = useCallback(
    (item: string) => {
      onSelectedValuesChange((prev) => prev.filter((s) => s !== item))
      inputRef.current?.focus()
    },
    [onSelectedValuesChange],
  )

  const handleClearAll = useCallback(() => {
    onSelectedValuesChange([])
    inputRef.current?.focus()
  }, [onSelectedValuesChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  const selectedLabels = new Set(selectedValues)
  const selectables = search === '' ? [] : data?.filter((item) => !selectedLabels.has(item.value))

  return (
    <div>
      <div className="pl-1 text-sm font-semibold">{label}</div>

      <BadgeSelected
        items={selectedValues}
        onItemRemove={handleUnselect}
        onClearAll={handleClearAll}
        showClearAll={selectedValues.length > 1}
      />

      <Command
        onKeyDown={handleKeyDown}
        className="max-w-full overflow-visible bg-transparent"
        shouldFilter={false}
        async={true}
        fetchInProgress={isFetching || search === '' || debouncedSearch !== search}
      >
        <div className="relative py-1">
          <div className="absolute top-1/2 left-2 -translate-y-1/2">
            {isGettingData ? (
              <LoaderCircle className="text-ring h-4 w-4 shrink-0 animate-spin opacity-80" />
            ) : (
              <Search className="text-muted-foreground h-4 w-4 shrink-0" />
            )}
          </div>
          <CommandPrimitive.Input
            autoComplete="off"
            ref={inputRef}
            value={search}
            onValueChange={setSearch}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input bg-background flex h-[34px] w-full min-w-0 rounded-md border py-2 pr-3 pl-7 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-sm disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            )}
          />
        </div>

        <div className="relative">
          <CommandList>
            {open && search !== '' && debouncedSearch !== '' && !isGettingData && (
              <CommandEmpty className="bg-popover text-popover-foreground animate-in absolute top-0 z-10 w-full rounded-md border p-2 text-sm shadow-sm outline-none">
                {error
                  ? t('search.filters.autocomplete-error')
                  : debouncedSearch.length < minLength || (debouncedSearch.length === minLength && isFetching)
                    ? t('search.filters.autocomplete-min-length', {
                        number: minLength,
                      })
                    : t('search.filters.autocomplete-no-results')}
              </CommandEmpty>
            )}
            {open &&
            search !== '' &&
            debouncedSearch !== '' &&
            debouncedSearch.length >= minLength &&
            selectables &&
            selectables.length > 0 ? (
              <CommandGroup className="bg-popover text-popover-foreground animate-in absolute top-0 z-10 w-full rounded-md border shadow-sm outline-none">
                <div className="h-full max-h-48 overflow-auto">
                  {selectables.map((item) => {
                    return (
                      <CommandItem
                        key={item.value}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onSelect={() => {
                          setSearch('')
                          queryClient.setQueryData(['facet', field, JSON.stringify(params), ''], [])
                          onSelectedValuesChange((prev) => [...prev, item.value])
                        }}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <span className="truncate">{item.value}</span>
                        <span className="text-muted-foreground ml-auto shrink-0 pl-2 text-xs tabular-nums">
                          {item.count.toLocaleString()}
                        </span>
                      </CommandItem>
                    )
                  })}
                </div>
              </CommandGroup>
            ) : null}
          </CommandList>
        </div>
      </Command>
    </div>
  )
}
