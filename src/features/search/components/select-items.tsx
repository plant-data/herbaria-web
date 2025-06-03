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
  id: number
  value: string
}

interface SelectItemsProps {
  label: string
  placeholder: string
  items: Array<FilterItem>
  sortBy?: 'value' | 'id'
  selectedValues: Array<number>
  onSelectedValuesChange: React.Dispatch<React.SetStateAction<Array<number>>>
  allSelectedMessage: string
}

export function SelectItems({
  label,
  placeholder,
  items,
  sortBy = 'value',
  selectedValues = [],
  onSelectedValuesChange,
  allSelectedMessage
}: SelectItemsProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLButtonElement>(null)

  const handleUnselect = useCallback(
    (item: FilterItem) => {
      onSelectedValuesChange((prev) => prev.filter((id) => id !== item.id))
      inputRef.current?.focus()
    },
    [onSelectedValuesChange],
  )

  const handleClearAll = useCallback(() => {
    onSelectedValuesChange([])
    inputRef.current?.focus()
  }, [onSelectedValuesChange])

  const handleSelect = useCallback(
    (itemId: string) => {
      const id = parseInt(itemId)
      const isAlreadySelected = selectedValues.includes(id)
      if (!isAlreadySelected) {
        onSelectedValuesChange((prev) => [...prev, id])
      }
      setOpen(false)
    },
    [selectedValues, onSelectedValuesChange],
  )

  // Convert selected IDs to FilterItem objects with translated values
  const selectedItems = selectedValues
    .map((id) => {
      const item = items.find((item) => item.id === id)
      return item ? { ...item, value: t(item.value) } : null
    })
    .filter(Boolean) as Array<FilterItem>

  const selectedIds = new Set(selectedValues)
  const availableItems = items.filter((item) => !selectedIds.has(item.id))

  return (
    <div className="max-w-full">
      <div className="text-sm font-semibold pl-1">{label}</div>

      {/* 1: badge part */}
      <BadgeSelected
        items={selectedItems}
        onItemRemove={handleUnselect}
        onClearAll={handleClearAll}
        showClearAll={selectedValues.length > 1}
        sortBy={sortBy}
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
              'h-8 w-full max-w-full bg-background',
              availableItems.length === 0 && 'opacity-50 cursor-not-allowed',
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