import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontalIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  count: number
  limit: number
  skip: number
  setSkip: (skip: number) => void
}

export function Pagination({ count, limit, skip, setSkip }: PaginationProps) {
  const page = skip === 0 ? 1 : Math.floor(skip / limit) + 1
  const totalPages = Math.ceil(count / limit)
  const firstPageSkip = 0
  const lastPageSkip = Math.max(0, (totalPages - 1) * limit)

  if (count === 0) {
    return
  }

  return (
    <div className="h-[50px] flex items-center justify-between my-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setSkip(firstPageSkip)}
            disabled={page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="ghost"
            className="hidden lg:flex h-8 w-8 p-0"
            onClick={() => setSkip(skip - limit)}
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
              onClick={() => setSkip(skip - 2 * limit)}
            >
              {page - 2}
            </Button>
          )}
          {page !== 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSkip(skip - limit)}
            >
              {page - 1}
            </Button>
          )}
          <Button variant="outline" size="sm">
            {page}
          </Button>
          {page !== totalPages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSkip(skip + limit)}
            >
              {page + 1}
            </Button>
          )}
          {page === 1 && totalPages >= 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSkip(skip + 2 * limit)}
            >
              {page + 2}
            </Button>
          )}
          {page !== totalPages && (
            <span
              aria-hidden
              data-slot="pagination-ellipsis"
              className="flex size-9 items-center justify-center"
            >
              <MoreHorizontalIcon className="size-4" />
              <span className="sr-only">More pages</span>
            </span>
          )}
          <Button
            variant="ghost"
            className="hidden lg:flex h-8 w-8 p-0"
            onClick={() => setSkip(skip + limit)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setSkip(lastPageSkip)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
