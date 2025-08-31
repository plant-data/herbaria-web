import { Link, useLocation, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChartColumn, Image, LoaderCircle, MapPinned, Table } from 'lucide-react'
import { useSpecimensData } from '@/features/search/api/get-occurrences'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { BASE_PATH } from '@/config'

export function SpecimensNavbar() {
  const location = useLocation()
  const { t } = useTranslation()
  const params = useParams({ strict: false })

  const navItems = useMemo(() => {
    const herbariaId = 'herbariaId' in params ? params.herbariaId : null
    const basePath = herbariaId ? `${BASE_PATH}${herbariaId}/search` : `${BASE_PATH}search`

    return [
      { path: `${basePath}/table`, icon: Table, label: t('search.results.nav-table') },
      { path: basePath, icon: Image, label: t('search.results.nav-images') },
      { path: `${basePath}/map`, icon: MapPinned, label: t('search.results.nav-map') },
      { path: `${basePath}/graphs`, icon: ChartColumn, label: t('search.results.nav-graphs') },
    ]
  }, [params, t])  

  return (
    <div className="flex flex-col items-center justify-center gap-2 @lg:flex-row @lg:justify-between">
      <div className="flex justify-center">
        <ResultOccurrencesCounter />
      </div>

      <div className="flex justify-center">
        <nav className="bg-muted dark:bg-card dark:border-input flex gap-2 rounded-lg p-0.5 dark:border">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              from={'/'}
              params={{ herbariaId: params.herbariaId }}
              className={cn(
                'flex items-center gap-2 rounded-md px-1 py-[7px] text-xs font-medium transition-colors @xs:px-2 @sm:px-3',
                'hover:bg-background hover:shadow-sm',
                location.pathname === path
                  ? 'bg-background text-foreground dark:border-input shadow-sm dark:border'
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
    return (
      <div className="text-muted-foreground flex gap-2 text-sm">
        <Skeleton className="h-4 w-24" />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="text-muted-foreground flex gap-2 text-sm">
      {data.count} Occurrences
      {isFetching && <LoaderCircle className="text-ring h-4 w-4 shrink-0 animate-spin opacity-80" />}
    </div>
  )
}
