import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { FilterStateData } from '@/features/search/stores/use-filters-store'
import { SearchSidebar } from '@/features/search/components/search-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { SpecimensNavbar } from '@/features/search/components/specimens-navbar'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

type LockedFilters = Array<
  keyof Omit<FilterStateData, 'skip' | 'activeFiltersCount'>
>

export const Route = createFileRoute('/$herbariaId/search')({
  component: RouteComponent,
  loader: () => {
    const { setMonth } = useFilterStore.getState()
    setMonth([1, 2])
  },
})

function RouteComponent() {
  const { t } = useTranslation()

  const lockedFilters: LockedFilters = ['month']

  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <SearchSidebar lockedFilters={lockedFilters} />
        <SidebarInset>
          <div className="@container px-4 pt-4 pb-2  md:px-6">
            <SpecimensNavbar />
            <Outlet />
          </div>
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
