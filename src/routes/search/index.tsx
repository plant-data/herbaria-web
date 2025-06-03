import { createFileRoute } from '@tanstack/react-router'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

export const Route = createFileRoute('/search/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <>Hello</>
}