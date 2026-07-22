import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { LoaderCircle, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { BadgeSelected } from '@/features/search/components/badge-selected'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { buildLocalFilterParams, fetchLocalityCount } from '@/features/search/api/local-backend'

interface LocalityFilterProps {
  label: string
  placeholder: string
  // The committed locality: zero or one free-text value.
  value: Array<string>
  onValueChange: React.Dispatch<React.SetStateAction<Array<string>>>
  minLength?: number
}

/**
 * The locality filter, working like the reference dashboard: a free-text box, not
 * a facet dropdown. Type a place fragment (at least `minLength` characters), see
 * how many specimens carry it under the other applied filters, then press Enter
 * or click the count to commit it — matched full-text against the locality field.
 * The committed value shows as a removable chip.
 */
export function LocalityFilter({ label, placeholder, value, onValueChange, minLength = 3 }: LocalityFilterProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const query = text.trim()
  const debouncedQuery = useDebounce(query, 350)
  const inputRef = useRef<HTMLInputElement>(null)

  // The other applied filters, so the previewed count is conditional; the
  // committed locality is dropped so the number is for the text being typed.
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
  const params = buildLocalFilterParams(source, { excludeLocality: true })

  const enabled = open && debouncedQuery.length >= minLength
  const {
    data: count,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['locality-count', debouncedQuery, JSON.stringify(params)],
    queryFn: ({ signal }) => fetchLocalityCount(debouncedQuery, params, signal),
    enabled,
    retry: false,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60,
    gcTime: 24 * 60 * 60,
  })

  // The count is current only when it is the count for the text now in the box.
  const counting = query.length >= minLength && (isFetching || debouncedQuery !== query)
  const settled = enabled && !isFetching && debouncedQuery === query && count !== undefined

  const commit = useCallback(
    (q: string) => {
      if (q.length < minLength) return
      onValueChange([q])
      setText('')
      setOpen(false)
    },
    [minLength, onValueChange],
  )

  const handleRemove = useCallback(() => {
    onValueChange([])
    inputRef.current?.focus()
  }, [onValueChange])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit(query)
    } else if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  return (
    <div>
      <div className="pl-1 text-sm font-semibold">{label}</div>

      <BadgeSelected items={value} onItemRemove={handleRemove} onClearAll={handleRemove} showClearAll={false} />

      <div className="relative">
        <div className="relative py-1">
          <div className="absolute top-1/2 left-2 -translate-y-1/2">
            {counting ? (
              <LoaderCircle className="text-ring h-4 w-4 shrink-0 animate-spin opacity-80" />
            ) : (
              <Search className="text-muted-foreground h-4 w-4 shrink-0" />
            )}
          </div>
          <input
            ref={inputRef}
            autoComplete="off"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input bg-background flex h-[34px] w-full min-w-0 rounded-md border py-2 pr-3 pl-7 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-sm disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            )}
          />
        </div>

        {open && query !== '' && (
          <div className="bg-popover text-popover-foreground animate-in absolute top-full z-10 w-full rounded-md border p-1 text-sm shadow-sm outline-none">
            {query.length < minLength ? (
              <div className="text-muted-foreground px-2 py-1.5 text-xs">
                {t('search.filters.autocomplete-min-length', { number: minLength })}
              </div>
            ) : counting ? (
              <div className="text-muted-foreground px-2 py-1.5 text-xs">{t('search.filters.loading-data')}</div>
            ) : error ? (
              <div className="text-muted-foreground px-2 py-1.5 text-xs">
                {t('search.filters.locality-count-unavailable')}
              </div>
            ) : settled ? (
              <div
                role="button"
                tabIndex={0}
                className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5"
                onMouseDown={(e) => {
                  // Before blur closes the dropdown, or the click lands on nothing.
                  e.preventDefault()
                  commit(debouncedQuery)
                }}
              >
                <span className="truncate">{debouncedQuery}</span>
                <span className="text-muted-foreground ml-auto shrink-0 pl-2 text-xs tabular-nums">
                  {t('search.filters.locality-matches', { count })}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
