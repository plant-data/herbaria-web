import { useRef, useState } from 'react'
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

export type AutocompleteItem = string

interface AutocompleteApiResponse {
  data: Array<string>
  total: number
  skip: number
  limit: number
}

interface AutocompleteSimpleProps {
  label: string
  placeholder: string
  queryKey: string
  query: string
  onSelectedValueChange: (value: AutocompleteItem) => void
  minLength?: number
}

export function AutocompleteSimple({
  placeholder,
  queryKey,
  query,
  onSelectedValueChange,
  minLength = 1,
}: AutocompleteSimpleProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (e.key === 'Escape') {
      input?.blur()
    }
  }

  const selectables = search === '' ? [] : data

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="max-w-full overflow-visible bg-transparent"
      shouldFilter={false}
      async={true}
      fetchInProgress={
        isFetching || search === '' || debouncedSearch !== search
      }
    >
      {/* input part */}
      <div className="relative h-full">
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
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input bg-background flex  w-full h-full min-w-0 rounded-md border py-2 pr-3 pl-7 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
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
              <CommandEmpty className="bg-popover text-popover-foreground animate-in absolute top-0 z-10 w-full rounded-md border p-2 text-sm shadow-sm outline-none">
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
            <CommandGroup className="bg-popover text-popover-foreground animate-in absolute top-0 z-10 w-full rounded-md border shadow-sm outline-none">
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
                        onSelectedValueChange(item)
                        setOpen(false)
                      }}
                      className="cursor-pointer"
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
  )
}
