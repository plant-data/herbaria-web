import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BadgeSelected } from '@/features/search/components/badge-selected'

export interface FilterItem {
  id: number | string
  value: string
}

interface SelectItemsProps {
  label: string
  placeholder: string
  items: Array<FilterItem>
  selectedValues: Array<number> | Array<string>
  onSelectedValuesChange:
    | React.Dispatch<React.SetStateAction<Array<number>>>
    | React.Dispatch<React.SetStateAction<Array<string>>>
  allSelectedMessage: string
}

/**
 * Optimized SelectItems component with performance improvements:
 * - Memoized translations to prevent re-translation on every render
 * - Optimized filtering and selection operations
 * - Lazy rendering when dropdown is open
 */
export function SelectItems({
  label,
  placeholder,
  items,
  selectedValues = [],
  onSelectedValuesChange,
  allSelectedMessage,
}: SelectItemsProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLButtonElement>(null)

  // Pre-compute translated items once to avoid repeated translations
  const translatedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      translatedValue: t(item.value),
    }))
  }, [items, t])

  // Memoize selected items with translations
  const selectedItems = useMemo(() => {
    return selectedValues
      .map((id) => {
        const foundItem = translatedItems.find((item) => item.id === id)
        return foundItem?.translatedValue || null
      })
      .filter(Boolean) as Array<string>
  }, [selectedValues, translatedItems])

  // Memoize available items (not selected)
  const availableItems = useMemo(() => {
    const selectedIds = new Set(selectedValues.map(String))
    return translatedItems.filter((item) => !selectedIds.has(String(item.id)))
  }, [selectedValues, translatedItems])

  const handleUnselect = useCallback(
    (itemValue: string) => {
      const originalItem = translatedItems.find((item) => item.translatedValue === itemValue)
      if (originalItem) {
        onSelectedValuesChange((prev: any) => prev.filter((id: any) => id !== originalItem.id))
      }
      inputRef.current?.focus()
    },
    [onSelectedValuesChange, translatedItems],
  )

  const handleClearAll = useCallback(() => {
    onSelectedValuesChange([] as any)
    inputRef.current?.focus()
  }, [onSelectedValuesChange])

  const handleSelect = useCallback(
    (itemId: string) => {
      const originalItem = translatedItems.find((item) => item.id.toString() === itemId)

      if (originalItem) {
        const isAlreadySelected = selectedValues.some((id) => id === originalItem.id)
        if (!isAlreadySelected) {
          onSelectedValuesChange((prev: any) => [...prev, originalItem.id])
        }
      }
      setOpen(false)
    },
    [selectedValues, onSelectedValuesChange, translatedItems],
  )

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
  }, [])

  const isAllSelected = availableItems.length === 0
  const placeholderText = isAllSelected ? t(allSelectedMessage) : placeholder

  return (
    <div className="max-w-full">
      <div className="pl-1 text-sm font-semibold">{label}</div>

      <BadgeSelected
        items={selectedItems}
        onItemRemove={handleUnselect}
        onClearAll={handleClearAll}
        showClearAll={selectedValues.length > 1}
      />

      <div className="py-1">
        <Select
          data-form-type="other"
          open={open}
          onOpenChange={handleOpenChange}
          onValueChange={handleSelect}
          value=""
        >
          <SelectTrigger
            ref={inputRef}
            className={cn('bg-background h-8 w-full max-w-full', isAllSelected && 'cursor-not-allowed opacity-50')}
            disabled={isAllSelected}
            onKeyDown={(e) => {
              const allowedKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Escape', 'Tab']
              if (!allowedKeys.includes(e.key)) {
                e.preventDefault()
              }
            }}
          >
            <SelectValue placeholder={placeholderText} />
          </SelectTrigger>
          <SelectContent>
            {open &&
              availableItems.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.translatedValue}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
