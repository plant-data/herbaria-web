import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  const handleUnselect = useCallback(
    (itemValue: string) => {
      // Find the original item by matching the translated value
      const originalItem = items.find((item) => t(item.value) === itemValue)
      if (originalItem) {
        onSelectedValuesChange((prev) =>
          prev.filter((id) => id !== originalItem.id),
        )
      }
      inputRef.current?.focus()
    },
    [onSelectedValuesChange, items, t],
  )

  const handleClearAll = useCallback(() => {
    onSelectedValuesChange([])
    inputRef.current?.focus()
  }, [onSelectedValuesChange])

  const handleSelect = useCallback(
    (itemId: string) => {
      // Find the original item to get its actual ID (string or number)
      const originalItem = items.find((item) => item.id.toString() === itemId)

      if (originalItem) {
        const isAlreadySelected = selectedValues.includes(originalItem.id)
        if (!isAlreadySelected) {
          onSelectedValuesChange((prev) => [...prev, originalItem.id] as any)
        }
      }
      setOpen(false)
    },
    [selectedValues, onSelectedValuesChange, items],
  )

  // Convert selected IDs to translated strings for BadgeSelected
  const selectedItems = selectedValues
    .map((id) => {
      const foundItem = items.find((item) => item.id === id)
      return foundItem ? t(foundItem.value) : null
    })
    .filter(Boolean) as Array<string>

  const selectedIds = new Set(selectedValues)
  const availableItems = items.filter((item) => !selectedIds.has(item.id))

  return (
    <div className="max-w-full">
      <div className="pl-1 text-sm font-semibold">{label}</div>

      {/* 1: badge part */}
      <BadgeSelected
        items={selectedItems}
        onItemRemove={handleUnselect}
        onClearAll={handleClearAll}
        showClearAll={selectedValues.length > 1}
      />

      {/* 2: select part */}
      <div className="py-1">
        <Select
          data-form-type="other"
          open={open}
          onOpenChange={setOpen}
          onValueChange={handleSelect}
          value=""
        >
          <SelectTrigger
            ref={inputRef}
            className={cn(
              'bg-background h-8 w-full max-w-full',
              availableItems.length === 0 && 'cursor-not-allowed opacity-50',
            )}
            disabled={availableItems.length === 0}
            onKeyDown={(e) => {
              // Only allow specific navigation keys
              const allowedKeys = [
                'ArrowDown',
                'ArrowUp',
                'Enter',
                ' ',
                'Escape',
                'Tab',
              ]
              if (!allowedKeys.includes(e.key)) {
                e.preventDefault()
              }
            }}
          >
            <SelectValue
              placeholder={
                availableItems.length === 0
                  ? t(allSelectedMessage)
                  : placeholder
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableItems.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {t(item.value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
