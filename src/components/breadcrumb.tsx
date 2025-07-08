import React from 'react'
import { Link, useParams, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { HERBARIA } from '@/features/search/constants/constants'
import { useIsMobile } from '@/hooks/use-mobile'

export function BreadcrumbResponsive({
  onLinkClick,
}: {
  onLinkClick?: () => void
}) {
  const { location } = useRouterState()
  const { herbariaId, occurrenceID } = useParams({ strict: false })
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const getHerbariumName = (id: string) => {
    const herbarium = HERBARIA.find((h) => h.id === id)
    return herbarium ? t(herbarium.value) : id
  }

  const breadcrumbNameMap: { [key: string]: string | ((s: string) => string) } =
    {
      search: t('navbar.search'),
      map: t('navbar.map'),
      graphs: t('navbar.graphs'),
      table: t('navbar.table'),
      specimens: t('navbar.specimen'),
    }

  const getBreadcrumbName = (segment: string) => {
    if (herbariaId && segment === herbariaId) {
      return getHerbariumName(segment)
    }
    if (
      location.pathname.includes('/specimens/') &&
      pathnames[pathnames.length - 1] === segment &&
      segment !== 'specimens'
    ) {
      return t('navbar.specimen')
    }
    const name = breadcrumbNameMap[segment]
    if (typeof name === 'function') {
      return name(segment)
    }
    return name || segment
  }

  if (pathnames.length === 0) {
    if (isMobile) {
      return (
        <div className="bg-muted/30 flex items-center gap-3 rounded-lg px-3 py-2">
          <Home className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">{t('navbar.home')}</span>
        </div>
      )
    }
    return null
  }

  // Mobile view - vertical layout
  if (isMobile) {
    const allSegments = [
      { to: '/', name: t('navbar.home'), isLast: false },
      ...pathnames.map((value, index) => {
        let to = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        let name = getBreadcrumbName(value)

        if (value === 'specimens') {
          to = to.replace('specimens', 'search')
          name = t('navbar.search')
        }

        return { to, name, isLast }
      }),
    ]

    return (
      <div className="flex flex-col gap-2">
        {allSegments.map((segment, index) => (
          <div key={segment.to + index} className="flex flex-col">
            <div className="flex items-center gap-2">
              <ChevronRight className="text-muted-foreground h-3 w-3" />
              <div className="flex-1">
                {segment.isLast ? (
                  <div className="bg-muted/50 border-input rounded-lg border px-3 py-2">
                    <span className="text-ring text-sm font-medium">
                      {segment.name}
                    </span>
                  </div>
                ) : (
                  <Link
                    to={segment.to}
                    className="hover:bg-muted/50 group block rounded-lg px-3 py-2 transition-colors"
                    onClick={onLinkClick}
                  >
                    <span className="group-hover:text-foreground text-sm font-medium">
                      {segment.name}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Desktop view - horizontal layout (original)
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" onClick={onLinkClick}>
              {t('navbar.home')}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((value, index) => {
          let to = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          let name = getBreadcrumbName(value)

          if (value === 'specimens') {
            // replace specimens with search
            to = to.replace('specimens', 'search')
            name = t('navbar.search')
          }

          return (
            <React.Fragment key={to + index}>
              <BreadcrumbSeparator key={to + index} />
              <BreadcrumbItem key={to}>
                {isLast ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to} onClick={onLinkClick}>
                      {name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
