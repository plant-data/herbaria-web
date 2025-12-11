import { HeadContent, Outlet, Scripts, createRootRouteWithContext, useParams } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'
import TanStackQueryLayout from '@/integrations/tanstack-query/layout'
import { Header } from '@/components/header'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { BASE_PATH } from '@/config'

interface MyRouterContext {
  queryClient: QueryClient
}

function RootComponent() {
  const params = useParams({ strict: false })
  const herbariaId = 'herbariaId' in params ? (params as { herbariaId: string }).herbariaId : undefined

  const ringColor = HERBARIA_CONFIG.find((h) => h.id === herbariaId)?.ringColor

  const style = { '--ring': ringColor } as React.CSSProperties

  return (
    <>
      <HeadContent />
      <div style={style}>
        <Header />

        <Outlet />
        {/* <TanStackRouterDevtools position="top-right" /> */}

        <TanStackQueryLayout />
      </div>
      <Scripts />
    </>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'UTF-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'description',
        content: 'Herbaria - Digital Herbarium Collections Portal',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'Herbaria',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: `${BASE_PATH}/favicon/favicon.ico`,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: `${BASE_PATH}/favicon/favicon.svg`,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: `${BASE_PATH}/favicon/favicon-96x96.png`,
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: `${BASE_PATH}/favicon/apple-touch-icon.png`,
      },
      {
        rel: 'manifest',
        href: `${BASE_PATH}/favicon/site.webmanifest`,
      },
    ],
  }),
  component: RootComponent,
})
