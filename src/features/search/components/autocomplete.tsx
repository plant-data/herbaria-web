import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Search } from 'lucide-react'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'

import { useDebounce } from '@/hooks/use-debounce'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { BadgeSelected } from '@/features/search/components/badge-selected'

export type AutocompleteItem = string

interface AutocompleteApiResponse {
  data: Array<string>
  total: number
  skip: number
  limit: number
}

interface AutocompleteAsyncProps {
  label: string
  placeholder: string
  queryKey: string
  query: string
  selectedValues: Array<AutocompleteItem>
  onSelectedValuesChange: React.Dispatch<
    React.SetStateAction<Array<AutocompleteItem>>
  >
  minLength?: number
}
// !!! mai cambiare questo
// fetchInProgress={isFetching || search === '' || debouncedSearch !== search}
// focusa il primo elemento quando fetchInProgress passa da true a false
export function Autocomplete({
  label,
  placeholder,
  queryKey,
  query,
  selectedValues,
  onSelectedValuesChange,
  minLength = 1,
}: AutocompleteAsyncProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { data, error, isFetching } = useQuery({
    
    queryKey: [queryKey, debouncedSearch],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${query}${debouncedSearch}`, { signal })
      if (!res.ok) {
        throw new Error('Server error')
      }
      const resData: AutocompleteApiResponse = await res.json()

      return resData.data
    },
    placeholderData: (prev) => prev,
    retry: false,
    enabled: debouncedSearch.length >= minLength,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60,
    gcTime: 24 * 60 * 60,
  })

  const isGettingData =
    (search !== '' && isFetching) ||
    (search !== debouncedSearch && search !== '')

  const handleUnselect = useCallback(
    (item: AutocompleteItem) => {
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
    const input = inputRef.current
    if (e.key === 'Escape') {
      input?.blur()
    }
  }

  const selectedLabels = new Set(selectedValues)
  const selectables =
    search === '' ? [] : data?.filter((item) => !selectedLabels.has(item))

  return (
    <div>
      <div className="text-sm font-semibold pl-1">{label}</div>

      {/* 1: checkbox part - OUTSIDE Command */}
      <BadgeSelected
        items={selectedValues}
        onItemRemove={handleUnselect}
        onClearAll={handleClearAll}
        showClearAll={selectedValues.length > 1}
      />

      {/* 2: Command for input and list */}
      <Command
        onKeyDown={handleKeyDown}
        className="overflow-visible bg-transparent max-w-full"
        shouldFilter={false}
        async={true}
        fetchInProgress={
          isFetching || search === '' || debouncedSearch !== search
        }
      >
        {/* input part */}
        <div className="relative py-1">
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            {isGettingData ? (
              <LoaderCircle className="h-4 w-4 shrink-0 text-ring opacity-80 animate-spin" />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
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
              ' pl-7 pr-3 py-2 file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-[34px] w-full min-w-0 rounded-md border bg-background text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            )}
          />
        </div>

        {/* list part */}
        <div className="relative">
          <CommandList>
            {open &&
              search !== '' &&
              debouncedSearch !== '' &&
              !isGettingData && (
                <CommandEmpty className="text-sm absolute top-0 z-10 w-full rounded-md border bg-popover p-2 text-popover-foreground shadow-sm outline-none animate-in">
                  {error
                    ? t('search.filters.autocomplete-error')
                    : debouncedSearch.length < minLength ||
                        (debouncedSearch.length === minLength && isFetching)
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
              <CommandGroup className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-sm outline-none animate-in">
                <div className="h-full max-h-48 overflow-auto">
                  {selectables.map((item) => {
                    return (
                      <CommandItem
                        key={item}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onSelect={() => {
                          setSearch('')
                          queryClient.setQueryData([queryKey, ''], [])
                          onSelectedValuesChange((prev) => [...prev, item])
                        }}
                        className="cursor-pointer "
                      >
                        {item}
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
