import {
  Outlet,
  createRootRouteWithContext,
  useParams,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'
import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx'
import { Header } from '@/components/header.tsx'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

function RootComponent() {
  const params = useParams({ strict: false })
  const herbariaId = 'herbariaId' in params ? (params as { herbariaId: string }).herbariaId : undefined

  const ringColor = HERBARIA_CONFIG.find(h => h.id === herbariaId)?.ringColor

  const style = { '--ring': ringColor } as React.CSSProperties

  return (
    <div style={style}>
      <Header />

      <Outlet />
      {/* <TanStackRouterDevtools position="top-right" /> */}

      <TanStackQueryLayout />
    </div>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})
