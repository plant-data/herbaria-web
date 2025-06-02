import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { AutocompleteItem } from '@/features/search/types/filters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BadgeListProps {
  items: Array<AutocompleteItem>
  onItemRemove: (item: AutocompleteItem) => void
  onClearAll: () => void
  showClearAll?: boolean
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
}: BadgeListProps) {

  const { t } = useTranslation()

  const shouldShowClearAll = showClearAll
  // sort items alphabetically by value
  const sortedItems = [...items].sort((a, b) =>
    String(a.value).localeCompare(String(b.value)),
  )

  return (
    <div className="group pl-1 text-sm flex flex-col gap-1">
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
            <span className="truncate max-w-[220px]">
              {String(item.value)}
            </span>
          </Badge>
        ))}
      </div>
      {shouldShowClearAll && (
        <Badge
          variant="destructive"
          onClick={onClearAll}
          className="bg-destructive/5 text-primary border-destructive self-start text-xs font-normal cursor-pointer hover:bg-destructive/30 transition-colors focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive"
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