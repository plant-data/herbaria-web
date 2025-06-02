
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { FilterSidebar } from '@/features/search/components/filter-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
//import { ResultLayout } from '@/components/search/result-layout'

export const Route = createFileRoute('/search')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <FilterSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </div>
      <SidebarTrigger
        className="z-[51] fixed left-3 bottom-3 hover:bg-background"
        textShow={t('search.filters.show-filters')}
        textHide={t('search.filters.hide-filters')}
      ></SidebarTrigger>
    </SidebarProvider>
  )
}
