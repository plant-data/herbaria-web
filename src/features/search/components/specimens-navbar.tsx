import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AlertCircle, ChartColumn, Image, LoaderCircle, MapPinned, Table } from 'lucide-react'
import { useSpecimensCount } from '@/features/search/api/get-occurrences'
import { Skeleton } from '@/components/ui/skeleton'

const navItems = [
  { path: '/$herbariaId/table', icon: Table, labelKey: 'search.results.nav-table' },
  { path: '/$herbariaId/images', icon: Image, labelKey: 'search.results.nav-images' },
  { path: '/$herbariaId/map', icon: MapPinned, labelKey: 'search.results.nav-map' },
  { path: '/$herbariaId/graphs', icon: ChartColumn, labelKey: 'search.results.nav-graphs' },
] as const

export function SpecimensNavbar() {
  const { t } = useTranslation()
  const { herbariaId } = useParams({ strict: false })

  return (
    <div className="flex flex-col items-center justify-center gap-2 @lg:flex-row @lg:justify-between">
      <div className="flex justify-center">
        <ResultOccurrencesCounter />
      </div>

      <div className="flex justify-center">
        <nav className="bg-muted dark:bg-card dark:border-input flex gap-2 rounded-lg p-0.5 dark:border">
          {navItems.map(({ path, icon: Icon, labelKey }) => (
            <Link
              key={path}
              to={path}
              params={{ herbariaId: herbariaId! }}
              className="flex items-center gap-2 rounded-md px-2 py-[7px] text-xs font-medium transition-colors"
              activeProps={{
                className: 'bg-background text-foreground dark:border-input shadow-sm dark:border',
              }}
              inactiveProps={{
                className: 'text-muted-foreground hover:bg-background hover:shadow-sm',
              }}
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

function ResultOccurrencesCounter() {
  const { data, isPending, isFetching, error } = useSpecimensCount()

  if (isPending) {
    return (
      <div className="text-muted-foreground flex gap-2 text-sm">
        <Skeleton className="h-5 w-24" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>Failed to get data</span>
      </div>
    )
  }

  return (
    <div className="text-muted-foreground flex gap-2 text-sm">
      {data.count} Occurrences
      {isFetching && <LoaderCircle className="text-ring h-4 w-4 shrink-0 animate-spin opacity-80" />}
    </div>
  )
}
