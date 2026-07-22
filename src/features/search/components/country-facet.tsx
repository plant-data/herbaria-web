import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { LoaderCircle, Search } from 'lucide-react'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { BadgeSelected } from '@/features/search/components/badge-selected'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { buildLocalFilterParams, fetchGroup } from '@/features/search/api/local-backend'

interface CountryFacetProps {
  label: string
  placeholder: string
  // ISO country codes; the store keeps codes, the UI shows translated names.
  selectedValues: Array<string>
  onSelectedValuesChange: React.Dispatch<React.SetStateAction<Array<string>>>
  // { id: code, value: i18n key }, e.g. COUNTRIES.
  translationArray: ReadonlyArray<{ id: string; value: string }>
  minLength?: number
}

interface CountryItem {
  id: string
  value: string
  count: number
}

/**
 * The country filter over the local backend. Unlike the other facets it does not
 * prefix-search the server: the stored value is an ISO code, but a curator types
 * a country *name*, and the two do not match. So the full code→count map is
 * pulled once from POST /api/v1/herbaria/group (conditional on the other applied
 * filters, like every other count), translated to names, and filtered
 * client-side — preserving the translated-name UX while adding counts.
 */
export function CountryFacet({
  label,
  placeholder,
  selectedValues,
  onSelectedValuesChange,
  translationArray,
  minLength = 1,
}: CountryFacetProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // The other applied filters, so the counts are conditional.
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
  const params = buildLocalFilterParams(source, { excludeField: 'countryCode' })

  const { data, error, isPending } = useQuery({
    queryKey: ['country-group', JSON.stringify(params)],
    queryFn: ({ signal }) => fetchGroup('countryCode', 'count', params, signal),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60,
    gcTime: 24 * 60 * 60,
  })

  const translatedItems: Array<CountryItem> = useMemo(() => {
    if (!data) return []
    return data.map((bucket) => {
      const translation = translationArray.find((c) => c.id === bucket.value)
      return {
        id: bucket.value,
        value: translation ? t(translation.value as never) : bucket.value,
        count: bucket.count,
      }
    })
  }, [data, translationArray, t])

  const selectedItems = useMemo(() => {
    return selectedValues
      .map((code) => translatedItems.find((item) => item.id === code)?.value ?? null)
      .filter((item): item is string => item !== null)
  }, [selectedValues, translatedItems])

  const availableItems = useMemo(() => {
    const selectedIds = new Set(selectedValues)
    return translatedItems.filter((item) => !selectedIds.has(item.id))
  }, [selectedValues, translatedItems])

  const handleUnselect = useCallback(
    (displayedValue: string) => {
      const fullItem = translatedItems.find((item) => item.value === displayedValue)
      onSelectedValuesChange((prev) => prev.filter((code) => code !== fullItem?.id))
      inputRef.current?.focus()
    },
    [onSelectedValuesChange, translatedItems],
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

  return (
    <div>
      <div className="pl-1 text-sm font-semibold">{label}</div>
      <Command
        filter={(value, search) => {
          if (search.length < 3) {
            return value.toLowerCase().startsWith(search.toLowerCase()) ? 1 : 0
          }
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
        }}
        onKeyDown={handleKeyDown}
        className="max-w-full overflow-visible bg-transparent"
      >
        <BadgeSelected
          items={selectedItems}
          onItemRemove={handleUnselect}
          onClearAll={handleClearAll}
          showClearAll={selectedValues.length > 1}
        />
        <div className="relative py-1">
          <div className="absolute top-1/2 left-2 -translate-y-1/2">
            <Search className="text-muted-foreground h-4 w-4 shrink-0" />
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
            {open && search.length >= minLength ? (
              <CommandEmpty className="bg-popover text-popover-foreground animate-in absolute top-0 z-10 w-full rounded-md border p-2 text-sm shadow-sm outline-none">
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="text-ring h-4 w-4 shrink-0 animate-spin opacity-80" />
                    {t('search.filters.loading-data')}
                  </span>
                ) : error ? (
                  t('search.filters.autocomplete-error')
                ) : (
                  t('search.filters.autocomplete-no-results')
                )}
              </CommandEmpty>
            ) : null}
            {open && !isPending && search.length >= minLength ? (
              <CommandGroup className="bg-popover text-popover-foreground animate-in absolute top-0 z-10 w-full rounded-md border shadow-sm outline-none">
                <div className="h-full max-h-48 overflow-auto">
                  {availableItems.map((item) => {
                    return (
                      <CommandItem
                        key={item.id}
                        value={item.value}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onSelect={() => {
                          setSearch('')
                          onSelectedValuesChange((prev) => [...prev, item.id])
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
