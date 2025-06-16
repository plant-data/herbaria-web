import { useEffect } from 'react'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type {
  FilterState,
  LockedFilters,
} from '@/features/search/stores/use-filters-store'
import { SearchSidebar } from '@/features/search/components/search-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { SpecimensNavbar } from '@/features/search/components/specimens-navbar'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { useNavigationHistory } from '@/hooks/use-navigation-history' // Added import

export const Route = createFileRoute('/$herbariaId/search')({
  component: RouteComponent,
  loader: async ({ params }) => {
    // importante che sia async
    const { setInstitutionCode } = useFilterStore.getState()
    await setInstitutionCode([params.herbariaId])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const resetFilters = useFilterStore(
    (state: FilterState) => state.resetFilters,
  )
  const setInstitutionCode = useFilterStore(
    (state: FilterState) => state.setInstitutionCode,
  )
  const { previousRoute } = useNavigationHistory()
  const { herbariaId } = Route.useParams()

  useEffect(() => {
    // necessario per resettare i filtri quando vengo da route esterne

    const shouldReset =
      previousRoute &&
      !previousRoute.startsWith(`/${herbariaId}/search`) &&
      !previousRoute.startsWith(`/specimens`) &&
      !previousRoute.startsWith(`/external`)

    if (shouldReset) {
      console.log(
        'Resetting filters because previous route was:',
        previousRoute,
      )
      resetFilters()
      setInstitutionCode([herbariaId])
    }
  }, [previousRoute, resetFilters, setInstitutionCode, herbariaId])

  const lockedFilters: LockedFilters = ['institutionCode']

  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <SearchSidebar lockedFilters={lockedFilters} />
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
