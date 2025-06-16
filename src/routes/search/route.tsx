import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react' // Added import
import { useTranslation } from 'react-i18next'
import type { FilterState } from '@/features/search/stores/use-filters-store'
import { SearchSidebar } from '@/features/search/components/search-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { SpecimensNavbar } from '@/features/search/components/specimens-navbar'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { useNavigationHistory } from '@/hooks/use-navigation-history' // Added import

export const Route = createFileRoute('/search')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const resetFilters = useFilterStore(
    (state: FilterState) => state.resetFilters,
  )
  const { previousRoute } = useNavigationHistory() // Use the hook

  useEffect(() => {
    // necessario per resettare i filtri quando vengo da route esterne

    const shouldReset =
      previousRoute &&
      !previousRoute.startsWith('/search') &&
      !previousRoute.startsWith('/specimens') &&
      !previousRoute.startsWith('/external')

    if (shouldReset) {
      console.log(
        'Resetting filters because previous route was:',
        previousRoute,
      )
      resetFilters()
    }
  }, [previousRoute, resetFilters])

  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <SearchSidebar />
        <SidebarInset>
          <div className="@container px-4 pt-4 pb-2 md:px-6">
            <SpecimensNavbar />
            <Outlet />
          </div>
        </SidebarInset>
      </div>
      <SidebarTrigger
        className="hover:bg-background fixed bottom-3 left-3 z-[51]"
        textShow={t('search.filters.show-filters')}
        textHide={t('search.filters.hide-filters')}
      ></SidebarTrigger>
    </SidebarProvider>
  )
}
