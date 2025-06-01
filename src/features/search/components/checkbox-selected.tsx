import { memo } from 'react'
import type { AutocompleteItem } from '@/features/search/types/filters'
import { Checkbox } from '@/components/ui/checkbox'

interface CheckboxListProps {
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
export const CheckboxSelected = memo(function FilterCheckboxSelected({
  items,
  onItemRemove,
  onClearAll,
  showClearAll = true,
}: CheckboxListProps) {
  const shouldShowClearAll = showClearAll
  // sort items alphabetically by value
  const sortedItems = [...items].sort((a, b) =>
    String(a.value).localeCompare(String(b.value)),
  )

  return (
    <div className="group pl-1 text-sm flex flex-col gap-1">
      {sortedItems.map((item) => (
        <div key={item.value} className="flex items-center space-x-1">
          <Checkbox
            id={String(item.value)}
            checked={true}
            onCheckedChange={() => onItemRemove(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onItemRemove(item)
              }
            }}
          />
          <label
            htmlFor={String(item.value)}
            className="overflow-hidden max-w-full text-ellipsis whitespace-nowrap text-xs font-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            {String(item.value)}
          </label>
        </div>
      ))}
      {shouldShowClearAll && (
        <div className="flex items-center space-x-1">
          <Checkbox
            id="clear-all"
            variant="delete"
            checked={true}
            onCheckedChange={onClearAll}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onClearAll()
              }
            }}
          />
          <label
            htmlFor="clear-all"
            className="text-xs font-sm leading-none text-destructive"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            Clear All
          </label>
        </div>
      )}
    </div>
  )
})
