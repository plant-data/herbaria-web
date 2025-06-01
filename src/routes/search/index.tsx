import { createFileRoute } from '@tanstack/react-router'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

export const Route = createFileRoute('/search/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { activeFiltersCount } = useFilterStore()
  return <div>Hello "/search/"! {activeFiltersCount}</div>
}
