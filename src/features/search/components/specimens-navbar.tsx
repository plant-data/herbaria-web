import { Link, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChartColumn, Image, LoaderCircle, MapPinned, Table } from 'lucide-react'
import { useSpecimensCount } from '@/features/search/api/get-occurrences'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function SpecimensNavbar() {
  const { t } = useTranslation()
  const params = useParams({ strict: false })

  const navItems = useMemo(() => {
    const herbariaId = 'herbariaId' in params ? params.herbariaId : null
    const basePath = herbariaId ? `/${herbariaId}/search` : `/search`

    return [
      { path: `${basePath}/table`, icon: Table, label: t('search.results.nav-table'), exact: false },
      { path: basePath, icon: Image, label: t('search.results.nav-images'), exact: true },
      { path: `${basePath}/map`, icon: MapPinned, label: t('search.results.nav-map'), exact: false },
      { path: `${basePath}/graphs`, icon: ChartColumn, label: t('search.results.nav-graphs'), exact: false },
    ]
  }, [params, t])

  return (
    <div className="flex flex-col items-center justify-center gap-2 @lg:flex-row @lg:justify-between">
      <div className="flex justify-center">
        <ResultOccurrencesCounter />
      </div>

      <div className="flex justify-center">
        <nav className="bg-muted dark:bg-card dark:border-input flex gap-2 rounded-lg p-0.5 dark:border">
          {navItems.map(({ path, icon: Icon, label, exact }) => (
            <Link
              key={path}
              to={path}
              params={{ herbariaId: params.herbariaId }}
              className="flex items-center gap-2 rounded-md px-2 py-[7px] text-xs font-medium transition-colors"
              activeOptions={exact ? { exact: true } : undefined}
              activeProps={{
                className: cn('bg-background text-foreground dark:border-input shadow-sm dark:border'),
              }}
              inactiveProps={{
                className: cn('text-muted-foreground hover:bg-background hover:shadow-sm'),
              }}
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
  const { data, isPending, isFetching, error } = useSpecimensCount()

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
