import { Outlet, createFileRoute} from '@tanstack/react-router'
import { AppSidebar } from '@/components/sidebar/specimens-sidebar'
import { SidebarToggle } from '@/components//sidebar/sidebar-toggle'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ResultLayout } from '@/components/search/result-layout'

export const Route = createFileRoute('/search')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset>
          <ResultLayout>
            <Outlet />
          </ResultLayout>
        </SidebarInset>
      </div>
      <SidebarToggle />
    </SidebarProvider>
  )
}

