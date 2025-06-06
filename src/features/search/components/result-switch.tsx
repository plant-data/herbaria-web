import { Link, useLocation } from '@tanstack/react-router'
import { ChartColumn, Image, MapPinned, Table } from 'lucide-react'
import { useSpecimensData } from '@/features/search/api/get-occurrences'
import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'

export function ResultSwitch() {
  const location = useLocation()

  const navItems = [
    { path: '/search/table', icon: Table, label: 'Table' },
    { path: '/search', icon: Image, label: 'Images' },
    { path: '/search/map', icon: MapPinned, label: 'Map' },
    { path: '/search/graphs', icon: ChartColumn, label: 'Graphs' },
  ]

  return (
    <div className="flex justify-between items-center">
      <div className="flex justify-center">
        <ResultOccurrencesCounter />
      </div>

      <div className="flex justify-center">
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
  const { data, isPending, isFetching, error } = useSpecimensData()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="text-sm text-gray-500 flex gap-2">
      {data.count} Occurrences
      {isFetching && (
        <LoaderCircle className="h-4 w-4 shrink-0 text-ring opacity-80 animate-spin" />
      )}
    </div>
  )
}
