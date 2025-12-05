import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, MoreHorizontalIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useDebouncedCallback } from '@/hooks/use-debounce'

interface PaginationProps {
  count: number
  limit: number
  skip: number
  setSkip: (skip: number) => void
}

export function Pagination({ count, limit, skip, setSkip }: PaginationProps) {
  const [localSkip, setLocalSkip] = useState(skip)
  const { t } = useTranslation()

  useEffect(() => {
    setLocalSkip(skip)
  }, [skip])

  const debouncedSetSkip = useDebouncedCallback((value: number) => {
    setSkip(value)
  }, 300)

  // Validate inputs
  if (count === 0 || limit <= 0) {
    return null
  }

  // Normalize skip to ensure it's aligned with limit and non-negative
  const normalizedSkip = Math.max(0, Math.floor(localSkip / limit) * limit)
  const page = Math.floor(normalizedSkip / limit) + 1
  const totalPages = Math.ceil(count / limit)
  const firstPageSkip = 0

  // Helper function to handle pagination click with scroll to top
  const handlePageChange = (newSkip: number) => {
    setLocalSkip(newSkip)
    debouncedSetSkip(newSkip)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <div className="my-2 flex h-[50px] items-center justify-between">
      <div className="text-muted-foreground flex-1 text-sm">
        {t('search.results.page')} {page} {t('search.results.of')} {totalPages}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="hidden h-8 w-8 p-0 active:bg-transparent disabled:opacity-30 lg:flex"
            onClick={() => handlePageChange(firstPageSkip)}
            disabled={page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 active:bg-transparent disabled:opacity-30"
            onClick={() => handlePageChange(Math.max(0, normalizedSkip - limit))}
            disabled={page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          {/* pages buttons */}
          {page === totalPages && totalPages >= 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="active:bg-transparent"
              onClick={() => handlePageChange(Math.max(0, normalizedSkip - 2 * limit))}
            >
              {page - 2}
            </Button>
          )}
          {page !== 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="active:bg-transparent"
              onClick={() => handlePageChange(Math.max(0, normalizedSkip - limit))}
            >
              {page - 1}
            </Button>
          )}
          <Button variant="outline" size="sm" className="active:bg-transparent">
            {page}
          </Button>
          {page !== totalPages && (
            <Button
              variant="ghost"
              size="sm"
              className="active:bg-transparent"
              onClick={() => handlePageChange(normalizedSkip + limit)}
            >
              {page + 1}
            </Button>
          )}
          {page === 1 && totalPages >= 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="active:bg-transparent"
              onClick={() => handlePageChange(normalizedSkip + 2 * limit)}
            >
              {page + 2}
            </Button>
          )}
          {/* Show ellipsis only when there are hidden pages beyond what's visible */}
          {totalPages > 3 && page < totalPages - 1 && (
            <span aria-hidden data-slot="pagination-ellipsis" className="flex size-9 items-center justify-center">
              <MoreHorizontalIcon className="size-4" />
              <span className="sr-only">More pages</span>
            </span>
          )}
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 active:bg-transparent"
            onClick={() => handlePageChange(normalizedSkip + limit)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
