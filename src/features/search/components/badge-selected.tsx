import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { AutocompleteItem } from '@/features/search/types/filters'
import { Badge } from '@/components/ui/badge'

interface BadgeListProps {
  items: Array<AutocompleteItem>
  onItemRemove: (item: AutocompleteItem) => void
  onClearAll: () => void
  showClearAll?: boolean
  sortBy?: 'value' | 'id'
}
/**
 * A controlled checkbox list component that displays selected items with individual
 * remove checkboxes and an optional "Clear All" button.
 * To use in:
 * - filter-autocomplete
 * - filter-select
 *
 * @param props - The component props
 * @returns JSX element containing the checkbox list
 */
export const BadgeSelected = memo(function FilterCheckboxSelected({
  items,
  onItemRemove,
  onClearAll,
  showClearAll = true,
  sortBy = 'value',
}: BadgeListProps) {
  console.log('BadgeSelected rendered with items:', items)

  const { t } = useTranslation()

  const shouldShowClearAll = showClearAll
  // sort items alphabetically by value
  let sortedItems = []
  if (sortBy === 'id') {
    sortedItems = [...items].sort((a, b) => a.id - b.id)
  } else {
    sortedItems = [...items].sort((a, b) =>
      String(a.value).localeCompare(String(b.value)),
    )
  }

  return (
    <div className="pl-1 text-sm flex flex-col gap-1">
      <div className="flex flex-col gap-1">
        {sortedItems.map((item) => (
          <Badge
            key={item.value}
            variant="secondary"
            className="bg-background dark:bg-input border-input text-xs font-normal cursor-pointer hover:bg-background/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring "
            onClick={() => onItemRemove(item)}
            tabIndex={0}
            role="button"
            aria-label={`Remove ${String(item.value)} filter`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onItemRemove(item)
              }
            }}
          >
            <X className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[220px]">{String(item.value)}</span>
          </Badge>
        ))}
      </div>
      {shouldShowClearAll && (
        <Badge
          variant="destructive"
          onClick={onClearAll}
          className="bg-red-600/10 dark:bg-red-600/20 hover:bg-red-600/5 text-red-500 border-red-600/60 shadow-none self-start text-xs font-normal cursor-pointer transition-colors focus-visible:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive"
          tabIndex={0}
          role="button"
          aria-label="Clear all filters"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClearAll()
            }
          }}
        >
          {t('search.filters.clear-all')}
        </Badge>
      )}
    </div>
  )
})
