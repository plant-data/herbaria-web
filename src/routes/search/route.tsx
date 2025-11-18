import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SearchSidebar } from '@/features/search/components/search-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { SpecimensNavbar } from '@/features/search/components/specimens-navbar'
import { Footer } from '@/components/footer'

export const Route = createFileRoute('/search')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <SearchSidebar />
        <SidebarInset>
          <div className="@container/mainresult max-w-[1800px] min-h-[80vh] px-4 pt-4 pb-2 md:px-6">
            <SpecimensNavbar />
            <Outlet />
          </div>
          <Footer />
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
