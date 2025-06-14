import { Link, useLocation, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import {
  ChartColumn,
  Image,
  LoaderCircle,
  MapPinned,
  Table,
} from 'lucide-react'
import { useSpecimensData } from '@/features/search/api/get-occurrences'
import { cn } from '@/lib/utils'

export function SpecimensNavbar() {
  const location = useLocation()
  const params = useParams({ strict: false })

  const navItems = useMemo(() => {
    const herbariaId = 'herbariaId' in params ? params.herbariaId : null
    const basePath = herbariaId ? `/${herbariaId}/search` : '/search'

    return [
      { path: `${basePath}/table`, icon: Table, label: 'Table' },
      { path: basePath, icon: Image, label: 'Images' },
      { path: `${basePath}/map`, icon: MapPinned, label: 'Map' },
      { path: `${basePath}/graphs`, icon: ChartColumn, label: 'Graphs' },
    ]
  }, [params])

  return (
    <div className="flex gap-2 flex-col justify-center @lg:flex-row @lg:justify-between items-center">
      <div className="flex justify-center">
        <ResultOccurrencesCounter />
      </div>

      <div className="flex justify-center">
        <nav className="flex gap-2 p-0.5 bg-muted dark:bg-card rounded-lg dark:border dark:border-input">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              preload="intent"
              className={cn(
                'flex items-center gap-2 px-1 @xs:px-2 @sm:px-3 py-[7px] rounded-md text-xs font-medium transition-colors',
                'hover:bg-background hover:shadow-sm',
                location.pathname === path
                  ? 'bg-background shadow-sm text-foreground dark:border dark:border-input'
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
    <div className="text-sm text-muted-foreground flex gap-2">
      {data.count} Occurrences
      {isFetching && (
        <LoaderCircle className="h-4 w-4 shrink-0 text-ring opacity-80 animate-spin" />
      )}
    </div>
  )
}
