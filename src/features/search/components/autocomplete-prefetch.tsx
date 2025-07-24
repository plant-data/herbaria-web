// !!! PRENDI SPUNTO PER MIGLIORARE ALTRI AUTOCOMPLETE E SELECT
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { LoaderCircle, Search } from 'lucide-react'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { BadgeSelected } from '@/features/search/components/badge-selected'

export type AutocompletePrefetchItem = {
  id: number | string
  value: string
}

interface AutocompleteApiResponse {
  data: Array<string>
  total: number
  skip: number
  limit: number
}
// NOTA BENE selectedValues e onSelectedValuesChange prendono solo l'id
// l'id è quello che serve per fare le query
interface AutocompletePrefetchProps {
  label: string
  placeholder: string
  queryKeys: Array<string>
  query: string
  translationArray: Array<{ id: string; value: string }>
  selectedValues: Array<string>
  onSelectedValuesChange: React.Dispatch<React.SetStateAction<Array<string>>>
  minLength?: number
}
/**
 * A autocomplete that when loaded retrieve items from an api with id and value.
 * Then use a reference to get the translations, then simply run the autocomplete on these translations.
 * The to the parent I pass the id.
 * To the badge I pass the value
 */
export function AutocompletePrefetch({
  label,
  placeholder,
  queryKeys,
  query,
  translationArray,
  selectedValues,
  onSelectedValuesChange,
  minLength = 1,
}: AutocompletePrefetchProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, error, isPending } = useQuery({
    queryKey: [...queryKeys],
    queryFn: async ({ signal }: { signal?: AbortSignal }) => {
      const res = await fetch(`${query}`, { signal })
      if (!res.ok) {
        throw new Error('Server error')
      }
      const resData: AutocompleteApiResponse = await res.json()
      return resData.data
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60,
    gcTime: 24 * 60 * 60,
  })

  const translatedItems: Array<AutocompletePrefetchItem> = useMemo(() => {
    if (!data) return []
    return data.map((item: string) => {
      const translation = translationArray.find((c) => c.id === item)
      if (!translation) return { id: item, value: item }
      return { id: item, value: t(translation.value as any) }
    })
  }, [data, translationArray, t])

  const selectedItems = useMemo(() => {
    return selectedValues
      .map((selectedValue) => {
        const foundItem = translatedItems.find(
          (item) => item.id === selectedValue,
        )
        return foundItem?.value || null
      })
      .filter((item) => item !== null)
  }, [selectedValues, translatedItems])

  // Memoize available items (not selected)
  const availableItems = useMemo(() => {
    const selectedIds = new Set(selectedValues.map(String))
    return translatedItems.filter((item) => !selectedIds.has(String(item.id)))
  }, [selectedValues, translatedItems])

  const handleUnselect = useCallback(
    (displayedValue: string) => {
      // displayedValue è cio che visualizzo nel badge
      const fullItem = translatedItems.find(
        (item) => item.value === displayedValue,
      )
      onSelectedValuesChange((prev: Array<string>) =>
        prev.filter((selectedValue: string) => selectedValue !== fullItem?.id),
      )

      inputRef.current?.focus()
    },
    [onSelectedValuesChange, translatedItems],
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

  return (
    <div>
      <div className="pl-1 text-sm font-semibold">{label}</div>
      {/* 2: Command for input and list */}
      <Command
        filter={(value, search) => {
          if (search.length < 3) {
            if (value.toLowerCase().startsWith(search.toLowerCase())) return 1
            return 0
          } else {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1
            return 0
          }
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
        {/* input part */}
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
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input bg-background flex h-[34px] w-full min-w-0 rounded-md border py-2 pr-3 pl-7 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            )}
          />
        </div>

        {/* list part */}
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
                  {availableItems.map((item: AutocompletePrefetchItem) => {
                    return (
                      <CommandItem
                        key={item.id}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onSelect={() => {
                          setSearch('')
                          onSelectedValuesChange((prev) => [
                            ...prev,
                            String(item.id),
                          ])
                        }}
                        className="cursor-pointer"
                      >
                        {item.value}
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
