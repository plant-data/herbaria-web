import React from 'react'
import { Link, useParams, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { HERBARIA } from '@/features/search/constants/constants'

export function BreadcrumbResponsive() {
  const { location } = useRouterState()
  const { herbariaId, occurrenceID } = useParams({ strict: false })
  const { t } = useTranslation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const getHerbariumName = (id: string) => {
    const herbarium = HERBARIA.find((h) => h.id === id)
    console.log('herbarium', herbarium)
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
    if (occurrenceID && segment === occurrenceID) {
      return t('navbar.specimen') + ' ' + occurrenceID
    }
    const name = breadcrumbNameMap[segment]
    if (typeof name === 'function') {
      return name(segment)
    }
    return name || segment
  }

  if (pathnames.length === 0) {
    return null
  }
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">{t('navbar.home')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((value, index) => {
          let to = `/${pathnames.slice(0, index + 1).join('/')}`
          let isLast = index === pathnames.length - 1
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
                    <Link to={to}>{name}</Link>
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
