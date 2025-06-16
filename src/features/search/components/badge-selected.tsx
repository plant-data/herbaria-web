import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { AutocompleteItem } from '@/features/search/components/autocomplete'
import { Badge } from '@/components/ui/badge'

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

  return (
    <div className="flex flex-col gap-1 pl-1 text-sm">
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <Badge
            key={item}
            variant="secondary"
            className="bg-background dark:bg-input border-input hover:bg-background/80 focus:ring-ring cursor-pointer text-xs font-normal transition-colors focus:ring-2 focus:outline-none"
            onClick={() => onItemRemove(item)}
            tabIndex={0}
            role="button"
            aria-label={`Remove ${item} filter`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onItemRemove(item)
              }
            }}
          >
            <X className="mr-1 h-3 w-3" />
            <span className="max-w-[220px] truncate">{item}</span>
          </Badge>
        ))}
      </div>
      {shouldShowClearAll && (
        <Badge
          variant="destructive"
          onClick={onClearAll}
          className="focus-visible:border-destructive focus:ring-destructive cursor-pointer self-start border-red-600/60 bg-red-600/10 text-xs font-normal text-red-500 shadow-none transition-colors hover:bg-red-600/5 focus:ring-2 focus:outline-none dark:bg-red-600/20"
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
