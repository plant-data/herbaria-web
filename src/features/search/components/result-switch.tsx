import { Link, useLocation } from '@tanstack/react-router'
import { Image, Table, MapPinned, ChartColumn } from 'lucide-react'
import useSearchOccurrences from '@/features/search/api/get-occurrences'
import { usePrepareFilters } from '@/features/search/hooks/use-prepare-filters'
import { cn } from '@/lib/utils'
import { ITEMS_PER_PAGE } from '@/config'

export function ResultSwitch() {
  const location = useLocation()

  const navItems = [
    { path: '/search/table', icon: Table, label: 'Table' },
    { path: '/search', icon: Image, label: 'Images' },
    { path: '/search/map', icon: MapPinned, label: 'Map' },
    { path: '/search/graphs', icon: ChartColumn, label: 'Graphs' },
  ]

  return (
    <div className="m-4">
      <div className="flex justify-center">
        <ResultOccurrencesCounter />
      </div>

      <div className="flex justify-center mt-4">
        <nav className="flex gap-2 p-1 bg-muted rounded-lg">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-colors',
                'hover:bg-background hover:shadow-sm',
                location.pathname === path
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

function ResultOccurrencesCounter() {
  const { filters, skip } = usePrepareFilters()
  const { data, isPending, error } = useSearchOccurrences(
    filters,
    { scientificName: 'asc' },
    ITEMS_PER_PAGE,
    skip,
  )

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="text-sm text-gray-500">{data.count} occurrences found</div>
  )
}
