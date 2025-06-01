import { Outlet, createFileRoute } from '@tanstack/react-router'
import { FilterSidebar } from '@/features/search/components/filter-sidebar'
//import { SidebarToggle } from '@/components//sidebar/sidebar-toggle'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
//import { ResultLayout } from '@/components/search/result-layout'

export const Route = createFileRoute('/search')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <FilterSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </div>
      {/*  <SidebarToggle /> */}
    </SidebarProvider>
  )
}
