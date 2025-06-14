import {
  Outlet,
  createRootRouteWithContext,
  useParams,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'
import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx'
import { Header } from '@/components/header.tsx'
import { HeaderHerbarium } from '@/components/header-herbarium.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

function RootComponent() {
  const params = useParams({ strict: false })
  const herbariaId = 'herbariaId' in params ? params.herbariaId : null

  return (
    <>
      {herbariaId ? <HeaderHerbarium /> : <Header />}

      <Outlet />
      <TanStackRouterDevtools position="top-right" />

      <TanStackQueryLayout />
    </>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})
