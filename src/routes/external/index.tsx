import { createFileRoute, redirect } from '@tanstack/react-router'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

/**
 * This route handles external links that redirect to the search page
 * It allaws a small set of parameters to be passed in the URL
 * Useful to link florItaly names to the search page
 * Example usage:
 * /external/?floritalyName=Olea europaea L.
 */
export const Route = createFileRoute('/external/')({
  component: RouteComponent,
  validateSearch: (search) =>
    search as {
      floritalyName: string
    },
  loaderDeps: ({ search: { floritalyName } }) => ({
    floritalyName,
  }),
  loader: ({ deps: { floritalyName } }) => {
    useFilterStore.getState().resetFilters()
    useFilterStore.getState().resetMap()
    if (floritalyName) {
      useFilterStore.getState().setFloritalyName([floritalyName])
      useFilterStore.getState().setCountryCode(['IT'])
      throw redirect({
        to: '/$herbariaId/search',
        params: { herbariaId: 'all'},
      })
    }
    return {}
  },
})

function RouteComponent() {
  return <div>Invalid external URL</div>
}
